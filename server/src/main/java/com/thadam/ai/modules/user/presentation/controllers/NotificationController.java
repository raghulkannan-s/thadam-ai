package com.thadam.ai.modules.user.presentation.controllers;

import com.thadam.ai.common.dto.ApiResponse;
import com.thadam.ai.modules.auth.core.domain.entities.User;
import com.thadam.ai.modules.user.core.domain.entities.Notification;
import com.thadam.ai.modules.user.infrastructure.repositories.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
    
    private final NotificationRepository notificationRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Notification>>> getNotifications(
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(notificationRepository.findByUserId(user.getId(), pageable)));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setIsRead(true);
            notificationRepository.save(n);
        });
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
