package com.campuscoders.backend.dashboard;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.campuscoders.backend.checkin.CheckInService;
import com.campuscoders.backend.checkin.dto.CheckInStatusResponse;
import com.campuscoders.backend.dailychallenge.DailyChallengeService;
import com.campuscoders.backend.dashboard.dto.DashboardSummaryResponse;
import com.campuscoders.backend.leaderboard.LeaderboardService;
import com.campuscoders.backend.leaderboard.dto.MyLeaderboardResponse;
import com.campuscoders.backend.notification.NotificationService;
import com.campuscoders.backend.user.Role;
import com.campuscoders.backend.user.User;
import com.campuscoders.backend.user.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

  @Mock
  private UserRepository userRepository;

  @Mock
  private CheckInService checkInService;

  @Mock
  private DailyChallengeService dailyChallengeService;

  @Mock
  private NotificationService notificationService;

  @Mock
  private LeaderboardService leaderboardService;

  @InjectMocks
  private DashboardService dashboardService;

  @Test
  void getDashboardSummary_shouldReturnCombinedSummary() {
    User user = new User();
    user.setId(1L);
    user.setFullName("Prakash");
    user.setEmail("prakash@campus.com");
    user.setRole(Role.STUDENT);
    user.setTotalXp(100);
    user.setDailyStreak(5);
    user.setProblemsSolved(10);

    CheckInStatusResponse checkInStatus = new CheckInStatusResponse(true, 5, 100, 1, null);
    MyLeaderboardResponse rankResponse = new MyLeaderboardResponse(1, 1L, "Prakash", null, 100, 10, 5);

    when(userRepository.findByEmail("prakash@campus.com")).thenReturn(Optional.of(user));
    when(checkInService.getTodayStatus("prakash@campus.com")).thenReturn(checkInStatus);
    when(notificationService.countUnreadForUser(1L)).thenReturn(2L);
    when(leaderboardService.getMyLeaderboardRank("prakash@campus.com")).thenReturn(rankResponse);

    DashboardSummaryResponse summary = dashboardService.getDashboardSummary("prakash@campus.com");

    assertNotNull(summary);
    assertEquals("Prakash", summary.fullName());
    assertEquals(100, summary.totalXp());
    assertEquals(5, summary.dailyStreak());
    assertEquals(2L, summary.unreadNotificationsCount());
    assertEquals(1, summary.myLeaderboardRank());
  }
}
