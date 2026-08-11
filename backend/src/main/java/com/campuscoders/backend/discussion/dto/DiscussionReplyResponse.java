package com.campuscoders.backend.discussion.dto;

import java.time.Instant;

public record DiscussionReplyResponse(
    Long id,
    Long postId,
    Long authorId,
    String authorName,
    String authorAvatarUrl,
    String content,
    Boolean acceptedAnswer,
    Boolean active,
    Instant createdAt,
    Instant updatedAt) {
}
