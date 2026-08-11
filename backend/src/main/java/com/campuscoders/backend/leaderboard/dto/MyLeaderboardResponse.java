package com.campuscoders.backend.leaderboard.dto;

// DTO returning the authenticated student's calculated rank and performance metrics.
public record MyLeaderboardResponse(
    Integer rank,
    Long userId,
    String fullName,
    String avatarUrl,
    Integer totalXp,
    Integer problemsSolved,
    Integer dailyStreak) {
}
