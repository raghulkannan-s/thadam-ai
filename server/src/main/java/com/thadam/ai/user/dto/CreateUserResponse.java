package com.thadam.ai.user.dto;

public record CreateUserResponse(
    Long id,
    String name,
    String email
) {}
