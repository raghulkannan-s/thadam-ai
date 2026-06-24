package com.thadam.ai.modules.roadmap.core.application.dtos;

import java.time.LocalDateTime;

import java.util.List;

public record CommentResponse(
    Long id,
    String content,
    String roadmapId,
    String userId,
    String userName,
    String userAvatarUrl,
    Integer upvoteCount,
    Integer downvoteCount,
    String userVote,
    List<CommentResponse> replies,
    LocalDateTime createdAt
) {}
