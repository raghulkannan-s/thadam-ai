package com.thadam.ai.user.dto;

import com.thadam.ai.common.enums.Role;

public record UserResponse(
    Long id,
    String name,
    String email,
    Role role
) {}
