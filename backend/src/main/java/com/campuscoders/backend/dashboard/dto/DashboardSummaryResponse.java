package com.campuscoders.backend.dashboard.dto;

import com.campuscoders.backend.checkin.dto.CheckInStatusResponse;
import com.campuscoders.backend.dailychallenge.dto.DailyChallengeResponse;
import com.campuscoders.backend.user.Role;

public record DashboardSummaryResponse(
    Long userId,
    String fullName,
    String email,
    Role role,
    Integer totalXp,
    Integer dailyStreak,
    Integer problemsSolved,
    String avatarUrl,
    CheckInStatusResponse checkInStatus,
    DailyChallengeResponse todayChallenge,
    long unreadNotificationsCount,
    Integer myLeaderboardRank
) {}