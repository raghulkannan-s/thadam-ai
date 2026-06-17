package com.thadam.ai.modules.roadmap.presentation.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.thadam.ai.modules.auth.core.domain.entities.User;
import com.thadam.ai.common.dto.ApiResponse;
import com.thadam.ai.modules.roadmap.core.application.dtos.VoteRequest;
import com.thadam.ai.modules.roadmap.core.application.dtos.VoteResponse;
import com.thadam.ai.modules.roadmap.core.application.services.VoteService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/roadmaps/{roadmapId}/votes")
@RequiredArgsConstructor
public class VoteController {

    private final VoteService voteService;

    @PostMapping
    public ResponseEntity<ApiResponse<VoteResponse>> vote(
            @PathVariable Long roadmapId,
            @Valid @RequestBody VoteRequest request,
            @AuthenticationPrincipal User user) {
        VoteResponse response = voteService.vote(roadmapId, request, user);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<VoteResponse>> getUserVote(
            @PathVariable Long roadmapId,
            @AuthenticationPrincipal User user) {
        VoteResponse response = voteService.getUserVote(roadmapId, user);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
