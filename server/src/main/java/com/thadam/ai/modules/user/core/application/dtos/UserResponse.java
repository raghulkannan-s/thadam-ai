package com.thadam.ai.modules.user.core.application.dtos;

import com.thadam.ai.common.enums.Role;

public record UserResponse(
    String id,
    String name,
    String email,
    Role role,
    String avatarUrl,
    int coins,
    com.thadam.ai.common.enums.SubscriptionPlan plan
) {}
