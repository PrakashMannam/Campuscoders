package com.campuscoders.backend.dailychallenge.dto;

import com.campuscoders.backend.learningpath.DifficultyLevel;

public record CodingProblemResponse(
    Long id,
    String title,
    String platform,
    String problemUrl,
    DifficultyLevel difficulty,
    String tags,
    Boolean active) {
}
