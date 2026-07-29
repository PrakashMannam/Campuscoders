package com.campuscoders.backend.learningpath.dto;

import com.campuscoders.backend.learningpath.DifficultyLevel;
import com.campuscoders.backend.learningpath.ResourceType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

// Request body accepted when an admin edits an existing learning resource.
public record UpdateLearningResourceRequest(
    @NotNull Long topicId,
    @NotBlank String title,
    String description,
    @NotNull ResourceType type,
    @NotNull DifficultyLevel difficulty,
    @NotBlank String url,
    String provider,
    String thumbnailUrl,
    Integer estimatedMinutes,
    Integer sortOrder,
    @NotNull Boolean active) {
}