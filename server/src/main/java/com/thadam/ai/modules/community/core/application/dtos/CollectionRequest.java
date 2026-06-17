package com.thadam.ai.modules.community.core.application.dtos;
import jakarta.validation.constraints.NotBlank;
public record CollectionRequest(
    @NotBlank(message = "Title cannot be blank") String title,
    String description,
    String visibility
) {}
