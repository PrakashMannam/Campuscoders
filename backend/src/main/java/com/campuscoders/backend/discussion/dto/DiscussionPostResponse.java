package com.campuscoders.backend.discussion.dto;

import java.time.Instant;

import com.campuscoders.backend.discussion.DiscussionCategory;

public record DiscussionPostResponse(
    Long id,
    Long authorId,
    String authorName,
    String authorAvatarUrl,
    DiscussionCategory category,
    String title,
    String contentPreview,
    String tags,
    Boolean featured,
    Boolean closed,
    Boolean active,
    long repliesCount,
    Boolean hasAcceptedAnswer,
    Instant createdAt,
    Instant updatedAt) {
}
