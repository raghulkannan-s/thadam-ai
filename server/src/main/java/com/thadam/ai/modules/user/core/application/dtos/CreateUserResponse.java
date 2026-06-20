package com.thadam.ai.modules.user.core.application.dtos;

public record CreateUserResponse(
    String id,
    String name,
    String email
) {}
