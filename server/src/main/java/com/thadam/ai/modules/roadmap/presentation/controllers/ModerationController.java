package com.thadam.ai.modules.roadmap.presentation.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.thadam.ai.modules.roadmap.core.application.dtos.CommunityRoadmapResponse;
import com.thadam.ai.modules.roadmap.core.application.dtos.RoadmapResponse;
import com.thadam.ai.modules.roadmap.core.application.services.RoadmapService;
import com.thadam.ai.modules.roadmap.core.domain.enums.RoadmapVisibility;
import com.thadam.ai.common.dto.ApiResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/moderation/roadmaps")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MODERATOR')")
public class ModerationController {

    private final RoadmapService roadmapService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<CommunityRoadmapResponse>>> getAllRoadmaps(Pageable pageable) {
        Page<CommunityRoadmapResponse> roadmaps = roadmapService.getAllRoadmapsForModeration(pageable);
        return ResponseEntity.ok(ApiResponse.success(roadmaps));
    }



    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRoadmap(
            @PathVariable String id) {
        roadmapService.deleteRoadmapAsAdmin(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/visibility")
    public ResponseEntity<ApiResponse<RoadmapResponse>> forceUpdateVisibility(
            @PathVariable String id,
            @Valid @RequestBody VisibilityUpdateRequest request) {
        RoadmapResponse response = roadmapService.forceUpdateVisibility(id, request.getVisibility());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Data
    public static class VisibilityUpdateRequest {
        @NotNull(message = "Visibility is required")
        private RoadmapVisibility visibility;
    }
}
