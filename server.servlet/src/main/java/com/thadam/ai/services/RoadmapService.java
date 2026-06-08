package com.thadam.ai.services;

import java.sql.Connection;
import java.sql.SQLException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import com.thadam.ai.dao.ChecklistItemDao;
import com.thadam.ai.dao.RoadmapDao;
import com.thadam.ai.dto.ChecklistItemDto;
import com.thadam.ai.dto.RoadmapDto;
import com.thadam.ai.models.ChecklistItem;
import com.thadam.ai.models.Roadmap;
import com.thadam.ai.utils.DbConnection;
import com.thadam.ai.utils.ValidationUtils;

public class RoadmapService {
    private final GeminiService geminiService = new GeminiService();

    public RoadmapDto generateRoadmap(long userId, String goal, int durationWeeks, String difficulty) throws Exception {
        if (!ValidationUtils.isNonEmpty(goal)) {
            throw new IllegalArgumentException("Goal is required");
        }
        if (durationWeeks < 1 || durationWeeks > 52) {
            throw new IllegalArgumentException("Duration must be between 1 and 52 weeks");
        }
        if (!ValidationUtils.isNonEmpty(difficulty)) {
            throw new IllegalArgumentException("Difficulty is required");
        }

        // Call AI service outside the transaction
        GeminiService.GeminiRoadmap aiRoadmap;
        try {
            aiRoadmap = geminiService.generateRoadmap(goal, durationWeeks, difficulty);
        } catch (IllegalStateException e) {
            throw new IllegalStateException("AI generation failed: " + e.getMessage());
        } catch (Exception e) {
            throw new IllegalStateException("Could not generate roadmap. Please try again later.");
        }

        if (aiRoadmap == null || aiRoadmap.getTasks() == null || aiRoadmap.getTasks().length == 0) {
            throw new IllegalStateException("AI did not return any tasks. Try rephrasing your goal.");
        }

        // Use transactional connection so roadmap + checklist items are atomic
        Connection connection = null;
        try {
            connection = DbConnection.getTransactionalConnection();

            RoadmapDao roadmapDao = new RoadmapDao(connection);
            ChecklistItemDao checklistDao = new ChecklistItemDao(connection);
            String detailJson = GeminiService.toJson(aiRoadmap);
            Roadmap roadmap = roadmapDao.insert(userId,
                aiRoadmap.getTitle() == null ? goal : aiRoadmap.getTitle(),
                goal,
                durationWeeks,
                difficulty,
                "ACTIVE",
                detailJson);

            List<ChecklistItem> items = new ArrayList<>();
            int index = 1;
            for (GeminiService.GeminiTask task : aiRoadmap.getTasks()) {
                if (task == null || !ValidationUtils.isNonEmpty(task.getTitle())) {
                    continue;
                }
                items.add(new ChecklistItem(0,
                    roadmap.getId(),
                    task.getTitle(),
                    task.getDescription(),
                    "PENDING",
                    null,
                    "MEDIUM",
                    index,
                    null,
                    Instant.now(),
                    Instant.now()));
                index++;
            }

            if (!items.isEmpty()) {
                checklistDao.insertItems(roadmap.getId(), items);
            }

            connection.commit();

            List<ChecklistItemDto> itemDtos = new ArrayList<>();
            for (ChecklistItem item : checklistDao.listByRoadmap(roadmap.getId())) {
                itemDtos.add(toChecklistDto(item));
            }
            return toRoadmapDto(roadmap, itemDtos);
        } catch (Exception e) {
            if (connection != null) {
                try {
                    connection.rollback();
                } catch (SQLException rollbackEx) {
                    // Log but don't mask original exception
                    rollbackEx.printStackTrace();
                }
            }
            throw e;
        } finally {
            if (connection != null) {
                try {
                    connection.close();
                } catch (SQLException closeEx) {
                    closeEx.printStackTrace();
                }
            }
        }
    }

    public List<RoadmapDto> listRoadmaps(long userId) throws SQLException {
        try (Connection connection = DbConnection.getConnection()) {
            RoadmapDao roadmapDao = new RoadmapDao(connection);
            ChecklistItemDao checklistDao = new ChecklistItemDao(connection);
            List<RoadmapDto> results = new ArrayList<>();
            for (Roadmap roadmap : roadmapDao.listByUser(userId)) {
                List<ChecklistItemDto> itemDtos = new ArrayList<>();
                for (ChecklistItem item : checklistDao.listByRoadmap(roadmap.getId())) {
                    itemDtos.add(toChecklistDto(item));
                }
                results.add(toRoadmapDto(roadmap, itemDtos));
            }
            return results;
        }
    }

    public void deleteRoadmap(long userId, long roadmapId) throws SQLException {
        try (Connection connection = DbConnection.getConnection()) {
            RoadmapDao roadmapDao = new RoadmapDao(connection);
            if (!roadmapDao.existsByIdAndUser(roadmapId, userId)) {
                throw new IllegalArgumentException("Roadmap not found");
            }
            ChecklistItemDao checklistDao = new ChecklistItemDao(connection);
            checklistDao.deleteByRoadmap(roadmapId);
            roadmapDao.deleteById(roadmapId);
        }
    }

    private RoadmapDto toRoadmapDto(Roadmap roadmap, List<ChecklistItemDto> checklist) {
        return new RoadmapDto(roadmap.getId(), roadmap.getTitle(), roadmap.getGoal(),
            roadmap.getDurationWeeks(), roadmap.getDifficulty(), roadmap.getStatus(),
            roadmap.getDetailJson(), checklist);
    }

    private ChecklistItemDto toChecklistDto(ChecklistItem item) {
        return new ChecklistItemDto(item.getId(), item.getTitle(), item.getDescription(),
            item.getStatus(), item.getDueDate(), item.getPriority(), item.getOrderIndex());
    }
}
