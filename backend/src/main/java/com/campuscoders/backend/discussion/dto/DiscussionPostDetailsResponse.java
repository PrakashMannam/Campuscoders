package com.campuscoders.backend.discussion.dto;

import java.time.Instant;
import java.util.List;

import com.campuscoders.backend.discussion.DiscussionCategory;

public record DiscussionPostDetailsResponse(
    Long id,
    Long authorId,
    String authorName,
    String authorAvatarUrl,
    DiscussionCategory category,
    String title,
    String content,
    String tags,
    Boolean featured,
    Boolean closed,
    Boolean active,
    long repliesCount,
    List<DiscussionReplyResponse> replies,
    Instant createdAt,
    Instant updatedAt) {
}
