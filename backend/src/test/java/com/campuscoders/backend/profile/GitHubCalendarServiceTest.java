package com.campuscoders.backend.profile;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;

import com.campuscoders.backend.profile.dto.ActivityDayResponse;

class GitHubCalendarServiceTest {

  @Test
  void parseUsername_supportsProfileUrls() {
    assertEquals("octocat", GitHubCalendarService.parseUsername("https://github.com/octocat"));
    assertEquals("octocat", GitHubCalendarService.parseUsername("https://github.com/octocat/"));
    assertNull(GitHubCalendarService.parseUsername(""));
    assertNull(GitHubCalendarService.parseUsername("https://github.com/features"));
  }

  @Test
  void computeStreak_countsConsecutiveDaysEndingTodayOrYesterday() {
    LocalDate today = LocalDate.of(2026, 8, 21);
    List<ActivityDayResponse> days = List.of(
        new ActivityDayResponse("2026-08-19", 1),
        new ActivityDayResponse("2026-08-20", 2),
        new ActivityDayResponse("2026-08-21", 1));
    assertEquals(3, GitHubCalendarService.computeStreak(days, today));
  }
}
