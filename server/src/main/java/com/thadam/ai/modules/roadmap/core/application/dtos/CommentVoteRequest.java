package com.thadam.ai.modules.roadmap.core.application.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record CommentVoteRequest(
    @NotBlank(message = "Vote type is required")
    @Pattern(regexp = "^(UPVOTE|DOWNVOTE)$", message = "Vote type must be UPVOTE or DOWNVOTE")
    String type
) {}
