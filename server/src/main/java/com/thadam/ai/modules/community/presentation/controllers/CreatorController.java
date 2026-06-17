package com.thadam.ai.modules.community.presentation.controllers;

import com.thadam.ai.common.dto.ApiResponse;
import com.thadam.ai.modules.auth.core.domain.entities.User;
import com.thadam.ai.modules.community.core.application.services.CreatorService;
import com.thadam.ai.modules.community.core.domain.entities.CreatorProfile;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/creators")
@RequiredArgsConstructor
public class CreatorController {

    private final CreatorService creatorService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<CreatorProfile>>> getTopCreators(
            @PageableDefault(sort = "totalViews", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(creatorService.getTopCreators(pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CreatorProfile>> getCreator(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(creatorService.getCreatorProfile(id)));
    }

    @PostMapping("/{id}/follow")
    public ResponseEntity<ApiResponse<Void>> followCreator(@PathVariable Long id, @AuthenticationPrincipal User user) {
        creatorService.followCreator(user.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @DeleteMapping("/{id}/follow")
    public ResponseEntity<ApiResponse<Void>> unfollowCreator(@PathVariable Long id, @AuthenticationPrincipal User user) {
        creatorService.unfollowCreator(user.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
