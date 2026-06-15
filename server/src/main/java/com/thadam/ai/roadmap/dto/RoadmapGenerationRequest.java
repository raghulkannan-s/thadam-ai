package com.thadam.ai.roadmap.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RoadmapGenerationRequest(
    @NotBlank @Size(min = 10, max = 2000) String prompt
) {}
