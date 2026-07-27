package com.campuscoders.backend.learningpath.dto;

import com.campuscoders.backend.learningpath.DifficultyLevel;

// Response sent to the frontend for Learning Hub path cards and detail pages.
public record LearningPathResponse(
    Long id,
    String title,
    String slug,
    String description,
    String shortDescription,
    String iconName,
    String category,
    DifficultyLevel difficulty,
    Integer estimatedHours,
    Boolean active) {
}