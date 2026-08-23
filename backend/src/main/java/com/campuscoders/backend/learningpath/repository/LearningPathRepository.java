package com.campuscoders.backend.learningpath.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.campuscoders.backend.learningpath.LearningPath;

public interface LearningPathRepository extends JpaRepository<LearningPath, Long> {

  // Used by the public Learning Hub list page.
  List<LearningPath> findByActiveTrueOrderByTitleAsc();

  Page<LearningPath> findByActiveTrue(Pageable pageable);

  // Placement Hub filters by exact category (e.g. "Placement").
  Page<LearningPath> findByActiveTrueAndCategoryIgnoreCase(String category, Pageable pageable);

  long countByActiveTrue();

  // Slug lookup supports readable URLs like /api/learning-paths/java-full-stack.
  Optional<LearningPath> findBySlug(String slug);

  // Used before creation to return a clean 409 instead of a database constraint error.
  boolean existsBySlug(String slug);
}