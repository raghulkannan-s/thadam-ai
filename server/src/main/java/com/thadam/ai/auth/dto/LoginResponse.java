package com.thadam.ai.auth.dto;

public record LoginResponse(
    String accessToken,
    String refreshToken
) {}
