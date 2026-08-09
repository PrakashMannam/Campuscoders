package com.campuscoders.backend.learningprogress.dto;

import java.time.LocalDateTime;

public record CompletedResourceResponse(
    Long resourceId,
    String resourceTitle,
    LocalDateTime completedAt) {
}
