package com.campuscoders.backend.dailychallenge.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.campuscoders.backend.dailychallenge.DailyChallenge;

public interface DailyChallengeRepository extends JpaRepository<DailyChallenge, Long> {

  // Finds active daily challenge mapped to the target date.
  Optional<DailyChallenge> findByChallengeDateAndActiveTrue(LocalDate challengeDate);

  Optional<DailyChallenge> findByChallengeDate(LocalDate challengeDate);

  boolean existsByChallengeDateAndActiveTrue(LocalDate challengeDate);

  List<DailyChallenge> findByActiveTrueOrderByChallengeDateDesc();

  List<DailyChallenge> findAllByOrderByChallengeDateDesc();
}
