package com.campuscoders.backend.learningpath.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.campuscoders.backend.learningpath.Topic;

public interface TopicRepository extends JpaRepository<Topic, Long> {

  // Fetches visible topics in the exact order the frontend should display them.
  List<Topic> findByLearningPathIdAndActiveTrueOrderBySortOrderAsc(Long learningPathId);

  List<Topic> findByLearningPathId(Long learningPathId);

  Optional<Topic> findBySlug(String slug);

  boolean existsBySlug(String slug);
}