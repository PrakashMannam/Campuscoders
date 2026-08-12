package com.campuscoders.backend.discussion.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UpdateDiscussionPostRequest(
    @NotNull(message = "Category ID must be specified") Long categoryId,
    @NotBlank(message = "Title must not be blank") String title,
    @NotBlank(message = "Content must not be blank") String content,
    String tags) {
}
