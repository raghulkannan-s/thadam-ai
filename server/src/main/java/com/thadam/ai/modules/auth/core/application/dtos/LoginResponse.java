package com.thadam.ai.modules.auth.core.application.dtos;

public record LoginResponse(
    String accessToken,
    String refreshToken
) {
    public static LoginResponse accessOnly(String accessToken) {
        return new LoginResponse(accessToken, null);
    }
}
