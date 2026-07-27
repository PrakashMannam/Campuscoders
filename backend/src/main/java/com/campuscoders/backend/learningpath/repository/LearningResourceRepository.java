package com.campuscoders.backend.learningpath.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.campuscoders.backend.learningpath.LearningResource;

public interface LearningResourceRepository extends JpaRepository<LearningResource, Long> {

  // Fetches visible resources in the exact order the topic detail page should show them.
  List<LearningResource> findByTopicIdAndActiveTrueOrderBySortOrderAsc(Long topicId);
}