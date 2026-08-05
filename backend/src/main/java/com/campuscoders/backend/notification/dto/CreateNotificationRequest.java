package com.campuscoders.backend.notification.dto;

import com.campuscoders.backend.notification.NotificationType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateNotificationRequest(
    @NotNull Long recipientUserId,
    @NotBlank String title,
    @NotBlank String message,
    @NotNull NotificationType type,
    String targetUrl) {
}