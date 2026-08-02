package com.campuscoders.backend.admin.dto;

// Compact learning path option used by admin dropdowns.
public record AdminLearningPathOptionResponse(
    Long id,
    String title,
    String slug,
    Boolean active) {
}