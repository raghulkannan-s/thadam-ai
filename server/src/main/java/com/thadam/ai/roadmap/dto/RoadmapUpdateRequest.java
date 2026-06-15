package com.thadam.ai.roadmap.dto;

import com.thadam.ai.roadmap.enums.RoadmapStatus;

import jakarta.validation.constraints.NotBlank;

public record RoadmapUpdateRequest(
    @NotBlank String title,
    String description,
    RoadmapStatus status
) {}
