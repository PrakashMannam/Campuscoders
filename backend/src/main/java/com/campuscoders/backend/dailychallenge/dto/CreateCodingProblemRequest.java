package com.campuscoders.backend.dailychallenge.dto;

import com.campuscoders.backend.learningpath.DifficultyLevel;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateCodingProblemRequest(
    @NotBlank(message = "Title must not be blank") String title,
    @NotBlank(message = "Platform must not be blank") String platform,
    @NotBlank(message = "Problem URL must not be blank") String problemUrl,
    @NotNull(message = "Difficulty level must be provided") DifficultyLevel difficulty,
    String tags) {
}
