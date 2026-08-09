package com.campuscoders.backend.admin.dto;

import com.campuscoders.backend.user.Role;

import jakarta.validation.constraints.NotNull;

public record UpdateUserRoleRequest(
    @NotNull(message = "Role must not be null") Role role) {
}
