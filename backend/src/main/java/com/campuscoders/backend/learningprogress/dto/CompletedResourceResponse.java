package com.campuscoders.backend.learningprogress.dto;

import java.time.Instant;

public record CompletedResourceResponse(
    Long resourceId,
    String resourceTitle,
    Instant completedAt) {
}
