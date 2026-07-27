package com.campuscoders.backend.user.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.campuscoders.backend.user.User;

public interface UserRepository extends JpaRepository<User, Long> {

  // Email is used as the login username.
  Optional<User> findByEmail(String email);

  // Used during registration to reject duplicate accounts quickly.
  boolean existsByEmail(String email);
}