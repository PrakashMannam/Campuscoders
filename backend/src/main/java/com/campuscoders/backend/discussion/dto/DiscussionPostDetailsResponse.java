package com.campuscoders.backend.discussion.dto;

import java.time.Instant;
import java.util.List;

public record DiscussionPostDetailsResponse(
    Long id,
    Long authorId,
    String authorName,
    String authorAvatarUrl,
    Long categoryId,
    String categoryName,
    String categorySlug,
    String categoryColor,
    String title,
    String content,
    String tags,
    Boolean featured,
    Boolean closed,
    Boolean active,
    Integer voteScore,
    Integer userVote,
    long repliesCount,
    List<DiscussionReplyResponse> replies,
    Instant createdAt,
    Instant updatedAt) {
}
