package com.campuscoders.backend.discussion.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

@Builder
public record VoteDiscussionPostRequest(
    @NotNull(message = "Vote value is required")
    @Min(value = -1, message = "Vote value must be -1 or 1")
    @Max(value = 1, message = "Vote value must be -1 or 1")
    Integer voteValue
) {
}
