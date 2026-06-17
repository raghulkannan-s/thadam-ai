package com.thadam.ai.modules.admin.core.application.dtos;

import com.thadam.ai.common.enums.Role;

public record AdminUserResponse(
    Long id,
    String name,
    String email,
    Role role,
    boolean active
) {}
