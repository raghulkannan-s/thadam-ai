package com.thadam.ai.modules.user.core.application.dtos;

import com.thadam.ai.common.enums.Role;

public record UserResponse(
    Long id,
    String name,
    String email,
    Role role
) {}
