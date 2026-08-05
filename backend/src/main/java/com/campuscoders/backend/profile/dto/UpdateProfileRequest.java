package com.campuscoders.backend.profile.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

// Request body for editing only profile-safe fields.
public record UpdateProfileRequest(
    @NotBlank String fullName,
    String university,
    @Size(max = 1000) String bio,
    @Pattern(regexp = "^$|https?://.+", message = "LeetCode URL must start with http:// or https://") String leetcodeUrl,
    @Pattern(regexp = "^$|https?://.+", message = "GeeksforGeeks URL must start with http:// or https://") String geeksforgeeksUrl,
    @Pattern(regexp = "^$|https?://.+", message = "GitHub URL must start with http:// or https://") String githubUrl,
    @Pattern(regexp = "^$|https?://.+", message = "LinkedIn URL must start with http:// or https://") String linkedinUrl,
    @Pattern(regexp = "^$|https?://.+", message = "Avatar URL must start with http:// or https://") String avatarUrl) {
}