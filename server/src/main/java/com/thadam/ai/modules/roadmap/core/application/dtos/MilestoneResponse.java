package com.thadam.ai.modules.roadmap.core.application.dtos;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.thadam.ai.modules.roadmap.core.domain.enums.MilestoneStatus;

public record MilestoneResponse(
    Long id,
    String title,
    String description,
    String roadmapId,
    Integer orderIndex,
    LocalDate dueDate,
    MilestoneStatus status,
    int taskCount,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
