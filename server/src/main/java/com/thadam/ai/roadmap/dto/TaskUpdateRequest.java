package com.thadam.ai.roadmap.dto;

import java.time.LocalDate;

import com.thadam.ai.roadmap.enums.TaskPriority;
import com.thadam.ai.roadmap.enums.TaskStatus;

public record TaskUpdateRequest(
    String title,
    String description,
    Long milestoneId,
    Long assigneeId,
    TaskStatus status,
    TaskPriority priority,
    Integer orderIndex,
    LocalDate dueDate
) {}
