package com.campuscoders.backend.dashboard;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.campuscoders.backend.announcement.repository.AnnouncementRepository;
import com.campuscoders.backend.dashboard.dto.DashboardSummaryResponse;
import com.campuscoders.backend.learningpath.repository.LearningPathRepository;
import com.campuscoders.backend.learningpath.repository.LearningResourceRepository;
import com.campuscoders.backend.learningprogress.repository.UserLearningResourceRepository;
import com.campuscoders.backend.notification.NotificationService;
import com.campuscoders.backend.user.User;
import com.campuscoders.backend.user.repository.UserRepository;

@Service
public class DashboardService {

  private final UserRepository userRepository;
  private final LearningPathRepository learningPathRepository;
  private final LearningResourceRepository learningResourceRepository;
  private final UserLearningResourceRepository userLearningResourceRepository;
  private final AnnouncementRepository announcementRepository;
  private final NotificationService notificationService;

  public DashboardService(
      UserRepository userRepository,
      LearningPathRepository learningPathRepository,
      LearningResourceRepository learningResourceRepository,
      UserLearningResourceRepository userLearningResourceRepository,
      AnnouncementRepository announcementRepository,
      NotificationService notificationService) {
    this.userRepository = userRepository;
    this.learningPathRepository = learningPathRepository;
    this.learningResourceRepository = learningResourceRepository;
    this.userLearningResourceRepository = userLearningResourceRepository;
    this.announcementRepository = announcementRepository;
    this.notificationService = notificationService;
  }

  // readOnly = true avoids unnecessary Hibernate dirty-checking on retrieved entities.
  @Transactional(readOnly = true)
  public DashboardSummaryResponse getCurrentUserSummary(String email) {
    User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

    // Aggregate user metrics along with platform-wide counts for an instant dashboard overview.
    long completedResourcesCount = userLearningResourceRepository.findAllByUserId(user.getId()).size();

    return new DashboardSummaryResponse(
        safeInteger(user.getTotalXp()),
        safeInteger(user.getDailyStreak()),
        safeInteger(user.getProblemsSolved()),
        completedResourcesCount,
        learningPathRepository.countByActiveTrue(),
        learningResourceRepository.countByActiveTrue(),
        announcementRepository.countByActiveTrue(),
        notificationService.countUnreadForUser(user.getId()));
  }

  // Prevents NullPointerExceptions if streak or XP numbers haven't been initialized yet.
  private Integer safeInteger(Integer value) {
    return value == null ? 0 : value;
  }
}