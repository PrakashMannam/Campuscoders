package com.campuscoders.backend.learningpath.dto;

public record TopicResponse(
    Long id,
    Long learningPathId,
    String title,
    String slug,
    String description,
    Integer estimatedMinutes,
    Integer sortOrder,
    Boolean active) {
}
