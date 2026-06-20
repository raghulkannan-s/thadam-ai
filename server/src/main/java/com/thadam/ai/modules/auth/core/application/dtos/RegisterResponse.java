package com.thadam.ai.modules.auth.core.application.dtos;

public record RegisterResponse(
    Long id,
    String name,
    String email,
    String accessToken,
    String refreshToken
) {
    public RegisterResponse withoutRefreshToken() {
        return new RegisterResponse(id, name, email, accessToken, null);
    }
}
