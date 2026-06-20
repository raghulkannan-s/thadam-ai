package com.thadam.ai.modules.auth.presentation.controllers;

import org.slf4j.MDC;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.thadam.ai.modules.auth.core.application.dtos.LoginRequest;
import com.thadam.ai.modules.auth.core.application.dtos.LoginResponse;
import com.thadam.ai.modules.auth.core.application.dtos.OAuthCodeRequest;
import com.thadam.ai.modules.auth.core.application.dtos.RefreshTokenRequest;
import com.thadam.ai.modules.auth.core.application.dtos.RegisterRequest;
import com.thadam.ai.modules.auth.core.application.dtos.RegisterResponse;
import com.thadam.ai.modules.auth.core.domain.entities.User;
import com.thadam.ai.modules.auth.infrastructure.security.RefreshTokenCookieService;
import com.thadam.ai.modules.auth.core.application.services.AuthService;
import com.thadam.ai.common.exception.UnauthorizedException;
import com.thadam.ai.common.dto.ApiResponse;
import com.thadam.ai.modules.user.core.application.dtos.UserResponse;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final RefreshTokenCookieService refreshTokenCookieService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<RegisterResponse>> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletResponse servletResponse) {

        RegisterResponse response = authService.register(request);
        refreshTokenCookieService.addRefreshTokenCookie(servletResponse, response.refreshToken());

        return ResponseEntity.ok(
                new ApiResponse<>(true, "User registered successfully!", response.withoutRefreshToken()));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse servletResponse) {

        LoginResponse response = authService.login(request);
        refreshTokenCookieService.addRefreshTokenCookie(servletResponse, response.refreshToken());

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Login successful", LoginResponse.accessOnly(response.accessToken())));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<LoginResponse>> refresh(
            @RequestBody(required = false) RefreshTokenRequest request,
            @CookieValue(value = RefreshTokenCookieService.COOKIE_NAME, required = false) String cookieRefreshToken,
            HttpServletResponse servletResponse) {

        String refreshToken = cookieRefreshToken;
        if ((refreshToken == null || refreshToken.isBlank()) && request != null) {
            refreshToken = request.refreshToken();
        }
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new UnauthorizedException("Refresh token is required");
        }

        LoginResponse response = authService.refresh(new RefreshTokenRequest(refreshToken));
        refreshTokenCookieService.addRefreshTokenCookie(servletResponse, response.refreshToken());

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Token refreshed successfully", LoginResponse.accessOnly(response.accessToken())));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Object>> logout(
            @AuthenticationPrincipal User user,
            HttpServletResponse servletResponse) {
        refreshTokenCookieService.clearRefreshTokenCookie(servletResponse);

        if (user == null) {
            return ResponseEntity.status(401)
                    .body(new ApiResponse<>(false, "Not authenticated", null));
        }

        try {
            MDC.put("userId", String.valueOf(user.getId()));
            authService.logout(user);

            return ResponseEntity.ok(
                    new ApiResponse<>(true, "Logged out successfully", null));
        } finally {
            MDC.remove("userId");
        }
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> currentUser(
            @AuthenticationPrincipal User user) {

        if (user == null) {
            return ResponseEntity.status(401)
                    .body(new ApiResponse<>(false, "Not authenticated", null));
        }

        try {
            MDC.put("userId", String.valueOf(user.getId()));

            UserResponse response = new UserResponse(
                    user.getPublicId(),
                    user.getName(),
                    user.getEmail(),
                    user.getRole(),
                    user.getAvatarUrl(),
                    user.getCoins());

            return ResponseEntity.ok(
                    new ApiResponse<>(true, "Current User", response));
        } finally {
            MDC.remove("userId");
        }
    }

    @PostMapping("/exchange-oauth-code")
    public ResponseEntity<ApiResponse<LoginResponse>> exchangeOAuthCode(
            @Valid @RequestBody OAuthCodeRequest request,
            HttpServletResponse servletResponse) {

        LoginResponse response = authService.exchangeOAuthCode(request);
        refreshTokenCookieService.addRefreshTokenCookie(servletResponse, response.refreshToken());

        return ResponseEntity.ok(
                new ApiResponse<>(true, "OAuth sign in successful", LoginResponse.accessOnly(response.accessToken())));
    }
}
