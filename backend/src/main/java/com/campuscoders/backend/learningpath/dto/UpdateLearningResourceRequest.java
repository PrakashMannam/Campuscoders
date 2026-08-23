package com.campuscoders.backend.learningpath.dto;

import com.campuscoders.backend.learningpath.DifficultyLevel;
import com.campuscoders.backend.learningpath.ResourceType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;

// Request body accepted when an admin edits an existing learning resource.
public record UpdateLearningResourceRequest(
    @NotNull Long topicId,
    @NotBlank String title,
    String description,
    @NotNull ResourceType type,
    @NotNull DifficultyLevel difficulty,
    @NotBlank @Pattern(regexp = "^https?://.+", message = "URL must start with http:// or https://") String url,
    String provider,
    @Pattern(regexp = "^$|https?://.+", message = "Thumbnail URL must start with http:// or https://") String thumbnailUrl,
    @PositiveOrZero(message = "Estimated minutes must be zero or positive") Integer estimatedMinutes,
    @PositiveOrZero(message = "Sort order must be zero or positive") Integer sortOrder,
    @NotNull Boolean active) {
}