package com.campuscoders.backend.admin.dto;

import java.time.Instant;

import com.campuscoders.backend.user.Role;

// DTO representing user identity and status for admin management views.
// Password hash is explicitly omitted to prevent sensitive credential exposure in administrative APIs.
public record AdminUserResponse(
    Long id,
    String fullName,
    String email,
    Role role,
    Boolean enabled,
    String university,
    String bio,
    Integer totalXp,
    Integer dailyStreak,
    Integer problemsSolved,
    Instant createdAt,
    Instant updatedAt) {
}
