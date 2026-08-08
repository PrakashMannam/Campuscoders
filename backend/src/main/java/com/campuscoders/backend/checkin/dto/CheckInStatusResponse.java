package com.campuscoders.backend.checkin.dto;

import java.time.LocalDate;

public record CheckInStatusResponse(
  Boolean checkedInToday,
    Integer dailyStreak,
    Integer totalXp,
    Integer xpAwardedToday,
    LocalDate checkInDate) {
}
