package com.campuscoders.backend.learningpath.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

// Request body accepted when creating a topic under an existing learning path.
public record CreateTopicRequest(
    @NotNull Long learningPathId,
    @NotBlank String title,
    @NotBlank String slug,
    String description,
    @PositiveOrZero(message = "Estimated minutes must be zero or positive") Integer estimatedMinutes,
    @PositiveOrZero(message = "Sort order must be zero or positive") Integer sortOrder) {
}