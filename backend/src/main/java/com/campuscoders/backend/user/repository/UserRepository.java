package com.campuscoders.backend.user.repository;

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
}