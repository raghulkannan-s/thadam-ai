package com.thadam.ai.modules.roadmap.core.application.dtos;

import java.time.LocalDateTime;

import com.thadam.ai.modules.roadmap.core.domain.enums.RoadmapStatus;

public record RoadmapResponse(
    Long id,
    String title,
    String description,
    RoadmapStatus status,
    Long userId,
    int milestoneCount,
    int taskCount,
    Long forkedFromId,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
