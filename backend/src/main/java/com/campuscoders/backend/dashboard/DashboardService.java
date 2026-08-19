package com.campuscoders.backend.dashboard;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.campuscoders.backend.checkin.CheckInService;
import com.campuscoders.backend.checkin.dto.CheckInStatusResponse;
import com.campuscoders.backend.dailychallenge.DailyChallengeService;
import com.campuscoders.backend.dailychallenge.dto.DailyChallengeResponse;
import com.campuscoders.backend.dashboard.dto.DashboardSummaryResponse;
import com.campuscoders.backend.leaderboard.LeaderboardService;
import com.campuscoders.backend.leaderboard.dto.MyLeaderboardResponse;
import com.campuscoders.backend.notification.NotificationService;
import com.campuscoders.backend.user.User;
import com.campuscoders.backend.user.repository.UserRepository;

@Service
public class DashboardService {

  private final UserRepository userRepository;
  private final CheckInService checkInService;
  private final DailyChallengeService dailyChallengeService;
  private final NotificationService notificationService;
  private final LeaderboardService leaderboardService;

  public DashboardService(
      UserRepository userRepository,
      CheckInService checkInService,
      DailyChallengeService dailyChallengeService,
      NotificationService notificationService,
      LeaderboardService leaderboardService) {
    this.userRepository = userRepository;
    this.checkInService = checkInService;
    this.dailyChallengeService = dailyChallengeService;
    this.notificationService = notificationService;
    this.leaderboardService = leaderboardService;
  }

  public DashboardSummaryResponse getDashboardSummary(String userEmail) {
    User user = userRepository.findByEmail(userEmail)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

    CheckInStatusResponse checkInStatus = checkInService.getTodayStatus(userEmail);

    DailyChallengeResponse todayChallenge = null;
    try {
      todayChallenge = dailyChallengeService.getTodayChallenge(userEmail);
    } catch (Exception e) {
      // If no daily challenge is created for today, return null without failing the entire summary call
    }

    long unreadCount = notificationService.countUnreadForUser(user.getId());

    Integer myRank = null;
    try {
      MyLeaderboardResponse rankResponse = leaderboardService.getMyLeaderboardRank(userEmail);
      if (rankResponse != null) {
        myRank = rankResponse.rank();
      }
    } catch (Exception e) {
      // Fallback if leaderboard is unavailable for unranked accounts
    }

    return new DashboardSummaryResponse(
        user.getId(),
        user.getFullName(),
        user.getEmail(),
        user.getRole(),
        user.getTotalXp() != null ? user.getTotalXp() : 0,
        user.getDailyStreak() != null ? user.getDailyStreak() : 0,
        user.getProblemsSolved() != null ? user.getProblemsSolved() : 0,
        user.getAvatarUrl(),
        checkInStatus,
        todayChallenge,
        unreadCount,
        myRank);
  }
}