package com.thadam.ai.services;

import java.sql.Connection;
import java.sql.SQLException;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import com.thadam.ai.dao.ChecklistItemDao;
import com.thadam.ai.dao.RoadmapDao;
import com.thadam.ai.dto.ChecklistItemDto;
import com.thadam.ai.models.ChecklistItem;
import com.thadam.ai.utils.DbConnection;
import com.thadam.ai.utils.ValidationUtils;

public class ChecklistService {
    public List<ChecklistItemDto> listItems(long userId, long roadmapId) throws SQLException {
        try (Connection connection = DbConnection.getConnection()) {
            RoadmapDao roadmapDao = new RoadmapDao(connection);
            if (!roadmapDao.existsByIdAndUser(roadmapId, userId)) {
                throw new IllegalArgumentException("Roadmap not found");
            }
            ChecklistItemDao itemDao = new ChecklistItemDao(connection);
            List<ChecklistItemDto> results = new ArrayList<>();
            for (ChecklistItem item : itemDao.listByRoadmap(roadmapId)) {
                results.add(toDto(item));
            }
            return results;
        }
    }

    public ChecklistItemDto addItem(long userId, long roadmapId, String title, String description, LocalDate dueDate, String priority) throws SQLException {
        if (!ValidationUtils.isNonEmpty(title)) {
            throw new IllegalArgumentException("Title is required");
        }
        String normalizedPriority = normalizePriority(priority);

        try (Connection connection = DbConnection.getConnection()) {
            RoadmapDao roadmapDao = new RoadmapDao(connection);
            if (!roadmapDao.existsByIdAndUser(roadmapId, userId)) {
                throw new IllegalArgumentException("Roadmap not found");
            }
            ChecklistItemDao itemDao = new ChecklistItemDao(connection);
            int orderIndex = itemDao.nextOrderIndex(roadmapId);
            ChecklistItem item = new ChecklistItem(0, roadmapId, title, description, "PENDING", dueDate, normalizedPriority, orderIndex, null, Instant.now(), Instant.now());
            return toDto(itemDao.insertItem(roadmapId, item));
        }
    }

    public ChecklistItemDto updateItem(long userId, long itemId, String title, String description, String status, LocalDate dueDate, String priority) throws SQLException {
        try (Connection connection = DbConnection.getConnection()) {
            ChecklistItemDao itemDao = new ChecklistItemDao(connection);
            ChecklistItem existing = itemDao.findById(itemId);
            if (existing == null) {
                throw new IllegalArgumentException("Checklist item not found");
            }
            RoadmapDao roadmapDao = new RoadmapDao(connection);
            if (!roadmapDao.existsByIdAndUser(existing.getRoadmapId(), userId)) {
                throw new IllegalArgumentException("Roadmap not found");
            }
            String nextTitle = ValidationUtils.isNonEmpty(title) ? title : existing.getTitle();
            String nextDescription = description != null ? description : existing.getDescription();
            String nextStatus = normalizeStatus(status == null ? existing.getStatus() : status);
            String nextPriority = normalizePriority(priority == null ? existing.getPriority() : priority);
            Instant completedAt = "COMPLETED".equals(nextStatus) ? Instant.now() : null;

            itemDao.updateItem(itemId, nextTitle, nextDescription, nextStatus, dueDate, nextPriority, completedAt);
            ChecklistItem updated = itemDao.findById(itemId);
            return toDto(updated);
        }
    }

    private ChecklistItemDto toDto(ChecklistItem item) {
        return new ChecklistItemDto(item.getId(), item.getTitle(), item.getDescription(), item.getStatus(), item.getDueDate(), item.getPriority(), item.getOrderIndex());
    }

    public void deleteItem(long userId, long itemId) throws SQLException {
        try (Connection connection = DbConnection.getConnection()) {
            ChecklistItemDao itemDao = new ChecklistItemDao(connection);
            ChecklistItem existing = itemDao.findById(itemId);
            if (existing == null) {
                throw new IllegalArgumentException("Checklist item not found");
            }
            RoadmapDao roadmapDao = new RoadmapDao(connection);
            if (!roadmapDao.existsByIdAndUser(existing.getRoadmapId(), userId)) {
                throw new IllegalArgumentException("Roadmap not found");
            }
            itemDao.deleteById(itemId);
        }
    }


    private String normalizeStatus(String status) {
        if (status == null) {
            return "PENDING";
        }
        String normalized = status.trim().toUpperCase();
        if ("COMPLETED".equals(normalized) || "IN_PROGRESS".equals(normalized) || "PENDING".equals(normalized)) {
            return normalized;
        }
        return "PENDING";
    }

    private String normalizePriority(String priority) {
        if (priority == null) {
            return "MEDIUM";
        }
        String normalized = priority.trim().toUpperCase();
        if ("LOW".equals(normalized) || "MEDIUM".equals(normalized) || "HIGH".equals(normalized)) {
            return normalized;
        }
        return "MEDIUM";
    }
}
