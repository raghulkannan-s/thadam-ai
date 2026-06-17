package com.thadam.ai.modules.roadmap.core.application.dtos;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;

public record MilestoneRequest(
    @NotBlank String title,
    String description,
    Integer orderIndex,
    LocalDate dueDate
) {}
