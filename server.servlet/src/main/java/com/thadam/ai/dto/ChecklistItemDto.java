package com.thadam.ai.dto;

import java.time.LocalDate;

public class ChecklistItemDto {
    private long id;
    private String title;
    private String description;
    private String status;
    private LocalDate dueDate;
    private String priority;
    private int orderIndex;

    public ChecklistItemDto(long id, String title, String description, String status, LocalDate dueDate, String priority, int orderIndex) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.status = status;
        this.dueDate = dueDate;
        this.priority = priority;
        this.orderIndex = orderIndex;
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
}
