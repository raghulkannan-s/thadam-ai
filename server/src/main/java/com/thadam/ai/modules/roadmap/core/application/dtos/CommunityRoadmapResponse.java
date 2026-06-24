package com.thadam.ai.modules.roadmap.core.application.dtos;

import java.time.LocalDateTime;

import com.thadam.ai.modules.roadmap.core.domain.enums.RoadmapStatus;
import com.thadam.ai.modules.roadmap.core.domain.enums.RoadmapVisibility;
import com.thadam.ai.modules.roadmap.core.domain.enums.RoadmapCategory;

public record CommunityRoadmapResponse(
    String id,
    String title,
    String shortTitle,
    String description,
    RoadmapStatus status,
    RoadmapVisibility visibility,
    RoadmapCategory category,
    String userId,
    String userName,
    String userAvatarUrl,
    String difficulty,
    Integer durationWeeks,
    String durationType,
    Integer durationValue,
    Double estimatedHoursPerDay,
    java.time.LocalDateTime startDate,
    int milestoneCount,
    int taskCount,
    int commentCount,
    long upvoteCount,
    long downvoteCount,
    String userVote,
    String forkedFromId,
    Boolean hasForked,
    int forkCount,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
