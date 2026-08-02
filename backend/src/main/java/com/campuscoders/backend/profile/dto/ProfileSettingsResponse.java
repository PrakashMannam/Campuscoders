package com.campuscoders.backend.profile.dto;

// Account preference values used by the frontend settings page.
public record ProfileSettingsResponse(
    Boolean publicProfileVisible,
    Boolean emailDigests,
    Boolean pushNotifications,
    Boolean discussionMentions) {
}