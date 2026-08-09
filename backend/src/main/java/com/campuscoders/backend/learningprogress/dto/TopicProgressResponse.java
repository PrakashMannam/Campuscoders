package com.campuscoders.backend.learningprogress.dto;

// DTO representing user completion metrics and progress percentage for a single Topic.
public record TopicProgressResponse(
    Long topicId,
    String title,
    long totalResources,
    long completedResources,
    double progressPercentage) {
}
