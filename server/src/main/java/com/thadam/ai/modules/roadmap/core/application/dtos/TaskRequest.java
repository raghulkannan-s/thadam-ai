package com.thadam.ai.modules.roadmap.core.application.dtos;

import java.time.LocalDate;

import com.thadam.ai.modules.roadmap.core.domain.enums.TaskPriority;

import jakarta.validation.constraints.NotBlank;

public record TaskRequest(
    @NotBlank String title,
    String description,
    Long milestoneId,
    Long assigneeId,
    TaskPriority priority,
    Integer orderIndex,
    LocalDate dueDate
) {}
