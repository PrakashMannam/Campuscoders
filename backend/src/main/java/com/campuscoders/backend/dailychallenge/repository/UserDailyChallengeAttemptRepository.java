package com.campuscoders.backend.dailychallenge.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.campuscoders.backend.dailychallenge.UserDailyChallengeAttempt;

public interface UserDailyChallengeAttemptRepository extends JpaRepository<UserDailyChallengeAttempt, Long> {

  // Efficient duplicate completion check before persisting an attempt.
  boolean existsByUserIdAndDailyChallengeId(Long userId, Long dailyChallengeId);

  Optional<UserDailyChallengeAttempt> findByUserIdAndDailyChallengeId(Long userId, Long dailyChallengeId);

  List<UserDailyChallengeAttempt> findAllByUserIdOrderByCompletedAtDesc(Long userId);
}
