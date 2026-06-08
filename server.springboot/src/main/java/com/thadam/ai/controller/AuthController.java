package com.thadam.ai.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.thadam.ai.dto.ApiResponse;
import com.thadam.ai.dto.LoginRequest;
import com.thadam.ai.dto.LoginResponse;
import com.thadam.ai.dto.RegisterRequest;
import com.thadam.ai.dto.RegisterResponse;
import com.thadam.ai.dto.UserResponse;
import com.thadam.ai.entity.User;
import com.thadam.ai.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<RegisterResponse>> register(
        @Valid @RequestBody RegisterRequest request
    ){

        RegisterResponse response = authService.register(request);

        return ResponseEntity.ok(
            new ApiResponse<>(
                true,
                "User registered successfully!",
                response
            )
        );
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
        @Valid @RequestBody LoginRequest request
    ){
        LoginResponse response = authService.login(request);

        return ResponseEntity.ok(
            new ApiResponse<>(
                true,
                "Login successful",
                response
            )
        );

    }
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> currentUser( @AuthenticationPrincipal User user ) {

        UserResponse response = new UserResponse(
                    user.getId(),
                    user.getName(),
                    user.getEmail()
            );

        return ResponseEntity.ok(
            new ApiResponse<>(
                    true,
                    "Current User",
                    response
            )
        );
    }
}
