package com.thadam.ai.roadmap.dto;

import java.time.LocalDateTime;

import com.thadam.ai.roadmap.enums.RoadmapStatus;

public record CommunityRoadmapResponse(
    Long id,
    String title,
    String description,
    RoadmapStatus status,
    Long userId,
    String userName,
    int milestoneCount,
    int taskCount,
    long upvoteCount,
    long downvoteCount,
    String userVote,
    Long forkedFromId,
    int forkCount,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
