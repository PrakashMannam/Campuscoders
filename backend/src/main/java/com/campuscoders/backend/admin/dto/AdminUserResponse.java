package com.campuscoders.backend.admin.dto;

import java.time.Instant;

import com.campuscoders.backend.user.Role;

// Admin user view — password omitted. XP/rank fields intentionally excluded.
public record AdminUserResponse(
    Long id,
    String fullName,
    String email,
    Role role,
    Boolean enabled,
    String university,
    String bio,
    Instant createdAt,
    Instant updatedAt) {
}
