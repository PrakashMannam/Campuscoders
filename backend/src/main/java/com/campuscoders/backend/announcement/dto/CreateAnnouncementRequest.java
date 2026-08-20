package com.campuscoders.backend.announcement.dto;

import com.campuscoders.backend.announcement.AnnouncementCategory;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record CreateAnnouncementRequest(
    @NotBlank String title,
    @NotBlank String message,
    @NotNull AnnouncementCategory category,
    String actionLabel,
    @Pattern(regexp = "^$|https?://.+", message = "Action URL must start with http:// or https://") String actionUrl) {
}