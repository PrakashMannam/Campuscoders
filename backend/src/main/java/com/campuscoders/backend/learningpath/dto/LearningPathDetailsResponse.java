package com.campuscoders.backend.learningpath.dto;

import java.util.List;

import com.campuscoders.backend.learningpath.DifficultyLevel;
import com.campuscoders.backend.learningpath.ResourceType;

// Detailed response for one learning path page, including its topics and resources.
public record LearningPathDetailsResponse(
        Long id,
        String title,
        String slug,
        String description,
        String shortDescription,
        String iconName,
        String category,
        DifficultyLevel difficulty,
        Integer estimatedHours,
        Boolean active,
        List<TopicDetails> topics) {

    // Topic data nested inside the learning path details response.
    public record TopicDetails(
            Long id,
            String title,
            String slug,
            String description,
            Integer estimatedMinutes,
            Integer sortOrder,
            Boolean active,
            List<ResourceDetails> resources) {
    }

    // Resource data nested inside each topic.
    public record ResourceDetails(
            Long id,
            String title,
            String description,
            ResourceType type,
            DifficultyLevel difficulty,
            String url,
            String provider,
            String thumbnailUrl,
            Integer estimatedMinutes,
            Integer sortOrder,
            Boolean active) {
    }
}