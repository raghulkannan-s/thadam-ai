package com.thadam.ai.modules.user.core.application.dtos;

public record PublicUserResponse(
    String id,
    String name,
    String email,
    String role,
    long roadmapCount,
    String avatarUrl,
    int coins,
    int verificationScore
) {}
