package com.thadam.ai.roadmap.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.thadam.ai.roadmap.enums.TaskPriority;
import com.thadam.ai.roadmap.enums.TaskStatus;

public record TaskResponse(
    Long id,
    String title,
    String description,
    Long milestoneId,
    Long roadmapId,
    Long assigneeId,
    TaskStatus status,
    TaskPriority priority,
    Integer orderIndex,
    LocalDate dueDate,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
