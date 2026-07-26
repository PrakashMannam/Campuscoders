package com.campuscoders.backend.learningpath.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.campuscoders.backend.learningpath.LearningPath;

public interface LearningPathRepository extends JpaRepository<LearningPath, Long> {

  List<LearningPath> findByActiveTrueOrderByTitleAsc();

  Optional<LearningPath> findBySlug(String slug);

  boolean existsBySlug(String slug);
}
