package com.thadam.ai.auth.controller;

import org.slf4j.MDC;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.thadam.ai.auth.dto.LoginRequest;
import com.thadam.ai.auth.dto.LoginResponse;
import com.thadam.ai.auth.dto.RefreshTokenRequest;
import com.thadam.ai.auth.dto.RegisterRequest;
import com.thadam.ai.auth.dto.RegisterResponse;
import com.thadam.ai.auth.entity.User;
import com.thadam.ai.auth.service.AuthService;
import com.thadam.ai.common.dto.ApiResponse;
import com.thadam.ai.user.dto.UserResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<RegisterResponse>> register(
            @Valid @RequestBody RegisterRequest request) {

        RegisterResponse response = authService.register(request);

        return ResponseEntity.ok(
                new ApiResponse<>(true, "User registered successfully!", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request) {

        LoginResponse response = authService.login(request);

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Login successful", response));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<LoginResponse>> refresh(
            @Valid @RequestBody RefreshTokenRequest request) {

        LoginResponse response = authService.refresh(request);

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Token refreshed successfully", response));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Object>> logout(
            @AuthenticationPrincipal User user) {

        MDC.put("userId", String.valueOf(user.getId()));
        authService.logout(user);

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Logged out successfully", null));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> currentUser(
            @AuthenticationPrincipal User user) {

        MDC.put("userId", String.valueOf(user.getId()));

        UserResponse response = new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole());

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Current User", response));
    }
}
