package com.campuscoders.backend.dashboard.dto;

// DTO consolidating high-level user metrics and platform statistics for the main dashboard view.
public record DashboardSummaryResponse(
    Integer totalXp,
    Integer dailyStreak,
    Integer problemsSolved,
    long completedResources,
    long activeLearningPaths,
    long activeResources,
    long activeAnnouncements,
    long unreadNotifications) {
}