package com.thadam.ai.modules.roadmap.core.application.dtos;

import com.thadam.ai.modules.roadmap.core.domain.enums.VoteType;

public record VoteResponse(
    Long id,
    String userId,
    String roadmapId,
    VoteType voteType,
    long upvoteCount,
    long downvoteCount
) {}
