package com.campuscoders.backend.discussion.dto;

import lombok.Builder;

@Builder
public record TopContributorResponse(
    Long userId,
    String fullName,
    String avatarUrl,
    Long repliesCount
) {
}
