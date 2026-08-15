package com.campuscoders.backend.leaderboard;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.campuscoders.backend.common.dto.PageResponse;
import com.campuscoders.backend.exception.CustomException;
import com.campuscoders.backend.leaderboard.dto.LeaderboardEntryResponse;
import com.campuscoders.backend.leaderboard.dto.MyLeaderboardResponse;
import com.campuscoders.backend.user.User;
import com.campuscoders.backend.user.repository.UserRepository;

@Service
public class LeaderboardService {

  private final UserRepository userRepository;

  public LeaderboardService(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  // Calculates and returns paginated leaderboard rankings for active users.
  @Transactional(readOnly = true)
  public PageResponse<LeaderboardEntryResponse> getLeaderboard(Pageable pageable) {
    List<LeaderboardEntryResponse> fullRankedList = computeRankedUsers();

    int start = (int) pageable.getOffset();
    int end = Math.min((start + pageable.getPageSize()), fullRankedList.size());
    List<LeaderboardEntryResponse> content = (start <= fullRankedList.size())
        ? fullRankedList.subList(start, end)
        : List.of();

    Page<LeaderboardEntryResponse> page = new PageImpl<>(content, pageable, fullRankedList.size());
    return PageResponse.from(page);
  }

  // Returns shortcut top rankings (defaults to top 10).
  @Transactional(readOnly = true)
  public List<LeaderboardEntryResponse> getTopLeaderboard(Integer limit) {
    int effectiveLimit = (limit != null && limit > 0) ? limit : 10;
    List<LeaderboardEntryResponse> fullRankedList = computeRankedUsers();
    return fullRankedList.stream().limit(effectiveLimit).toList();
  }

  // Finds authenticated student's rank and metrics from the global computed leaderboard list.
  @Transactional(readOnly = true)
  public MyLeaderboardResponse getMyLeaderboardRank(String userEmail) {
    List<LeaderboardEntryResponse> rankedList = computeRankedUsers();

    User user = userRepository.findByEmail(userEmail)
        .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));

    return rankedList.stream()
        .filter(entry -> entry.userId().equals(user.getId()))
        .findFirst()
        .map(entry -> new MyLeaderboardResponse(
            entry.rank(),
            entry.userId(),
            entry.fullName(),
            entry.avatarUrl(),
            entry.totalXp(),
            entry.problemsSolved(),
            entry.dailyStreak()))
        .orElseThrow(() -> new CustomException("Leaderboard rank unavailable for inactive user", HttpStatus.NOT_FOUND));
  }

  // Database-Driven Ranking:
  // Uses userRepository.findLeaderboardUsers() which filters enabled = true and applies multi-tier tie-break sorting 
  // (totalXp DESC, problemsSolved DESC, dailyStreak DESC, createdAt ASC) directly in MySQL SQL query.
  // Server then simply assigns 1-based ranks (1, 2, 3...) sequentially.
  private List<LeaderboardEntryResponse> computeRankedUsers() {
    AtomicInteger rankSequence = new AtomicInteger(1);

    return userRepository.findLeaderboardUsers().stream()
        .map(user -> new LeaderboardEntryResponse(
            rankSequence.getAndIncrement(),
            user.getId(),
            user.getFullName(),
            user.getAvatarUrl(),
            safeInteger(user.getTotalXp()),
            safeInteger(user.getProblemsSolved()),
            safeInteger(user.getDailyStreak())))
        .toList();
  }

  // Null-Safe Metric Handling: Protects against uninitialized zero/null integer fields in user records.
  private Integer safeInteger(Integer value) {
    return value == null ? 0 : value;
  }
}
