package com.campuscoders.backend.learningpath.dto;

import com.campuscoders.backend.learningpath.DifficultyLevel;
import com.campuscoders.backend.learningpath.ResourceType;

// Response sent to the frontend for videos, articles, PDFs, and practice resources.
public record LearningResourceResponse(
    Long id,
    Long topicId,
    String title,
    String description,
    ResourceType type,
    DifficultyLevel difficulty,
    String url,
    String provider,
    String thumbnailUrl,
    Integer estimatedMinutes,
    Integer sortOrder,
    Boolean active) {
}