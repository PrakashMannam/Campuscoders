package com.campuscoders.backend.checkin;

import java.time.LocalDate;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
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

  public CheckInStatusResponse getTodayStatus(String email) {
    User user = findUserByEmail(email);
    LocalDate today = LocalDate.now();

    return checkInRepository.findByUserIdAndCheckInDate(user.getId(), today)
        .map(checkIn -> toStatusResponse(user, true, checkIn.getXpAwarded(), today))
        .orElseGet(() -> toStatusResponse(user, false, 0, today));
  }

  public CheckInStatusResponse checkInToday(String email) {
    User user = findUserByEmail(email);
    LocalDate today = LocalDate.now();

    if (checkInRepository.existsByUserIdAndCheckInDate(user.getId(), today)) {
      throw new ResponseStatusException(
          HttpStatus.CONFLICT,
          "Already checked in today");
    }

    updateUserStreakAndXp(user, today);

    CheckIn checkIn = new CheckIn();
    checkIn.setUser(user);
    checkIn.setCheckInDate(today);
    checkIn.setXpAwarded(DAILY_CHECK_IN_XP);

    checkInRepository.save(checkIn);
    User savedUser = userRepository.save(user);

    return toStatusResponse(savedUser, true, DAILY_CHECK_IN_XP, today);
  }

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

  private Integer safeInteger(Integer value) {
    return value == null ? 0 : value;
  }
}