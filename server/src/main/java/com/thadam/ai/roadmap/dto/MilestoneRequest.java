package com.thadam.ai.roadmap.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;

public record MilestoneRequest(
    @NotBlank String title,
    String description,
    Integer orderIndex,
    LocalDate dueDate
) {}
