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


import com.campuscoders.backend.dailychallenge.DailyChallengeService;
import com.campuscoders.backend.dashboard.dto.DashboardSummaryResponse;
import com.campuscoders.backend.notification.NotificationService;
import com.campuscoders.backend.user.Role;
import com.campuscoders.backend.user.User;
import com.campuscoders.backend.user.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

  @Mock
  private UserRepository userRepository;



  @Mock
  private DailyChallengeService dailyChallengeService;

  @Mock
  private NotificationService notificationService;

  @InjectMocks
  private DashboardService dashboardService;

  @Test
  void getDashboardSummary_shouldReturnCombinedSummaryWithoutXpIdentity() {
    User user = new User();
    user.setId(1L);
    user.setFullName("Prakash");
    user.setEmail("prakash@campus.com");
    user.setRole(Role.STUDENT);



    when(userRepository.findByEmail("prakash@campus.com")).thenReturn(Optional.of(user));
    when(notificationService.countUnreadForUser(1L)).thenReturn(2L);

    DashboardSummaryResponse summary = dashboardService.getDashboardSummary("prakash@campus.com");

    assertNotNull(summary);
    assertEquals("Prakash", summary.fullName());
    assertEquals("prakash@campus.com", summary.email());
    assertEquals(2L, summary.unreadNotificationsCount());
  }
}
