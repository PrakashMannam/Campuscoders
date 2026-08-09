package com.campuscoders.backend.dailychallenge.dto;

import java.time.LocalDateTime;

public record CompleteDailyChallengeResponse(
    Long challengeId,
    String problemTitle,
    Integer xpAwarded,
    Integer newTotalXp,
    Integer newProblemsSolved,
    LocalDateTime completedAt) {
}
