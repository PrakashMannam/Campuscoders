package com.campuscoders.backend.user.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.campuscoders.backend.user.User;


public interface UserRepository  extends JpaRepository<User, Long>{
  Optional<User> findByEmail(String email);

  boolean existsByEmail(String email);
}
