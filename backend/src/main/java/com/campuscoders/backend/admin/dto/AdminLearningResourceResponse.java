package com.campuscoders.backend.admin.dto;

import com.campuscoders.backend.learningpath.DifficultyLevel;
import com.campuscoders.backend.learningpath.ResourceType;

// Admin response includes parent labels and inactive records for management screens.
public record AdminLearningResourceResponse(
    Long id,
    Long topicId,
    String topicTitle,
    Long learningPathId,
    String learningPathTitle,
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