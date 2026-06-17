package com.thadam.ai.modules.community.core.application.dtos;
import java.time.LocalDateTime;
public record CollectionResponse(
    Long id,
    String title,
    String description,
    String visibility,
    Long userId,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
