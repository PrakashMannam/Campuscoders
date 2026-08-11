package com.campuscoders.backend.leaderboard.dto;

// DTO representing an individual user's position and metrics on the platform leaderboard.
public record LeaderboardEntryResponse(
    Integer rank,
    Long userId,
    String fullName,
    String avatarUrl,
    Integer totalXp,
    Integer problemsSolved,
    Integer dailyStreak) {
}
