package com.campuscoders.backend.checkin;

import java.time.LocalDate;
import java.time.ZoneOffset;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.campuscoders.backend.checkin.dto.CheckInStatusResponse;
import com.campuscoders.backend.checkin.repository.CheckInRepository;
import com.campuscoders.backend.user.User;
import com.campuscoders.backend.user.repository.UserRepository;

@Service
public class CheckInService {

  private static final int DAILY_CHECK_IN_XP = 1;

  private final CheckInRepository checkInRepository;
  private final UserRepository userRepository;

  public CheckInService(
      CheckInRepository checkInRepository,
      UserRepository userRepository) {
    this.checkInRepository = checkInRepository;
    this.userRepository = userRepository;
  }

  // readOnly = true optimizes database performance for read-only status checks.
  @Transactional(readOnly = true)
  public CheckInStatusResponse getTodayStatus(String email) {
    User user = findUserByEmail(email);
    LocalDate today = LocalDate.now(ZoneOffset.UTC);

    // Map existing check-in to response if already completed today; otherwise return unchecked status.
    return checkInRepository.findByUserIdAndCheckInDate(user.getId(), today)
        .map(checkIn -> toStatusResponse(user, true, checkIn.getXpAwarded(), today))
        .orElseGet(() -> toStatusResponse(user, false, 0, today));
  }

  // Transactional ensures both the check-in record and user streak/XP updates succeed together atomically.
  @Transactional
  public CheckInStatusResponse checkInToday(String email) {
    User user = findUserByEmail(email);
    LocalDate today = LocalDate.now(ZoneOffset.UTC);

    // 1️⃣ Prevent double check-ins on the same calendar day.
    if (checkInRepository.existsByUserIdAndCheckInDate(user.getId(), today)) {
      throw new ResponseStatusException(
          HttpStatus.CONFLICT,
          "Already checked in today");
    }

    // 2️⃣ Calculate streak continuity and award daily XP.
    updateUserStreakAndXp(user, today);

    // 3️⃣ Save new check-in record for today.
    CheckIn checkIn = new CheckIn();
    checkIn.setUser(user);
    checkIn.setCheckInDate(today);
    checkIn.setXpAwarded(DAILY_CHECK_IN_XP);

    checkInRepository.save(checkIn);
    User savedUser = userRepository.save(user);

    return toStatusResponse(savedUser, true, DAILY_CHECK_IN_XP, today);
  }

  // Streak logic: If user checked in yesterday, increment current streak by 1. Otherwise reset streak to 1.
  private void updateUserStreakAndXp(User user, LocalDate today) {
    LocalDate yesterday = today.minusDays(1);

    boolean checkedInYesterday = checkInRepository
        .existsByUserIdAndCheckInDate(user.getId(), yesterday);

    if (checkedInYesterday) {
      user.setDailyStreak(safeInteger(user.getDailyStreak()) + 1);
    } else {
      user.setDailyStreak(1);
    }

    user.setTotalXp(safeInteger(user.getTotalXp()) + DAILY_CHECK_IN_XP);
  }

  private User findUserByEmail(String email) {
    return userRepository.findByEmail(email)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "User not found"));
  }

  private CheckInStatusResponse toStatusResponse(
      User user,
      Boolean checkedInToday,
      Integer xpAwardedToday,
      LocalDate checkInDate) {
    return new CheckInStatusResponse(
        checkedInToday,
        safeInteger(user.getDailyStreak()),
        safeInteger(user.getTotalXp()),
        xpAwardedToday,
        checkInDate);
  }

  // Helper method protecting against null pointer exceptions when processing new user accounts with uninitialized fields.
  private Integer safeInteger(Integer value) {
    return value == null ? 0 : value;
  }
}