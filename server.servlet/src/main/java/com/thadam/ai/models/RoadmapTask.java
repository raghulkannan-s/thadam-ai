package com.thadam.ai.models;

import java.time.Instant;

public class RoadmapTask {
    private long id;
    private long roadmapId;
    private String title;
    private String description;
    private int orderIndex;
    private Integer expectedDays;
    private Instant createdAt;
    private Instant updatedAt;

    public RoadmapTask(long id, long roadmapId, String title, String description, int orderIndex, Integer expectedDays, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.roadmapId = roadmapId;
        this.title = title;
        this.description = description;
        this.orderIndex = orderIndex;
        this.expectedDays = expectedDays;
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

    public int getOrderIndex() {
        return orderIndex;
    }

    public Integer getExpectedDays() {
        return expectedDays;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
