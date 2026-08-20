package com.campuscoders.backend.learningpath.dto;

import com.campuscoders.backend.learningpath.DifficultyLevel;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

// Request body accepted when an admin edits an existing learning path.
public record UpdateLearningPathRequest(
    @NotBlank String title,
    @NotBlank String slug,
    String description,
    String shortDescription,
    String iconName,
    String category,
    @NotNull DifficultyLevel difficulty,
    @PositiveOrZero(message = "Estimated hours must be zero or positive") Integer estimatedHours,
    @NotNull Boolean active) {
}