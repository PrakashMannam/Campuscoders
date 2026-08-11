package com.campuscoders.backend.discussion.dto;

import com.campuscoders.backend.discussion.DiscussionCategory;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateDiscussionPostRequest(
    @NotNull(message = "Category must be specified") DiscussionCategory category,
    @NotBlank(message = "Title must not be blank") String title,
    @NotBlank(message = "Content must not be blank") String content,
    String tags) {
}
