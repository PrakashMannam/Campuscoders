package com.campuscoders.backend.dashboard;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;


import com.campuscoders.backend.dailychallenge.DailyChallengeService;
import com.campuscoders.backend.dailychallenge.dto.DailyChallengeResponse;
import com.campuscoders.backend.dashboard.dto.DashboardSummaryResponse;

import com.campuscoders.backend.notification.NotificationService;
import com.campuscoders.backend.user.User;
import com.campuscoders.backend.user.repository.UserRepository;

@Service
public class DashboardService {

  private final UserRepository userRepository;
  private final DailyChallengeService dailyChallengeService;
  private final NotificationService notificationService;

  public DashboardService(
      UserRepository userRepository,
      DailyChallengeService dailyChallengeService,
      NotificationService notificationService) {
    this.userRepository = userRepository;
    this.dailyChallengeService = dailyChallengeService;
    this.notificationService = notificationService;
  }

  public DashboardSummaryResponse getDashboardSummary(String userEmail) {
    User user = userRepository.findByEmail(userEmail)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));



    DailyChallengeResponse todayChallenge = null;
    try {
      todayChallenge = dailyChallengeService.getTodayChallenge(userEmail);
    } catch (Exception e) {
      // If no daily challenge is created for today, return null without failing the
      // entire summary call
    }

    long unreadCount = notificationService.countUnreadForUser(user.getId());



    return new DashboardSummaryResponse(
        user.getId(),
        user.getFullName(),
        user.getEmail(),
        user.getRole(),
        user.getAvatarUrl(),
        todayChallenge,
        unreadCount);
  }
}