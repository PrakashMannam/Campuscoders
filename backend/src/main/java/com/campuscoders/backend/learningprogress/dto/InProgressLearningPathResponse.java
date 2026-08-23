package com.campuscoders.backend.learningprogress.dto;

import com.campuscoders.backend.learningpath.DifficultyLevel;

public record InProgressLearningPathResponse(
    Long learningPathId,
    String title,
    String slug,
    String category,
    DifficultyLevel difficulty,
    long totalResources,
    long completedResources,
    double progressPercentage) {
}
