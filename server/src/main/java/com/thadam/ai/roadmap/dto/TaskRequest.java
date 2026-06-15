package com.thadam.ai.roadmap.dto;

import java.time.LocalDate;

import com.thadam.ai.roadmap.enums.TaskPriority;

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
