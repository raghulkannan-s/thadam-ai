package com.thadam.ai.modules.user.core.application.dtos;

public record CreateUserResponse(
    Long id,
    String name,
    String email
) {}
