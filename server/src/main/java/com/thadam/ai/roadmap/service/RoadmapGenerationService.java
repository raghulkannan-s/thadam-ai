package com.thadam.ai.roadmap.service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.thadam.ai.auth.entity.User;
import com.thadam.ai.common.audit.AuditService;
import com.thadam.ai.common.client.GeminiClient;
import com.thadam.ai.roadmap.dto.RoadmapResponse;
import com.thadam.ai.roadmap.entity.Milestone;
import com.thadam.ai.roadmap.entity.Roadmap;
import com.thadam.ai.roadmap.entity.Task;
import com.thadam.ai.roadmap.enums.TaskPriority;
import com.thadam.ai.roadmap.repository.MilestoneRepository;
import com.thadam.ai.roadmap.repository.RoadmapRepository;
import com.thadam.ai.roadmap.repository.TaskRepository;

import lombok.RequiredArgsConstructor;

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

    @Transactional
    public RoadmapResponse generateRoadmap(String userPrompt, User user) {
        long startTime = System.currentTimeMillis();
        MDC.put("userId", String.valueOf(user.getId()));

        log.info("ROADMAP_GENERATION_STARTED userId={} promptSize={} correlationId={}",
                user.getId(), userPrompt.length(), MDC.get("correlationId"));

        try {
            String promptTemplate = loadPromptTemplate();
            String fullPrompt = promptTemplate.replace("{userPrompt}", userPrompt);

            log.info("GEMINI_REQUEST_STARTED promptSize={} userId={} correlationId={}",
                    fullPrompt.length(), user.getId(), MDC.get("correlationId"));

            String geminiResponse = geminiClient.generateContent(fullPrompt);

            log.info("GEMINI_RESPONSE_RECEIVED responseSize={} userId={} correlationId={}",
                    geminiResponse.length(), user.getId(), MDC.get("correlationId"));

            String cleanedJson = cleanJsonResponse(geminiResponse);

            log.info("PARSE_STARTED userId={} correlationId={}",
                    user.getId(), MDC.get("correlationId"));

            validateJsonStructure(cleanedJson);

            log.info("VALIDATION_SUCCESS userId={} correlationId={}",
                    user.getId(), MDC.get("correlationId"));

            Roadmap roadmap = parseAndSave(cleanedJson, user);

            long duration = System.currentTimeMillis() - startTime;
            log.info("ROADMAP_GENERATION_COMPLETED userId={} roadmapId={} duration={}ms correlationId={}",
                    user.getId(), roadmap.getId(), duration, MDC.get("correlationId"));

            auditService.roadmapCreated(roadmap.getId(), roadmap.getTitle(), user.getId());

            return roadmapService.getRoadmapById(roadmap.getId());
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("ROADMAP_GENERATION_FAILED userId={} duration={}ms error={} correlationId={}",
                    user.getId(), duration, e.getMessage(), MDC.get("correlationId"));
            throw e;
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
        return trimmed.trim();
    }

    private Roadmap parseAndSave(String json, User user) {
        try {
            JsonNode root = objectMapper.readTree(json);

            Roadmap roadmap = Roadmap.builder()
                    .title(root.get("title").asText())
                    .description(root.has("description") ? root.get("description").asText() : null)
                    .user(user)
                    .build();
            roadmap = roadmapRepository.save(roadmap);

            JsonNode milestonesNode = root.get("milestones");
            if (milestonesNode != null && milestonesNode.isArray()) {
                for (JsonNode milestoneNode : milestonesNode) {
                    Milestone milestone = Milestone.builder()
                            .title(milestoneNode.get("title").asText())
                            .description(milestoneNode.has("description") ? milestoneNode.get("description").asText() : null)
                            .roadmap(roadmap)
                            .orderIndex(milestoneNode.has("orderIndex") ? milestoneNode.get("orderIndex").asInt() : 0)
                            .build();
                    milestone = milestoneRepository.save(milestone);

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
