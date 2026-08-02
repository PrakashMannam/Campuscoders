package com.campuscoders.backend.learningpath.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

// Request body accepted when an admin edits an existing topic.
public record UpdateTopicRequest(
    @NotNull Long learningPathId,
    @NotBlank String title,
    @NotBlank String slug,
    String description,
    Integer estimatedMinutes,
    Integer sortOrder,
    @NotNull Boolean active) {
}