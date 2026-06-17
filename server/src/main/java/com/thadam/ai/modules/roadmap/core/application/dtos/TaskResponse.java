package com.thadam.ai.modules.roadmap.core.application.dtos;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.thadam.ai.modules.roadmap.core.domain.enums.TaskPriority;
import com.thadam.ai.modules.roadmap.core.domain.enums.TaskStatus;

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
