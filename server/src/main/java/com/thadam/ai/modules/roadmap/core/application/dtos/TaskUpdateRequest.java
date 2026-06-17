package com.thadam.ai.modules.roadmap.core.application.dtos;

import java.time.LocalDate;

import com.thadam.ai.modules.roadmap.core.domain.enums.TaskPriority;
import com.thadam.ai.modules.roadmap.core.domain.enums.TaskStatus;

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
