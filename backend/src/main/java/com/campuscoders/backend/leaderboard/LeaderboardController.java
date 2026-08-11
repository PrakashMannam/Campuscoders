package com.campuscoders.backend.leaderboard;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.campuscoders.backend.leaderboard.dto.LeaderboardEntryResponse;
import com.campuscoders.backend.leaderboard.dto.MyLeaderboardResponse;

@RestController
@RequestMapping("/api/leaderboard")
public class LeaderboardController {

  private final LeaderboardService leaderboardService;

  public LeaderboardController(LeaderboardService leaderboardService) {
    this.leaderboardService = leaderboardService;
  }

  // Returns full or limited leaderboard list sorted by total XP, problems solved, streak, and account age.
  @GetMapping
  public List<LeaderboardEntryResponse> getLeaderboard(
      @RequestParam(required = false) Integer limit) {
    return leaderboardService.getLeaderboard(limit);
  }

  // Shortcut endpoint returning top leaderboard entries (default top 10).
  @GetMapping("/top")
  public List<LeaderboardEntryResponse> getTopLeaderboard(
      @RequestParam(required = false) Integer limit) {
    return leaderboardService.getTopLeaderboard(limit);
  }

  // Returns the authenticated student's rank and metrics.
  @GetMapping("/me")
  public MyLeaderboardResponse getMyLeaderboardRank(Authentication authentication) {
    return leaderboardService.getMyLeaderboardRank(authentication.getName());
  }
}
