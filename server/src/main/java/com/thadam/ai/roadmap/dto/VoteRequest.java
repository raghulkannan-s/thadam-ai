package com.thadam.ai.roadmap.dto;

import com.thadam.ai.roadmap.enums.VoteType;

import jakarta.validation.constraints.NotNull;

public record VoteRequest(
    @NotNull
    VoteType voteType
) {}
