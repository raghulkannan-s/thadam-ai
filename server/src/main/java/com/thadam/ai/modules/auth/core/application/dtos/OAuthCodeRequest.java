package com.thadam.ai.modules.auth.core.application.dtos;

import jakarta.validation.constraints.NotBlank;

public record OAuthCodeRequest(
    @NotBlank(message = "Code is required")
    String code
) {}
