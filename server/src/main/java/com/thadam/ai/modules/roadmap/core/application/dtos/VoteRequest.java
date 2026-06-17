package com.thadam.ai.modules.roadmap.core.application.dtos;

import com.thadam.ai.modules.roadmap.core.domain.enums.VoteType;

import jakarta.validation.constraints.NotNull;

public record VoteRequest(
    @NotNull
    VoteType voteType
) {}
