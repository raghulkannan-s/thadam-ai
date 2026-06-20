package com.thadam.ai.modules.roadmap.presentation.controllers;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.thadam.ai.modules.auth.core.domain.entities.User;
import com.thadam.ai.common.dto.ApiResponse;
import com.thadam.ai.modules.roadmap.core.application.dtos.CommunityRoadmapResponse;
import com.thadam.ai.modules.roadmap.core.application.dtos.MilestoneRequest;
import com.thadam.ai.modules.roadmap.core.application.dtos.MilestoneResponse;
import com.thadam.ai.modules.roadmap.core.application.dtos.RoadmapGenerationRequest;
import com.thadam.ai.modules.roadmap.core.application.dtos.RoadmapRequest;
import com.thadam.ai.modules.roadmap.core.application.dtos.RoadmapResponse;
import com.thadam.ai.modules.roadmap.core.application.dtos.RoadmapUpdateRequest;
import com.thadam.ai.modules.roadmap.core.application.dtos.TaskRequest;
import com.thadam.ai.modules.roadmap.core.application.dtos.TaskResponse;
import com.thadam.ai.modules.roadmap.core.application.dtos.TaskUpdateRequest;
import com.thadam.ai.modules.roadmap.core.application.services.RoadmapGenerationService;
import com.thadam.ai.modules.roadmap.core.application.services.RoadmapService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/roadmaps")
@RequiredArgsConstructor
public class RoadmapController {

    private final RoadmapService roadmapService;
    private final RoadmapGenerationService roadmapGenerationService;

    @PostMapping
    public ResponseEntity<ApiResponse<RoadmapResponse>> createRoadmap(
            @Valid @RequestBody RoadmapRequest request,
            @AuthenticationPrincipal User user) {
        RoadmapResponse response = roadmapService.createRoadmap(request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CommunityRoadmapResponse>> getRoadmap(
            @PathVariable String id,
            @AuthenticationPrincipal User user) {
        CommunityRoadmapResponse response = roadmapService.getCommunityRoadmapById(id, user);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/{id}/view")
    public ResponseEntity<ApiResponse<Void>> recordView(@PathVariable String id) {
        roadmapService.incrementViewCount(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<RoadmapResponse>>> getMyRoadmaps(
            @AuthenticationPrincipal User user,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<RoadmapResponse> roadmaps = roadmapService.getRoadmapsByUser(user.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success(roadmaps));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<CommunityRoadmapResponse>>> searchRoadmaps(
            @RequestParam String q,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal User user) {
        Page<CommunityRoadmapResponse> roadmaps = roadmapService.searchRoadmaps(q, pageable, user);
        return ResponseEntity.ok(ApiResponse.success(roadmaps));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<Page<CommunityRoadmapResponse>>> getRoadmapsByUserId(
            @PathVariable String userId,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal User user) {
        Page<CommunityRoadmapResponse> roadmaps = roadmapService.getRoadmapsByUserId(userId, pageable, user);
        return ResponseEntity.ok(ApiResponse.success(roadmaps));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<RoadmapResponse>> updateRoadmap(
            @PathVariable String id,
            @Valid @RequestBody RoadmapUpdateRequest request,
            @AuthenticationPrincipal User user) {
        RoadmapResponse response = roadmapService.updateRoadmap(id, request, user);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRoadmap(
            @PathVariable String id,
            @AuthenticationPrincipal User user) {
        roadmapService.deleteRoadmap(id, user);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/generate")
    public ResponseEntity<ApiResponse<RoadmapResponse>> generateRoadmap(
            @Valid @RequestBody RoadmapGenerationRequest request,
            @AuthenticationPrincipal User user) {
        RoadmapResponse response = roadmapGenerationService.generateRoadmap(request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @PostMapping("/{roadmapId}/milestones")
    public ResponseEntity<ApiResponse<MilestoneResponse>> createMilestone(
            @PathVariable String roadmapId,
            @Valid @RequestBody MilestoneRequest request,
            @AuthenticationPrincipal User user) {
        MilestoneResponse response = roadmapService.createMilestone(roadmapId, request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @GetMapping("/milestones/{id}")
    public ResponseEntity<ApiResponse<MilestoneResponse>> getMilestone(@PathVariable Long id) {
        MilestoneResponse response = roadmapService.getMilestoneById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/milestones/{id}")
    public ResponseEntity<ApiResponse<MilestoneResponse>> updateMilestone(
            @PathVariable Long id,
            @Valid @RequestBody MilestoneRequest request,
            @AuthenticationPrincipal User user) {
        MilestoneResponse response = roadmapService.updateMilestone(id, request, user);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/milestones/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMilestone(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        roadmapService.deleteMilestone(id, user);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{roadmapId}/tasks")
    public ResponseEntity<ApiResponse<TaskResponse>> createTask(
            @PathVariable String roadmapId,
            @Valid @RequestBody TaskRequest request,
            @AuthenticationPrincipal User user) {
        TaskResponse response = roadmapService.createTask(roadmapId, request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @GetMapping("/{roadmapId}/tasks")
    public ResponseEntity<ApiResponse<Page<TaskResponse>>> getTasksByRoadmap(
            @PathVariable String roadmapId,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.ASC) Pageable pageable) {
        Page<TaskResponse> tasks = roadmapService.getTasksByRoadmap(roadmapId, pageable);
        return ResponseEntity.ok(ApiResponse.success(tasks));
    }

    @GetMapping("/{roadmapId}/milestones")
    public ResponseEntity<ApiResponse<List<MilestoneResponse>>> getMilestonesByRoadmap(
            @PathVariable String roadmapId) {
        List<MilestoneResponse> milestones = roadmapService.getMilestonesByRoadmap(roadmapId);
        return ResponseEntity.ok(ApiResponse.success(milestones));
    }

    @GetMapping("/tasks/{id}")
    public ResponseEntity<ApiResponse<TaskResponse>> getTask(@PathVariable Long id) {
        TaskResponse response = roadmapService.getTaskById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/tasks/{id}")
    public ResponseEntity<ApiResponse<TaskResponse>> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody TaskUpdateRequest request,
            @AuthenticationPrincipal User user) {
        TaskResponse response = roadmapService.updateTask(id, request, user);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/tasks/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTask(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        roadmapService.deleteTask(id, user);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/fork")
    public ResponseEntity<ApiResponse<RoadmapResponse>> forkRoadmap(
            @PathVariable String id,
            @AuthenticationPrincipal User user) {
        RoadmapResponse response = roadmapService.forkRoadmap(id, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @GetMapping("/feed/trending")
    public ResponseEntity<ApiResponse<Page<CommunityRoadmapResponse>>> getTrendingFeed(
            @PageableDefault(sort = "popularityScore", direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal User user) {
        Page<CommunityRoadmapResponse> roadmaps = roadmapService.getTrendingRoadmaps(pageable, user);
        return ResponseEntity.ok(ApiResponse.success(roadmaps));
    }

    @GetMapping("/feed/newest")
    public ResponseEntity<ApiResponse<Page<CommunityRoadmapResponse>>> getNewestFeed(
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal User user) {
        Page<CommunityRoadmapResponse> roadmaps = roadmapService.getNewestRoadmaps(pageable, user);
        return ResponseEntity.ok(ApiResponse.success(roadmaps));
    }
}
