package com.campuscoders.backend.notification.dto;

import com.campuscoders.backend.notification.NotificationType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record CreateNotificationRequest(
    @NotNull Long recipientUserId,
    @NotBlank String title,
    @NotBlank String message,
    @NotNull NotificationType type,
    @Pattern(regexp = "^$|^(/|https?://).+", message = "Target URL must be a valid path or URL") String targetUrl) {
}