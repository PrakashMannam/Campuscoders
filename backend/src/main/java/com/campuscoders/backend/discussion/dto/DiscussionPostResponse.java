package com.campuscoders.backend.discussion.dto;

import java.time.Instant;

public record DiscussionPostResponse(
    Long id,
    Long authorId,
    String authorName,
    String authorAvatarUrl,
    Long categoryId,
    String categoryName,
    String categorySlug,
    String categoryColor,
    String title,
    String contentPreview,
    String tags,
    Boolean featured,
    Boolean closed,
    Boolean active,
    Integer voteScore,
    Integer userVote,
    long repliesCount,
    Boolean hasAcceptedAnswer,
    Instant createdAt,
    Instant updatedAt) {
}
