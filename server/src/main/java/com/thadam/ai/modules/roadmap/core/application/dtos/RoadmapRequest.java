package com.thadam.ai.modules.roadmap.core.application.dtos;

import jakarta.validation.constraints.NotBlank;

public record RoadmapRequest(
    @NotBlank String title,
    String description
) {}
