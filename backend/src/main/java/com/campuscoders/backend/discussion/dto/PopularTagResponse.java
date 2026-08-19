package com.campuscoders.backend.discussion.dto;

import lombok.Builder;

@Builder
public record PopularTagResponse(
    String tag,
    Long count
) {
}
