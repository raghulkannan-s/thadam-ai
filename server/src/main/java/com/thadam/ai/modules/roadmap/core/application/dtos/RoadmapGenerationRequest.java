package com.thadam.ai.modules.roadmap.core.application.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RoadmapGenerationRequest(
    @NotBlank @Size(min = 10, max = 2000) String prompt
) {}
