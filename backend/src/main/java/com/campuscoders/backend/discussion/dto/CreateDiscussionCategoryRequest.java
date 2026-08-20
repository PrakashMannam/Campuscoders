package com.campuscoders.backend.discussion.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;

public record CreateDiscussionCategoryRequest(
    @NotBlank(message = "Category name must not be blank") String name,
    @NotBlank(message = "Category slug must not be blank") String slug,
    String description,
    String color,
    String iconName,
    @PositiveOrZero(message = "Sort order must be zero or positive") Integer sortOrder) {
}
