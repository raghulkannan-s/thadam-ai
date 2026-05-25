package com.thadam.ai.dto;

import java.util.List;

public class RoadmapDto {
    private long id;
    private String title;
    private String goal;
    private int durationWeeks;
    private String difficulty;
    private String status;
    private List<RoadmapTaskDto> tasks;

    public RoadmapDto(long id, String title, String goal, int durationWeeks, String difficulty, String status, List<RoadmapTaskDto> tasks) {
        this.id = id;
        this.title = title;
        this.goal = goal;
        this.durationWeeks = durationWeeks;
        this.difficulty = difficulty;
        this.status = status;
        this.tasks = tasks;
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

    public List<RoadmapTaskDto> getTasks() {
        return tasks;
    }
}
