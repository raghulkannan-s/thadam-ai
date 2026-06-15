package com.thadam.ai.roadmap.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.thadam.ai.roadmap.enums.MilestoneStatus;

public record MilestoneResponse(
    Long id,
    String title,
    String description,
    Long roadmapId,
    Integer orderIndex,
    LocalDate dueDate,
    MilestoneStatus status,
    int taskCount,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
