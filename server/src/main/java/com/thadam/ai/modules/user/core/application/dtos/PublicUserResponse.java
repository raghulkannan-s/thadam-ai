package com.thadam.ai.modules.user.core.application.dtos;

public record PublicUserResponse(
    Long id,
    String name,
    String email,
    String role,
    long roadmapCount
) {}
