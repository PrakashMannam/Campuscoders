package com.campuscoders.backend.profile.dto;

// Public-safe profile data. Email, XP, and private settings are intentionally not exposed.
public record PublicProfileResponse(
    Long id,
    String fullName,
    String university,
    String bio,
    String leetcodeUrl,
    String geeksforgeeksUrl,
    String githubUrl,
    String linkedinUrl,
    String portfolioUrl,
    String avatarUrl) {
}
