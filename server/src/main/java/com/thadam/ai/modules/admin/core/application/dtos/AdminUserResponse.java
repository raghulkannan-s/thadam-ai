package com.thadam.ai.modules.admin.core.application.dtos;

import com.thadam.ai.common.enums.Role;

public record AdminUserResponse(
    String id,
    String name,
    String email,
    Role role,
    boolean active
) {}
