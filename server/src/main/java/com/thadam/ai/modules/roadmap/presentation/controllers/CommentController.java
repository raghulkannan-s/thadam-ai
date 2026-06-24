package com.thadam.ai.modules.roadmap.presentation.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.thadam.ai.common.dto.ApiResponse;
import com.thadam.ai.modules.auth.core.domain.entities.User;
import com.thadam.ai.modules.roadmap.core.application.dtos.CommentRequest;
import com.thadam.ai.modules.roadmap.core.application.dtos.CommentResponse;
import com.thadam.ai.modules.roadmap.core.application.dtos.CommentVoteRequest;
import com.thadam.ai.modules.roadmap.core.application.services.CommentService;
import com.thadam.ai.modules.roadmap.core.domain.enums.VoteType;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/roadmaps")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @GetMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<List<CommentResponse>>> getComments(@PathVariable String id, @AuthenticationPrincipal User user) {
        List<CommentResponse> responses = commentService.getCommentsByRoadmap(id, user);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<CommentResponse>> addComment(
            @PathVariable String id,
            @Valid @RequestBody CommentRequest request,
            @AuthenticationPrincipal User user) {
        CommentResponse response = commentService.addComment(id, request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(
            @PathVariable Long commentId,
            @AuthenticationPrincipal User user) {
        commentService.deleteComment(commentId, user);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/comments/{commentId}/votes")
    public ResponseEntity<ApiResponse<CommentResponse>> voteComment(
            @PathVariable Long commentId,
            @Valid @RequestBody CommentVoteRequest request,
            @AuthenticationPrincipal User user) {
        CommentResponse response = commentService.voteComment(commentId, VoteType.valueOf(request.type()), user);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
