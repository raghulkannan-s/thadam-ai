package com.thadam.ai.modules.roadmap.core.application.dtos;

import java.time.LocalDateTime;

import com.thadam.ai.modules.roadmap.core.domain.enums.RoadmapStatus;
import com.thadam.ai.modules.roadmap.core.domain.enums.RoadmapVisibility;

public record CommunityRoadmapResponse(
    String id,
    String title,
    String description,
    RoadmapStatus status,
    RoadmapVisibility visibility,
    String userId,
    String userName,
    String difficulty,
    Integer durationWeeks,
    Double estimatedHoursPerDay,
    java.time.LocalDateTime startDate,
    int milestoneCount,
    int taskCount,
    long upvoteCount,
    long downvoteCount,
    String userVote,
    String forkedFromId,
    int forkCount,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
