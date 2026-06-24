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
    private final org.springframework.transaction.support.TransactionTemplate transactionTemplate;

    public RoadmapResponse generateRoadmap(com.thadam.ai.modules.roadmap.core.application.dtos.RoadmapGenerationRequest request, User user) {
        long startTime = System.currentTimeMillis();

        long currentBalance = ledgerService.getBalance(user.getId()).balance();
        int cost = Boolean.TRUE.equals(request.isRegeneration()) ? 3 : 10;
        if (currentBalance < cost) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Insufficient coins. This operation requires " + cost + " coins.");
        }

        if (request.prompt().length() > 2000) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Prompt too long. Maximum 2000 characters allowed.");
        }

        // Generate the roadmap synchronously — no stub, no async
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
                    log.warn("AI generation attempt {} failed: {}", attempt, ex.getMessage());
                    if (attempt == maxAttempts) {
                        throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                                "Roadmap generation failed after " + maxAttempts + " attempts. No coins were deducted. Please try again.");
                    }
                }
            }

            // Parse the AI response and create the real roadmap inside a small database transaction
            final String finalCleanedJson = cleanedJson;
            Roadmap roadmap = transactionTemplate.execute(status -> {
                Roadmap savedRoadmap = parseAndSave(finalCleanedJson, user, request);

                // Deduct coins only on success
                ledgerService.addTransaction(user, new CoinTransactionRequest(
                        cost,
                        TransactionType.SPENT,
                        Boolean.TRUE.equals(request.isRegeneration()) ? "AI Roadmap Regeneration" : "AI Roadmap Generation",
                        "ROADMAP_GENERATION",
                        null
                ));
                return savedRoadmap;
            });

            log.info("ROADMAP_GENERATION_COMPLETED userId={} roadmapId={} duration={}ms", user.getId(), roadmap.getId(), System.currentTimeMillis() - startTime);

            return roadmapService.getRoadmapById(roadmap.getPublicId(), user);

        } catch (ResponseStatusException e) {
            throw e; // Re-throw our own exceptions as-is
        } catch (Exception e) {
            log.error("ROADMAP_GENERATION_FAILED userId={}", user.getId(), e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Roadmap generation failed. No coins were deducted. Please try again.");
        }
    }

    private String cachedPromptTemplate;

    private String loadPromptTemplate() {
        if (cachedPromptTemplate != null) {
            return cachedPromptTemplate;
        }
        try {
            var resource = new ClassPathResource("prompts/roadmap-generation.txt");
            cachedPromptTemplate = new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
            return cachedPromptTemplate;
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
                    .durationWeeks(request.durationWeeks() != null ? request.durationWeeks() : (request.durationValue() != null ? request.durationValue() : 4))
                    .durationType(request.durationType() != null ? request.durationType() : "WEEKS")
                    .durationValue(request.durationValue() != null ? request.durationValue() : (request.durationWeeks() != null ? request.durationWeeks() : 4))
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
