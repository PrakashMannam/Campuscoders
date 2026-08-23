package com.campuscoders.backend.profile.dto;

import java.util.List;

public record LeetCodeCalendarResponse(
    boolean available,
    String username,
    Integer year,
    Integer streak,
    Integer totalActiveDays,
    Integer totalActivity,
    Integer totalSolved,
    Integer easySolved,
    Integer mediumSolved,
    Integer hardSolved,
    Integer ranking,
    List<Integer> activeYears,
    List<ActivityDayResponse> days,
    String message) {

  public static LeetCodeCalendarResponse empty(String message) {
    return new LeetCodeCalendarResponse(
        false, null, null, null, null, null, null, null, null, null, null, List.of(), List.of(), message);
  }
}
