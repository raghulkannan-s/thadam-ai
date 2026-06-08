package com.thadam.ai.dto;

public class RoadmapTaskDto {
    private long id;
    private String title;
    private String description;
    private int orderIndex;
    private Integer expectedDays;

    public RoadmapTaskDto(long id, String title, String description, int orderIndex, Integer expectedDays) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.orderIndex = orderIndex;
        this.expectedDays = expectedDays;
    }

    public long getId() {
        return id;
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
}
