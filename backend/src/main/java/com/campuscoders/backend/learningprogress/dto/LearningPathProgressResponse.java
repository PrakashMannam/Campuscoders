package com.campuscoders.backend.learningprogress.dto;

// DTO representing user completion metrics and progress percentage for a specific Learning Path.
public record LearningPathProgressResponse(
    Long learningPathId,
    String title,
    long totalResources,
    long completedResources,
    double progressPercentage) {
}
