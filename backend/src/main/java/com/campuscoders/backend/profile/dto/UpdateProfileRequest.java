package com.campuscoders.backend.profile.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

// Request body for editing only profile-safe fields.
public record UpdateProfileRequest(
    @NotBlank String fullName,
    String university,
    @Size(max = 1000) String bio,
    String leetcodeUrl,
    String geeksforgeeksUrl,
    String githubUrl,
    String linkedinUrl,
    String avatarUrl) {
}