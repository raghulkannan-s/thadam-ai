package com.thadam.ai.modules.roadmap.core.application.services;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.thadam.ai.common.audit.AuditService;
import com.thadam.ai.common.client.GeminiClient;
import com.thadam.ai.modules.auth.core.domain.entities.User;
import com.thadam.ai.modules.ledger.core.application.dtos.CoinTransactionRequest;
import com.thadam.ai.modules.ledger.core.application.services.LedgerService;
import com.thadam.ai.modules.ledger.core.domain.enums.TransactionType;
import com.thadam.ai.modules.roadmap.core.application.dtos.RoadmapResponse;
import com.thadam.ai.modules.roadmap.core.domain.entities.Milestone;
import com.thadam.ai.modules.roadmap.core.domain.entities.Roadmap;
import com.thadam.ai.modules.roadmap.core.domain.entities.Task;
import com.thadam.ai.modules.roadmap.core.domain.enums.TaskPriority;
import com.thadam.ai.modules.roadmap.core.domain.enums.RoadmapVisibility;
import com.thadam.ai.modules.roadmap.infrastructure.repositories.MilestoneRepository;
import com.thadam.ai.modules.roadmap.infrastructure.repositories.RoadmapRepository;
import com.thadam.ai.modules.roadmap.infrastructure.repositories.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class RoadmapGenerationService {

    private static final Logger log = LoggerFactory.getLogger(RoadmapGenerationService.class);

    private static final int GENERATION_COST = 10;
    private static final int REGENERATION_COST = 5;

    private final GeminiClient geminiClient;
    private final ObjectMapper objectMapper;
    private final RoadmapRepository roadmapRepository;
    private final MilestoneRepository milestoneRepository;
    private final TaskRepository taskRepository;
    private final RoadmapService roadmapService;
    private final AuditService auditService;
    private final LedgerService ledgerService;
    private final RoadmapAsyncWorker roadmapAsyncWorker;
    private final org.springframework.transaction.support.TransactionTemplate transactionTemplate;

    @Transactional
    public RoadmapResponse generateRoadmap(com.thadam.ai.modules.roadmap.core.application.dtos.RoadmapGenerationRequest request, User user) {
        long currentBalance = ledgerService.getBalance(user.getId()).balance();
        int cost = Boolean.TRUE.equals(request.isRegeneration()) ? 3 : 10;
        if (currentBalance < cost) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Insufficient coins. This operation requires " + cost + " coins.");
        }

        if (request.prompt().length() > 2000) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Prompt too long. Maximum 2000 characters allowed.");
        }

        // Create a stub roadmap immediately
        Roadmap roadmap = Roadmap.builder()
                .title(Boolean.TRUE.equals(request.isRegeneration()) ? "Regenerating Roadmap..." : "Generating Roadmap...")
                .description("Our AI is crafting a custom roadmap. This usually takes 5-10 seconds.")
                .user(user)
                .category(request.category() != null ? com.thadam.ai.modules.roadmap.core.domain.enums.RoadmapCategory.valueOf(request.category()) : com.thadam.ai.modules.roadmap.core.domain.enums.RoadmapCategory.OTHER)
                .visibility(request.visibility() != null ? RoadmapVisibility.valueOf(request.visibility()) : RoadmapVisibility.PRIVATE)
                .status(com.thadam.ai.modules.roadmap.core.domain.enums.RoadmapStatus.GENERATING)
                .difficulty(request.difficulty())
                .durationWeeks(request.durationWeeks())
                .estimatedHoursPerDay(request.estimatedHoursPerDay())
                .startDate(request.startDate())
                .build();
        
        roadmap = roadmapRepository.save(roadmap);

        // Fire background task
        roadmapAsyncWorker.executeGenerationAsync(roadmap.getId(), request, user, MDC.get("correlationId"));

        return roadmapService.getRoadmapById(roadmap.getPublicId(), user);
    }

    public void processAsyncGeneration(Long roadmapId, com.thadam.ai.modules.roadmap.core.application.dtos.RoadmapGenerationRequest request, User user) {
        long startTime = System.currentTimeMillis();
        try {
            String promptTemplate = loadPromptTemplate();
            String fullPrompt = promptTemplate.replace("{userPrompt}", request.prompt());

            int maxAttempts = 3;
            String cleanedJson = null;

            for (int attempt = 1; attempt <= maxAttempts; attempt++) {
                try {
                    String geminiResponse = geminiClient.generateContent(fullPrompt);
                    cleanedJson = cleanJsonResponse(geminiResponse);
                    validateJsonStructure(cleanedJson);
                    break;
                } catch (Exception ex) {
                    if (attempt == maxAttempts) {
                        throw new RuntimeException("Validation failed after " + maxAttempts + " attempts: " + ex.getMessage(), ex);
                    }
                }
            }

            final String finalCleanedJson = cleanedJson;
            transactionTemplate.execute(status -> {
                Roadmap rm = roadmapRepository.findById(roadmapId).orElseThrow();
                parseAndUpdate(finalCleanedJson, rm, request);
                rm.setStatus(com.thadam.ai.modules.roadmap.core.domain.enums.RoadmapStatus.ACTIVE);
                roadmapRepository.save(rm);
                return null;
            });

            // Deduct coins only on success
            int cost = Boolean.TRUE.equals(request.isRegeneration()) ? 3 : 10;
            ledgerService.addTransaction(user, new CoinTransactionRequest(
                    cost,
                    TransactionType.SPENT,
                    Boolean.TRUE.equals(request.isRegeneration()) ? "AI Roadmap Regeneration" : "AI Roadmap Generation",
                    "ROADMAP_GENERATION",
                    null
            ));

            log.info("ROADMAP_GENERATION_COMPLETED userId={} roadmapId={} duration={}ms", user.getId(), roadmapId, System.currentTimeMillis() - startTime);
        } catch (Exception e) {
            log.error("ROADMAP_GENERATION_FAILED userId={} roadmapId={}", user.getId(), roadmapId, e);
            transactionTemplate.execute(status -> {
                roadmapRepository.findById(roadmapId).ifPresent(rm -> {
                    rm.setStatus(com.thadam.ai.modules.roadmap.core.domain.enums.RoadmapStatus.FAILED);
                    roadmapRepository.save(rm);
                });
                return null;
            });
        }
    }

    private String loadPromptTemplate() {
        try {
            var resource = new ClassPathResource("prompts/roadmap-generation.txt");
            return new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new RuntimeException("Failed to load prompt template", e);
        }
    }

    private void validateJsonStructure(String json) {
        try {
            JsonNode root = objectMapper.readTree(json);

            if (!root.has("title") || root.get("title").asText().isBlank()) {
                throw new IllegalArgumentException("Gemini response missing required field: title");
            }

            if (!root.has("milestones") || !root.get("milestones").isArray() || root.get("milestones").isEmpty()) {
                throw new IllegalArgumentException("Gemini response missing or empty milestones array");
            }

            for (int i = 0; i < root.get("milestones").size(); i++) {
                JsonNode ms = root.get("milestones").get(i);
                if (!ms.has("title") || ms.get("title").asText().isBlank()) {
                    throw new IllegalArgumentException("Milestone " + i + " missing required field: title");
                }
                if (ms.has("tasks") && ms.get("tasks").isArray()) {
                    for (int j = 0; j < ms.get("tasks").size(); j++) {
                        JsonNode task = ms.get("tasks").get(j);
                        if (!task.has("title") || task.get("title").asText().isBlank()) {
                            throw new IllegalArgumentException("Task " + j + " in milestone " + i + " missing required field: title");
                        }
                    }
                }
            }

            log.info("Gemini response structure validated successfully");
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to validate Gemini response JSON: " + e.getMessage(), e);
        }
    }

    private String cleanJsonResponse(String response) {
        String trimmed = response.trim();
        if (trimmed.startsWith("```json")) {
            trimmed = trimmed.substring(7);
        } else if (trimmed.startsWith("```")) {
            trimmed = trimmed.substring(3);
        }
        if (trimmed.endsWith("```")) {
            trimmed = trimmed.substring(0, trimmed.length() - 3);
        }
        trimmed = trimmed.trim();

        // Simple JSON repair heuristic for truncated Gemini responses
        if (!trimmed.endsWith("}")) {
            int openBraces = 0;
            int closeBraces = 0;
            int openBrackets = 0;
            int closeBrackets = 0;
            
            for (char c : trimmed.toCharArray()) {
                if (c == '{') openBraces++;
                if (c == '}') closeBraces++;
                if (c == '[') openBrackets++;
                if (c == ']') closeBrackets++;
            }
            
            // Auto-close open strings
            long quoteCount = trimmed.chars().filter(ch -> ch == '"').count();
            if (quoteCount % 2 != 0) {
                trimmed += "\"";
            }
            
            while (closeBrackets < openBrackets) {
                trimmed += "]}"; // Close objects inside arrays and then arrays
                closeBrackets++;
                closeBraces++; // assumed object inside array closed
            }
            
            while (closeBraces < openBraces) {
                trimmed += "}";
                closeBraces++;
            }
        }
        return trimmed.trim();
    }

    private void parseAndUpdate(String json, Roadmap roadmap, com.thadam.ai.modules.roadmap.core.application.dtos.RoadmapGenerationRequest request) {
        try {
            JsonNode root = objectMapper.readTree(json);

            roadmap.setTitle(root.get("title").asText());
            roadmap.setShortTitle(root.has("shortTitle") ? root.get("shortTitle").asText() : null);
            roadmap.setDescription(root.has("description") ? root.get("description").asText() : null);

            JsonNode milestonesNode = root.get("milestones");
            int mIndex = 1;
            for (JsonNode mNode : milestonesNode) {
                Milestone milestone = Milestone.builder()
                        .roadmap(roadmap)
                        .title(mNode.get("title").asText())
                        .description(mNode.has("description") ? mNode.get("description").asText() : null)
                        .orderIndex(mIndex++)
                        .build();
                milestone = milestoneRepository.save(milestone);

                if (mNode.has("tasks")) {
                    int tIndex = 1;
                    for (JsonNode tNode : mNode.get("tasks")) {
                        Task task = Task.builder()
                                .roadmap(roadmap)
                                .milestone(milestone)
                                .title(tNode.get("title").asText())
                                .description(tNode.has("description") ? tNode.get("description").asText() : null)
                                .priority(tNode.has("priority") ? TaskPriority.valueOf(tNode.get("priority").asText().toUpperCase()) : TaskPriority.MEDIUM)
                                .orderIndex(tIndex++)
                                .build();
                        taskRepository.save(task);
                    }
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse and update roadmap", e);
        }
    }

    private Roadmap parseAndSave(String json, User user, com.thadam.ai.modules.roadmap.core.application.dtos.RoadmapGenerationRequest request) {
        try {
            JsonNode root = objectMapper.readTree(json);

            Roadmap roadmap = Roadmap.builder()
                    .title(root.get("title").asText())
                    .shortTitle(root.has("shortTitle") ? root.get("shortTitle").asText() : null)
                    .description(root.has("description") ? root.get("description").asText() : null)
                    .user(user)
                    .category(request.category() != null ? parseCategory(request.category()) : parseCategory(root.has("category") ? root.get("category").asText() : "OTHER"))
                    .visibility(request.visibility() != null ? RoadmapVisibility.valueOf(request.visibility()) : RoadmapVisibility.DRAFT)
                    .difficulty(request.difficulty())
                    .durationWeeks(request.durationWeeks())
                    .estimatedHoursPerDay(request.estimatedHoursPerDay())
                    .startDate(request.startDate())
                    .build();
            roadmap = roadmapRepository.save(roadmap);

            JsonNode milestonesNode = root.get("milestones");
            if (milestonesNode != null && milestonesNode.isArray()) {
                List<Milestone> milestones = new ArrayList<>();
                for (JsonNode milestoneNode : milestonesNode) {
                    Milestone milestone = Milestone.builder()
                            .title(milestoneNode.get("title").asText())
                            .description(milestoneNode.has("description") ? milestoneNode.get("description").asText() : null)
                            .roadmap(roadmap)
                            .orderIndex(milestoneNode.has("orderIndex") ? milestoneNode.get("orderIndex").asInt() : 0)
                            .build();
                    milestones.add(milestone);
                }
                List<Milestone> savedMilestones = milestoneRepository.saveAll(milestones);

                for (int i = 0; i < savedMilestones.size(); i++) {
                    Milestone milestone = savedMilestones.get(i);
                    JsonNode milestoneNode = milestonesNode.get(i);
                    JsonNode tasksNode = milestoneNode.get("tasks");
                    if (tasksNode != null && tasksNode.isArray()) {
                        List<Task> tasks = new ArrayList<>();
                        for (JsonNode taskNode : tasksNode) {
                            Task task = Task.builder()
                                    .title(taskNode.get("title").asText())
                                    .description(taskNode.has("description") ? taskNode.get("description").asText() : null)
                                    .milestone(milestone)
                                    .roadmap(roadmap)
                                    .priority(parsePriority(taskNode.has("priority") ? taskNode.get("priority").asText() : "MEDIUM"))
                                    .build();
                            tasks.add(task);
                        }
                        taskRepository.saveAll(tasks);
                    }
                }
            }

            return roadmap;
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse Gemini response: " + e.getMessage(), e);
        }
    }

    private TaskPriority parsePriority(String value) {
        try {
            return TaskPriority.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            return TaskPriority.MEDIUM;
        }
    }

    private com.thadam.ai.modules.roadmap.core.domain.enums.RoadmapCategory parseCategory(String value) {
        try {
            return com.thadam.ai.modules.roadmap.core.domain.enums.RoadmapCategory.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            return com.thadam.ai.modules.roadmap.core.domain.enums.RoadmapCategory.OTHER;
        }
    }
}
