package com.campuscoders.backend.discussion.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.campuscoders.backend.discussion.DiscussionCategory;

public interface DiscussionCategoryRepository extends JpaRepository<DiscussionCategory, Long> {

  List<DiscussionCategory> findByActiveTrueOrderBySortOrderAscNameAsc();

  List<DiscussionCategory> findAllByOrderBySortOrderAscNameAsc();

  Optional<DiscussionCategory> findBySlug(String slug);

  Optional<DiscussionCategory> findBySlugAndActiveTrue(String slug);

  boolean existsBySlug(String slug);

  boolean existsBySlugAndIdNot(String slug, Long id);
}
