package com.thadam.ai.modules.admin.presentation.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.thadam.ai.modules.admin.core.application.dtos.AdminUserResponse;
import com.thadam.ai.modules.admin.core.application.dtos.ChangeRoleRequest;
import com.thadam.ai.modules.admin.core.application.services.AdminService;
import com.thadam.ai.common.dto.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MODERATOR')")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<AdminUserResponse>>> getAllUsers() {
        List<AdminUserResponse> users = adminService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse<AdminUserResponse>> getUserById(@PathVariable String id) {
        AdminUserResponse user = adminService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/users/{id}/blacklist")
    public ResponseEntity<ApiResponse<AdminUserResponse>> blacklistUser(@PathVariable String id) {
        AdminUserResponse user = adminService.blacklistUser(id);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/users/{id}/role")
    public ResponseEntity<ApiResponse<AdminUserResponse>> changeUserRole(
            @PathVariable String id,
            @Valid @RequestBody ChangeRoleRequest request) {
        AdminUserResponse user = adminService.changeUserRole(id, request);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/users/{id}/coins")
    public ResponseEntity<ApiResponse<Void>> adjustUserCoins(
            @PathVariable String id,
            @Valid @RequestBody com.thadam.ai.modules.admin.core.application.dtos.CoinAdjustmentRequest request) {
        adminService.adjustUserCoins(id, request);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
