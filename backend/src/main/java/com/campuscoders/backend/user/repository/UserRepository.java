package com.campuscoders.backend.user.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.campuscoders.backend.user.Role;
import com.campuscoders.backend.user.User;

public interface UserRepository extends JpaRepository<User, Long> {

  // Email is used as the login username.
  Optional<User> findByEmail(String email);

  // Used during registration to reject duplicate accounts quickly.
  boolean existsByEmail(String email);

  // Database-side user filtering and search for admin endpoints
  @Query("SELECT u FROM User u " +
         "WHERE (:role IS NULL OR u.role = :role) " +
         "AND (:enabled IS NULL OR u.enabled = :enabled) " +
         "AND (:search IS NULL OR :search = '' OR " +
         "     LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
         "     LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))")
  Page<User> findAdminUsers(
      @Param("role") Role role,
      @Param("enabled") Boolean enabled,
      @Param("search") String search,
      Pageable pageable);

  // Database-side filtering and multi-tier tie-break sorting for Leaderboard rankings.
  // Performs enabled = true filtering and ORDER BY totalXp DESC, problemsSolved DESC, dailyStreak DESC, createdAt ASC directly in SQL.
  @Query("SELECT u FROM User u " +
         "WHERE u.enabled = true " +
         "ORDER BY COALESCE(u.totalXp, 0) DESC, " +
         "COALESCE(u.problemsSolved, 0) DESC, " +
         "COALESCE(u.dailyStreak, 0) DESC, " +
         "u.createdAt ASC")
  List<User> findLeaderboardUsers();
}