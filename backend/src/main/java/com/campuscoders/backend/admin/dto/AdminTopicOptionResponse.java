package com.campuscoders.backend.admin.dto;

// Compact topic option used when an admin assigns a resource to a topic.
public record AdminTopicOptionResponse(
    Long id,
    Long learningPathId,
    String learningPathTitle,
    String title,
    String slug,
    Integer sortOrder,
    Boolean active) {
}