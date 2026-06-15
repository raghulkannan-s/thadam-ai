package com.thadam.ai.roadmap.dto;

import java.time.LocalDateTime;

import com.thadam.ai.roadmap.enums.RoadmapStatus;

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
