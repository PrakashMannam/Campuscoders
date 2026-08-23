package com.campuscoders.backend.dashboard.dto;


import com.campuscoders.backend.dailychallenge.dto.DailyChallengeResponse;
import com.campuscoders.backend.user.Role;

public record DashboardSummaryResponse(
    Long userId,
    String fullName,
    String email,
    Role role,
    String avatarUrl,
    DailyChallengeResponse todayChallenge,
    long unreadNotificationsCount) {
}
