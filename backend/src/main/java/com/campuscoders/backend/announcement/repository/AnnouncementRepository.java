package com.campuscoders.backend.announcement.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.campuscoders.backend.announcement.Announcement;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

  List<Announcement> findByActiveTrueOrderByCreatedAtDesc();

  long countByActiveTrue();
}