package com.thadam.ai.roadmap.dto;

import com.thadam.ai.roadmap.enums.VoteType;

public record VoteResponse(
    Long id,
    Long userId,
    Long roadmapId,
    VoteType voteType,
    long upvoteCount,
    long downvoteCount
) {}
