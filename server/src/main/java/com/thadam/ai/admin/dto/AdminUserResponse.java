package com.thadam.ai.admin.dto;

import com.thadam.ai.common.enums.Role;

public record AdminUserResponse(
    Long id,
    String name,
    String email,
    Role role,
    boolean active
) {}
