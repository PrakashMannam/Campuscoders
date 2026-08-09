package com.campuscoders.backend.dailychallenge.dto;

import java.time.Instant;

public record CompleteDailyChallengeResponse(
    Long challengeId,
    String problemTitle,
    Integer xpAwarded,
    Integer newTotalXp,
    Integer newProblemsSolved,
    Instant completedAt) {
}
