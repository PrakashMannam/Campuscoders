package com.campuscoders.backend.profile.dto;

import java.time.Instant;

import com.campuscoders.backend.user.Role;

// Safe profile data returned to the frontend; password is never exposed.
public record ProfileResponse(
    Long id,
    String fullName,
    String email,
    Role role,
    String university,
    String bio,
    String leetcodeUrl,
    String geeksforgeeksUrl,
    String githubUrl,
    String linkedinUrl,
    String portfolioUrl,
    String avatarUrl,
    Boolean publicProfileVisible,
    Instant createdAt) {
}
