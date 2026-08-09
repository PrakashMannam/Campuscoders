package com.campuscoders.backend.learningprogress.dto;

import jakarta.validation.constraints.NotNull;

public record CompleteResourceRequest(
    @NotNull(message = "Resource ID is required") Long resourceId) {
}
