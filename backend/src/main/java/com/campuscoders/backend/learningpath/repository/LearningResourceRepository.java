package com.campuscoders.backend.learningpath.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.campuscoders.backend.learningpath.LearningResource;

public interface LearningResourceRepository extends JpaRepository<LearningResource, Long> {

  List<LearningResource> findByTopicIdAndActiveTrueOrderBySortOrderAsc(Long topicId);
}
