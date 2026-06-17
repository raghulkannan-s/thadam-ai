package com.thadam.ai.modules.community.presentation.controllers;

import com.thadam.ai.common.dto.ApiResponse;
import com.thadam.ai.modules.auth.core.domain.entities.User;
import com.thadam.ai.modules.community.core.application.dtos.CollectionRequest;
import com.thadam.ai.modules.community.core.application.dtos.CollectionResponse;
import com.thadam.ai.modules.community.core.application.services.CollectionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/collections")
@RequiredArgsConstructor
public class CollectionController {

    private final CollectionService collectionService;

    @PostMapping
    public ResponseEntity<ApiResponse<CollectionResponse>> createCollection(@Valid @RequestBody CollectionRequest request, @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(collectionService.createCollection(request, user)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<CollectionResponse>>> getMyCollections(@PageableDefault Pageable pageable, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(collectionService.getMyCollections(user, pageable)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CollectionResponse>> updateCollection(@PathVariable Long id, @Valid @RequestBody CollectionRequest request, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(collectionService.updateCollection(id, request, user)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCollection(@PathVariable Long id, @AuthenticationPrincipal User user) {
        collectionService.deleteCollection(id, user);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/roadmaps/{roadmapId}")
    public ResponseEntity<ApiResponse<Void>> addRoadmap(@PathVariable Long id, @PathVariable Long roadmapId, @AuthenticationPrincipal User user) {
        collectionService.addRoadmapToCollection(id, roadmapId, user);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @DeleteMapping("/{id}/roadmaps/{roadmapId}")
    public ResponseEntity<ApiResponse<Void>> removeRoadmap(@PathVariable Long id, @PathVariable Long roadmapId, @AuthenticationPrincipal User user) {
        collectionService.removeRoadmapFromCollection(id, roadmapId, user);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
