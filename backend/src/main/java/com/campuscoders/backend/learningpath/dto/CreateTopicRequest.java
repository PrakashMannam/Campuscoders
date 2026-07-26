package com.campuscoders.backend.learningpath.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateTopicRequest(
    @NotNull Long learningPathId,
    @NotBlank String title,
    @NotBlank String slug,
    String description,
    Integer estimatedMinutes,
    Integer sortOrder) {
}
