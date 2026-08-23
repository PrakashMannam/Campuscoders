package com.campuscoders.backend.dailychallenge.dto;

import com.campuscoders.backend.learningpath.DifficultyLevel;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record CreateCodingProblemRequest(
    @NotBlank(message = "Title must not be blank") String title,
    @NotBlank(message = "Platform must not be blank") String platform,
    @NotBlank(message = "Problem URL must not be blank") @Pattern(regexp = "^https?://.+", message = "Problem URL must start with http:// or https://") String problemUrl,
    @NotNull(message = "Difficulty level must be provided") DifficultyLevel difficulty,
    String tags) {
}
