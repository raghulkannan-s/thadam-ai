package com.thadam.ai.modules.roadmap.core.application.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RoadmapGenerationRequest(
    @NotBlank @Size(min = 3, max = 2000) String prompt,
    @NotBlank String difficulty,
    Integer durationWeeks,
    String durationType,
    Integer durationValue,
    @jakarta.validation.constraints.NotNull Double estimatedHoursPerDay,
    java.time.LocalDateTime startDate,
    String visibility,
    Boolean isRegeneration,
    String category
) {}
