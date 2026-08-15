package com.campuscoders.backend.announcement.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.campuscoders.backend.announcement.Announcement;
import com.campuscoders.backend.announcement.AnnouncementCategory;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

  List<Announcement> findByActiveTrueOrderByCreatedAtDesc();

  Page<Announcement> findByActiveTrue(Pageable pageable);

  // Database-side filtering JPQL query for optional active status, category, and keyword search matching title or message.
  @Query("SELECT a FROM Announcement a " +
         "WHERE (:active IS NULL OR a.active = :active) " +
         "AND (:category IS NULL OR a.category = :category) " +
         "AND (:search IS NULL OR :search = '' OR " +
         "     LOWER(a.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
         "     LOWER(a.message) LIKE LOWER(CONCAT('%', :search, '%')))")
  Page<Announcement> findAnnouncements(
      @Param("active") Boolean active,
      @Param("category") AnnouncementCategory category,
      @Param("search") String search,
      Pageable pageable);

  long countByActiveTrue();
}