package com.thadam.ai.user.dto;

public record PublicUserResponse(
    Long id,
    String name,
    String email,
    String role,
    long roadmapCount
) {}
