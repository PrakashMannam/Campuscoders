package com.campuscoders.backend.discussion.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateDiscussionReplyRequest(
    @NotBlank(message = "Reply content must not be blank") String content) {
}
