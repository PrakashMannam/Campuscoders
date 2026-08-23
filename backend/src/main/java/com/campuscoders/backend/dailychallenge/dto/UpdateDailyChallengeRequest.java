package com.campuscoders.backend.dailychallenge.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;

public record UpdateDailyChallengeRequest(
    @NotNull(message = "Coding problem ID must be provided") Long codingProblemId,
    @NotNull(message = "Challenge date must be provided") LocalDate challengeDate,
    @NotNull(message = "Active status must be specified") Boolean active) {
}
