package com.campuscoders.backend.profile.dto;

// Public-safe profile data. Email and private settings are intentionally not exposed.
public record PublicProfileResponse(
    Long id,
    String fullName,
    String university,
    String bio,
    String leetcodeUrl,
    String geeksforgeeksUrl,
    String githubUrl,
    String linkedinUrl,
    String avatarUrl,
    Integer totalXp,
    Integer dailyStreak,
    Integer problemsSolved) {
}