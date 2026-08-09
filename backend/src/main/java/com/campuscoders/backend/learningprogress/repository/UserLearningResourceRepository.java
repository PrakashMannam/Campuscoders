package com.campuscoders.backend.learningprogress.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.campuscoders.backend.learningprogress.UserLearningResource;

public interface UserLearningResourceRepository extends JpaRepository<UserLearningResource, Long> {

  // Spring Data JPA derives SQL query automatically based on field names: user.id and resource.id
  boolean existsByUserIdAndResourceId(Long userId, Long resourceId);

  Optional<UserLearningResource> findByUserIdAndResourceId(Long userId, Long resourceId);

  // Fast fetch of all completed items for a given user without loading unneeded global progress data.
  List<UserLearningResource> findAllByUserId(Long userId);
}
