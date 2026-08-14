package com.campuscoders.backend.leaderboard;

import java.util.Comparator;
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

  // Helper method fetching enabled users, applying multi-tier tie-break sorting, and mapping 1-based rank numbers.
  // Why disabled users are excluded: Deactivated accounts (enabled = false) are filtered out to keep competition active.
  private List<LeaderboardEntryResponse> computeRankedUsers() {
    // Multi-tier Tie-Break Comparator:
    // 1️⃣ totalXp DESC
    // 2️⃣ problemsSolved DESC
    // 3️⃣ dailyStreak DESC
    // 4️⃣ createdAt ASC (earlier registered users receive higher placement on exact tie)
    Comparator<User> rankComparator = Comparator
        .comparing((User u) -> safeInteger(u.getTotalXp()), Comparator.reverseOrder())
        .thenComparing(u -> safeInteger(u.getProblemsSolved()), Comparator.reverseOrder())
        .thenComparing(u -> safeInteger(u.getDailyStreak()), Comparator.reverseOrder())
        .thenComparing(User::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder()));

    AtomicInteger rankSequence = new AtomicInteger(1);

    return userRepository.findAll().stream()
        .filter(user -> Boolean.TRUE.equals(user.getEnabled()))
        .sorted(rankComparator)
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
