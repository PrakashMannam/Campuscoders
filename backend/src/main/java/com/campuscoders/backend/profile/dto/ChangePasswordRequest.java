package com.campuscoders.backend.profile.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

// Request body for changing the current user's password safely.
public record ChangePasswordRequest(
    @NotBlank String currentPassword,
    @NotBlank @Size(min = 6) String newPassword) {
}