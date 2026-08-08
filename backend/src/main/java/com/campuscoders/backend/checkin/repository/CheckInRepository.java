package com.campuscoders.backend.checkin.repository;

import java.time.LocalDate;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.campuscoders.backend.checkin.CheckIn;

public interface CheckInRepository extends JpaRepository<CheckIn, Long> {

  boolean existsByUserIdAndCheckInDate(Long userId, LocalDate checkInDate);

  Optional<CheckIn> findByUserIdAndCheckInDate(Long userId, LocalDate checkInDate);
}