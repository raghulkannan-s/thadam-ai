package com.thadam.ai.models;

import java.time.Instant;
import java.time.LocalDate;

public class ChecklistItem {
    private long id;
    private long roadmapId;
    private String title;
    private String description;
    private String status;
    private LocalDate dueDate;
    private String priority;
    private int orderIndex;
    private Instant completedAt;
    private Instant createdAt;
    private Instant updatedAt;

    public ChecklistItem(long id, long roadmapId, String title, String description, String status, LocalDate dueDate,
                         String priority, int orderIndex, Instant completedAt, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.roadmapId = roadmapId;
        this.title = title;
        this.description = description;
        this.status = status;
        this.dueDate = dueDate;
        this.priority = priority;
        this.orderIndex = orderIndex;
        this.completedAt = completedAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public long getId() {
        return id;
    }

    public long getRoadmapId() {
        return roadmapId;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getStatus() {
        return status;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public String getPriority() {
        return priority;
    }

    public int getOrderIndex() {
        return orderIndex;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
