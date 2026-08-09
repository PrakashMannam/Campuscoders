package com.campuscoders.backend.learningprogress.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.campuscoders.backend.learningprogress.UserLearningResource;

public interface UserLearningResourceRepository extends JpaRepository<UserLearningResource, Long> {

  boolean existsByUserIdAndResourceId(Long userId, Long resourceId);

  Optional<UserLearningResource> findByUserIdAndResourceId(Long userId, Long resourceId);

  List<UserLearningResource> findAllByUserId(Long userId);
}
