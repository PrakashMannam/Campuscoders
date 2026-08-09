package com.campuscoders.backend.announcement.dto;

import java.time.Instant;

import com.campuscoders.backend.announcement.AnnouncementCategory;

public record AnnouncementResponse(
    Long id,
    String title,
    String message,
    AnnouncementCategory category,
    String actionLabel,
    String actionUrl,
    Boolean active,
    Instant createdAt,
    Instant updatedAt) {
}