package com.campuscoders.backend.announcement.dto;

import com.campuscoders.backend.announcement.AnnouncementCategory;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateAnnouncementRequest(
    @NotBlank String title,
    @NotBlank String message,
    @NotNull AnnouncementCategory category,
    String actionLabel,
    String actionUrl) {
}