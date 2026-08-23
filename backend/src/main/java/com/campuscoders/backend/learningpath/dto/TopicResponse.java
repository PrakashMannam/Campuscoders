package com.campuscoders.backend.learningpath.dto;

// Response sent to the frontend for topics inside a learning path.
public record TopicResponse(
    Long id,
    Long learningPathId,
    String learningPathSlug,
    String learningPathTitle,
    String title,
    String slug,
    String description,
    Integer estimatedMinutes,
    Integer sortOrder,
    Boolean active) {
}