package com.thadam.ai.modules.user.presentation.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.thadam.ai.common.dto.ApiResponse;
import com.thadam.ai.modules.user.core.application.dtos.CreateUserRequest;
import com.thadam.ai.modules.user.core.application.dtos.CreateUserResponse;
import com.thadam.ai.modules.user.core.application.dtos.PublicUserResponse;
import com.thadam.ai.modules.user.core.application.dtos.UpdateUserRequest;
import com.thadam.ai.modules.user.core.application.dtos.UserResponse;
import com.thadam.ai.modules.user.core.application.services.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CreateUserResponse>> createUser(@Valid @RequestBody CreateUserRequest req) {

        CreateUserResponse response = userService.createUser(req);

        return ResponseEntity.ok(
                new ApiResponse<>(true, "User created successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable String id) {

        UserResponse fetchedUser = userService.getUserByPublicId(id);

        return ResponseEntity.ok(
                new ApiResponse<>(true, "User fetched successfully", fetchedUser));
    }

    @GetMapping("/public")
    public ResponseEntity<ApiResponse<List<PublicUserResponse>>> getPublicUsers() {
        List<PublicUserResponse> users = userService.getPublicUsers();
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {

        List<UserResponse> users = userService.getAllUsers();

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Fetched all users successfully", users));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable String id,
            @Valid @RequestBody UpdateUserRequest request) {

        UserResponse response = userService.updateUser(id, request);

        return ResponseEntity.ok(
                new ApiResponse<>(true, "User updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Object>> deleteUser(@PathVariable String id) {

        userService.deleteUser(id);

        return ResponseEntity.ok(
                new ApiResponse<>(true, "User deleted successfully", null));
    }
}
