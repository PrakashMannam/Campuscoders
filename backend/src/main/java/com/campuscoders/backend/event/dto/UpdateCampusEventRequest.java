package com.campuscoders.backend.event.dto;

import java.time.Instant;

import com.campuscoders.backend.event.CampusEventType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record UpdateCampusEventRequest(
    @NotBlank String title,
    String description,
    @NotNull CampusEventType type,
    String platform,
    @NotNull Instant startsAt,
    Instant endsAt,
    String actionLabel,
    @Pattern(regexp = "^$|https?://.+", message = "Action URL must start with http:// or https://") String actionUrl) {
}
