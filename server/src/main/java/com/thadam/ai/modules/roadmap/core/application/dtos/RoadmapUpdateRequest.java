package com.thadam.ai.modules.roadmap.core.application.dtos;

import com.thadam.ai.modules.roadmap.core.domain.enums.RoadmapStatus;

import jakarta.validation.constraints.NotBlank;

public record RoadmapUpdateRequest(
    @NotBlank String title,
    String description,
    RoadmapStatus status
) {}
