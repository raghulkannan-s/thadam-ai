package com.thadam.ai.dto;

import java.util.List;

public class RoadmapDto {
    private long id;
    private String title;
    private String goal;
    private int durationWeeks;
    private String difficulty;
    private String status;
    private String detailJson;
    private List<ChecklistItemDto> checklist;

    public RoadmapDto(long id, String title, String goal, int durationWeeks, String difficulty, String status, String detailJson, List<ChecklistItemDto> checklist) {
        this.id = id;
        this.title = title;
        this.goal = goal;
        this.durationWeeks = durationWeeks;
        this.difficulty = difficulty;
        this.status = status;
        this.detailJson = detailJson;
        this.checklist = checklist;
    }

    public long getId() {
        return id;
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

    public List<ChecklistItemDto> getChecklist() {
        return checklist;
    }
}
