package com.thadam.ai.admin.dto;

import com.thadam.ai.common.enums.Role;

import jakarta.validation.constraints.NotNull;

public record ChangeRoleRequest(
    @NotNull(message = "Role is required")
    Role role
) {}
