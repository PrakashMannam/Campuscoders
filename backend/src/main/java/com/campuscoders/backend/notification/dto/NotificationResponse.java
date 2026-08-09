package com.campuscoders.backend.notification.dto;

import java.time.Instant;

import com.campuscoders.backend.notification.NotificationType;

public record NotificationResponse(
    Long id,
    String title,
    String message,
    NotificationType type,
    String targetUrl,
    Boolean readStatus,
    Instant createdAt) {
}