package com.campuscoders.backend.discussion.dto;

import java.time.Instant;

public record DiscussionCategoryResponse(
    Long id,
    String name,
    String slug,
    String description,
    String color,
    String iconName,
    Integer sortOrder,
    Boolean active,
    Instant createdAt,
    Instant updatedAt) {
}
