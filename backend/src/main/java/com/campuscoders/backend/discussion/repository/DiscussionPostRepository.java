package com.campuscoders.backend.discussion.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.campuscoders.backend.discussion.DiscussionPost;

public interface DiscussionPostRepository extends JpaRepository<DiscussionPost, Long> {

  List<DiscussionPost> findByActiveTrueOrderByCreatedAtDesc();

  Optional<DiscussionPost> findByIdAndActiveTrue(Long id);

  List<DiscussionPost> findAllByOrderByCreatedAtDesc();

  @Query("SELECT p FROM DiscussionPost p " +
         "WHERE p.active = true " +
         "AND (:slug IS NULL OR :slug = '' OR LOWER(p.category.slug) = LOWER(:slug)) " +
         "AND (:featured IS NULL OR p.featured = :featured) " +
         "AND (:search IS NULL OR :search = '' OR " +
         "     LOWER(p.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
         "     LOWER(p.content) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
         "     (p.tags IS NOT NULL AND LOWER(p.tags) LIKE LOWER(CONCAT('%', :search, '%')))) " +
         "AND (:unanswered IS NULL OR p.repliesCount = 0)")
  Page<DiscussionPost> findActiveDiscussions(
      @Param("slug") String categorySlug,
      @Param("featured") Boolean featured,
      @Param("search") String search,
      @Param("unanswered") Boolean unanswered,
      Pageable pageable);

  @Query("SELECT p FROM DiscussionPost p " +
         "WHERE (:active IS NULL OR p.active = :active) " +
         "AND (:slug IS NULL OR :slug = '' OR LOWER(p.category.slug) = LOWER(:slug)) " +
         "AND (:featured IS NULL OR p.featured = :featured) " +
         "AND (:search IS NULL OR :search = '' OR " +
         "     LOWER(p.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
         "     LOWER(p.content) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
         "     (p.tags IS NOT NULL AND LOWER(p.tags) LIKE LOWER(CONCAT('%', :search, '%'))))")
  Page<DiscussionPost> findAdminDiscussions(
      @Param("slug") String categorySlug,
      @Param("featured") Boolean featured,
      @Param("active") Boolean active,
      @Param("search") String search,
      Pageable pageable);
}

