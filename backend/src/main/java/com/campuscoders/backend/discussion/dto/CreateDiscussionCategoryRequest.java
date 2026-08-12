package com.campuscoders.backend.discussion.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateDiscussionCategoryRequest(
    @NotBlank(message = "Category name must not be blank") String name,
    String slug,
    String description,
    String color,
    String iconName,
    Integer sortOrder) {
}
