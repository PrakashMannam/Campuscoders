package com.campuscoders.backend.event.dto;

import java.time.Instant;

import com.campuscoders.backend.event.CampusEventType;

public record CampusEventResponse(
    Long id,
    String title,
    String description,
    CampusEventType type,
    String platform,
    Instant startsAt,
    Instant endsAt,
    String actionLabel,
    String actionUrl,
    Boolean active,
    Instant createdAt,
    Instant updatedAt) {
}
