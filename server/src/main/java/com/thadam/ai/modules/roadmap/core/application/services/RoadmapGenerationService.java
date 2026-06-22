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

    private final GeminiClient geminiClient;
    private final ObjectMapper objectMapper;
    private final RoadmapRepository roadmapRepository;
    private final MilestoneRepository milestoneRepository;
    private final TaskRepository taskRepository;
    private final RoadmapService roadmapService;
    private final AuditService auditService;
    private final LedgerService ledgerService;

    @Transactional(timeout = 180)
    public RoadmapResponse generateRoadmap(com.thadam.ai.modules.roadmap.core.application.dtos.RoadmapGenerationRequest request, User user) {
        long startTime = System.currentTimeMillis();
        MDC.put("userId", String.valueOf(user.getId()));

        log.info("ROADMAP_GENERATION_STARTED userId={} promptSize={} correlationId={}",
                user.getId(), request.prompt().length(), MDC.get("correlationId"));

        try {
            long currentBalance = ledgerService.getBalance(user.getId()).balance();
            if (currentBalance < 10) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Insufficient coins. Generating a roadmap requires 10 coins.");
            }

            ledgerService.addTransaction(user, new CoinTransactionRequest(
                    10,
                    TransactionType.SPENT,
                    "AI Roadmap Generation",
                    "ROADMAP_GENERATION",
                    null
            ));

            String promptTemplate = loadPromptTemplate();
            String fullPrompt = promptTemplate.replace("{userPrompt}", request.prompt());

            int maxAttempts = 3;
            String cleanedJson = null;

            for (int attempt = 1; attempt <= maxAttempts; attempt++) {
                try {
                    log.info("GEMINI_REQUEST_STARTED attempt={} promptSize={} userId={} correlationId={}",
                            attempt, fullPrompt.length(), user.getId(), MDC.get("correlationId"));

                    String geminiResponse = geminiClient.generateContent(fullPrompt);

                    log.info("GEMINI_RESPONSE_RECEIVED attempt={} responseSize={} userId={} correlationId={}",
                            attempt, geminiResponse.length(), user.getId(), MDC.get("correlationId"));

                    cleanedJson = cleanJsonResponse(geminiResponse);

                    log.info("PARSE_STARTED attempt={} userId={} correlationId={}",
                            attempt, user.getId(), MDC.get("correlationId"));

                    validateJsonStructure(cleanedJson);

                    log.info("VALIDATION_SUCCESS attempt={} userId={} correlationId={}",
                            attempt, user.getId(), MDC.get("correlationId"));
                    break;
                } catch (Exception ex) {
                    if (attempt == maxAttempts) {
                        throw new RuntimeException("Validation failed after " + maxAttempts + " attempts: " + ex.getMessage(), ex);
                    }
                    log.warn("Gemini semantic generation/validation failed on attempt {}, retrying...", attempt, ex);
                }
            }

            Roadmap roadmap = parseAndSave(cleanedJson, user, request);

            long duration = System.currentTimeMillis() - startTime;
            log.info("ROADMAP_GENERATION_COMPLETED userId={} roadmapId={} duration={}ms correlationId={}",
                    user.getId(), roadmap.getId(), duration, MDC.get("correlationId"));

            auditService.roadmapCreated(roadmap.getId(), roadmap.getTitle(), user.getId());

            return roadmapService.getRoadmapById(roadmap.getPublicId(), user);
        } catch (Exception e) {
            try {
                ledgerService.addTransaction(user, new CoinTransactionRequest(
                        10,
                        TransactionType.REFUND,
                        "Refund for failed AI Roadmap Generation",
                        "ROADMAP_GENERATION",
                        null
                ));
            } catch (Exception refundEx) {
                log.error("Failed to refund coins for user {}", user.getId(), refundEx);
            }
            long duration = System.currentTimeMillis() - startTime;
            log.error("ROADMAP_GENERATION_FAILED userId={} duration={}ms error={} correlationId={}",
                    user.getId(), duration, e.getMessage(), MDC.get("correlationId"));
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to generate roadmap. Please try again with a simpler prompt.", e);
        } finally {
            MDC.remove("userId");
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

    private Roadmap parseAndSave(String json, User user, com.thadam.ai.modules.roadmap.core.application.dtos.RoadmapGenerationRequest request) {
        try {
            JsonNode root = objectMapper.readTree(json);

            Roadmap roadmap = Roadmap.builder()
                    .title(root.get("title").asText())
                    .description(root.has("description") ? root.get("description").asText() : null)
                    .user(user)
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
}
