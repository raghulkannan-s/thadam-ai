package com.thadam.ai.models;

import java.time.Instant;

public class Roadmap {
    private long id;
    private long userId;
    private String title;
    private String goal;
    private int durationWeeks;
    private String difficulty;
    private String status;
    private String detailJson;
    private Instant createdAt;
    private Instant updatedAt;

    public Roadmap(long id, long userId, String title, String goal, int durationWeeks, String difficulty, String status, String detailJson, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.userId = userId;
        this.title = title;
        this.goal = goal;
        this.durationWeeks = durationWeeks;
        this.difficulty = difficulty;
        this.status = status;
        this.detailJson = detailJson;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public long getId() {
        return id;
    }

    public long getUserId() {
        return userId;
    }

    public String getTitle() {
        return title;
    }

    public String getGoal() {
        return goal;
    }

    public int getDurationWeeks() {
        return durationWeeks;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public String getStatus() {
        return status;
    }

    public String getDetailJson() {
        return detailJson;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
