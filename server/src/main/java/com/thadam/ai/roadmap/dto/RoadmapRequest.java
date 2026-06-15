package com.thadam.ai.roadmap.dto;

import jakarta.validation.constraints.NotBlank;

public record RoadmapRequest(
    @NotBlank String title,
    String description
) {}
