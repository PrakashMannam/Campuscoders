package com.campuscoders.backend.learningpath.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.campuscoders.backend.learningpath.LearningResource;

public interface LearningResourceRepository extends JpaRepository<LearningResource, Long> {

  // Fetches visible resources for general browsing pages.
  List<LearningResource> findByActiveTrueOrderByTitleAsc();

  long countByActiveTrue();

  // Fetches one visible resource for public detail views.
  Optional<LearningResource> findByIdAndActiveTrue(Long id);

  // Fetches visible resources in the exact order the topic detail page should show them.
  List<LearningResource> findByTopicIdAndActiveTrueOrderBySortOrderAsc(Long topicId);
}