package com.campuscoders.backend.dailychallenge.dto;

import java.time.LocalDate;

public record DailyChallengeResponse(
    Long id,
    CodingProblemResponse codingProblem,
    LocalDate challengeDate,
    Integer xpReward,
    Boolean active,
    Boolean completedByCurrentUser) {
}
