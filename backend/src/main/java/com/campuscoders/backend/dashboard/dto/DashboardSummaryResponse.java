package com.campuscoders.backend.dashboard.dto;

public record DashboardSummaryResponse(
    Integer totalXp,
    Integer dailyStreak,
    Integer problemsSolved,
    long activeLearningPaths,
    long activeResources,
    long activeAnnouncements,
    long unreadNotifications) {
}