package com.campuscoders.backend.profile.dto;

import jakarta.validation.constraints.NotNull;

// Request body for updating account preference toggles.
public record UpdateProfileSettingsRequest(
    @NotNull Boolean publicProfileVisible,
    @NotNull Boolean emailDigests,
    @NotNull Boolean pushNotifications,
    @NotNull Boolean discussionMentions) {
}