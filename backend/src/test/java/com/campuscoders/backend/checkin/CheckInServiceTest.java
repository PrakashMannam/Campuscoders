package com.campuscoders.backend.checkin;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import com.campuscoders.backend.checkin.dto.CheckInStatusResponse;
import com.campuscoders.backend.checkin.repository.CheckInRepository;
import com.campuscoders.backend.user.User;
import com.campuscoders.backend.user.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class CheckInServiceTest {

  @Mock
  private CheckInRepository checkInRepository;

  @Mock
  private UserRepository userRepository;

  @InjectMocks
  private CheckInService checkInService;

  @Test
  void getTodayStatus_checkedInToday_shouldReturnCheckedInTrue() {
    User user = new User();
    user.setId(1L);
    user.setDailyStreak(5);
    user.setTotalXp(50);

    LocalDate today = LocalDate.now(ZoneOffset.UTC);
    CheckIn checkIn = new CheckIn();
    checkIn.setXpAwarded(1);

    when(userRepository.findByEmail("student@campus.com")).thenReturn(Optional.of(user));
    when(checkInRepository.findByUserIdAndCheckInDate(1L, today)).thenReturn(Optional.of(checkIn));

    CheckInStatusResponse status = checkInService.getTodayStatus("student@campus.com");

    assertNotNull(status);
    assertTrue(status.checkedInToday());
    assertEquals(5, status.dailyStreak());
    assertEquals(50, status.totalXp());
  }

  @Test
  void checkInToday_firstTime_shouldSetStreakToOne() {
    User user = new User();
    user.setId(1L);
    user.setEmail("student@campus.com");
    user.setDailyStreak(0);
    user.setTotalXp(0);

    LocalDate today = LocalDate.now(ZoneOffset.UTC);
    LocalDate yesterday = today.minusDays(1);

    when(userRepository.findByEmail("student@campus.com")).thenReturn(Optional.of(user));
    when(checkInRepository.existsByUserIdAndCheckInDate(1L, today)).thenReturn(false);
    when(checkInRepository.existsByUserIdAndCheckInDate(1L, yesterday)).thenReturn(false);
    when(userRepository.save(any(User.class))).thenReturn(user);

    CheckInStatusResponse response = checkInService.checkInToday("student@campus.com");

    assertNotNull(response);
    assertTrue(response.checkedInToday());
    assertEquals(1, response.dailyStreak());
    assertEquals(1, response.totalXp());
    verify(checkInRepository).save(any(CheckIn.class));
  }

  @Test
  void checkInToday_consecutiveDay_shouldIncrementStreak() {
    User user = new User();
    user.setId(1L);
    user.setEmail("student@campus.com");
    user.setDailyStreak(3);
    user.setTotalXp(10);

    LocalDate today = LocalDate.now(ZoneOffset.UTC);
    LocalDate yesterday = today.minusDays(1);

    when(userRepository.findByEmail("student@campus.com")).thenReturn(Optional.of(user));
    when(checkInRepository.existsByUserIdAndCheckInDate(1L, today)).thenReturn(false);
    when(checkInRepository.existsByUserIdAndCheckInDate(1L, yesterday)).thenReturn(true);
    when(userRepository.save(any(User.class))).thenReturn(user);

    CheckInStatusResponse response = checkInService.checkInToday("student@campus.com");

    assertNotNull(response);
    assertEquals(4, response.dailyStreak());
    assertEquals(11, response.totalXp());
  }

  @Test
  void checkInToday_alreadyCheckedIn_shouldThrowConflictException() {
    User user = new User();
    user.setId(1L);

    LocalDate today = LocalDate.now(ZoneOffset.UTC);

    when(userRepository.findByEmail("student@campus.com")).thenReturn(Optional.of(user));
    when(checkInRepository.existsByUserIdAndCheckInDate(1L, today)).thenReturn(true);

    assertThrows(ResponseStatusException.class, () -> checkInService.checkInToday("student@campus.com"));
  }
}
