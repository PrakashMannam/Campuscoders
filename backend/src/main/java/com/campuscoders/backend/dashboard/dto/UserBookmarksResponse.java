package com.campuscoders.backend.dashboard.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserBookmarksResponse {
    private List<Long> bookmarkedPathIds;
    private List<Long> bookmarkedTopicIds;
    private List<Long> bookmarkedResourceIds;
}
