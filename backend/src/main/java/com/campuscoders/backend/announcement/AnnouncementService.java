package com.campuscoders.backend.announcement;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.campuscoders.backend.announcement.dto.AnnouncementResponse;
import com.campuscoders.backend.announcement.dto.CreateAnnouncementRequest;
import com.campuscoders.backend.announcement.dto.UpdateAnnouncementRequest;
import com.campuscoders.backend.announcement.repository.AnnouncementRepository;
import com.campuscoders.backend.common.dto.PageResponse;

@Service
public class AnnouncementService {

  private final AnnouncementRepository announcementRepository;

  public AnnouncementService(AnnouncementRepository announcementRepository) {
    this.announcementRepository = announcementRepository;
  }

  // Public endpoint for students: Filter to active announcements only with optional category and search string.
  @Transactional(readOnly = true)
  public PageResponse<AnnouncementResponse> getActiveAnnouncements(
      AnnouncementCategory category,
      String search,
      Pageable pageable) {
    Page<Announcement> page = announcementRepository.findAnnouncements(true, category, search, pageable);
    List<AnnouncementResponse> mapped = page.getContent().stream()
        .map(this::toResponse)
        .toList();
    return PageResponse.from(page, mapped);
  }

  // Admin endpoint: Fetch announcements supporting optional active state, category, and keyword search.
  @Transactional(readOnly = true)
  public PageResponse<AnnouncementResponse> getAnnouncementsForAdmin(
      Boolean active,
      AnnouncementCategory category,
      String search,
      Pageable pageable) {
    Page<Announcement> page = announcementRepository.findAnnouncements(active, category, search, pageable);
    List<AnnouncementResponse> mapped = page.getContent().stream()
        .map(this::toResponse)
        .toList();
    return PageResponse.from(page, mapped);
  }

  @Transactional
  public AnnouncementResponse createAnnouncement(CreateAnnouncementRequest request) {
    Announcement announcement = new Announcement();
    announcement.setTitle(request.title());
    announcement.setMessage(request.message());
    announcement.setCategory(request.category());
    announcement.setActionLabel(request.actionLabel());
    announcement.setActionUrl(request.actionUrl());
    announcement.setActive(true);

    return toResponse(announcementRepository.save(announcement));
  }

  @Transactional
  public AnnouncementResponse updateAnnouncement(Long announcementId, UpdateAnnouncementRequest request) {
    Announcement announcement = findAnnouncementById(announcementId);
    announcement.setTitle(request.title());
    announcement.setMessage(request.message());
    announcement.setCategory(request.category());
    announcement.setActionLabel(request.actionLabel());
    announcement.setActionUrl(request.actionUrl());
    announcement.setActive(request.active());

    return toResponse(announcementRepository.save(announcement));
  }

  // Soft-deactivate an announcement without deleting its historical database record.
  @Transactional
  public AnnouncementResponse deactivateAnnouncement(Long announcementId) {
    Announcement announcement = findAnnouncementById(announcementId);
    announcement.setActive(false);
    return toResponse(announcementRepository.save(announcement));
  }

  @Transactional
  public AnnouncementResponse activateAnnouncement(Long announcementId) {
    Announcement announcement = findAnnouncementById(announcementId);
    announcement.setActive(true);
    return toResponse(announcementRepository.save(announcement));
  }

  private Announcement findAnnouncementById(Long announcementId) {
    return announcementRepository.findById(announcementId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Announcement not found"));
  }

  private AnnouncementResponse toResponse(Announcement announcement) {
    return new AnnouncementResponse(
        announcement.getId(),
        announcement.getTitle(),
        announcement.getMessage(),
        announcement.getCategory(),
        announcement.getActionLabel(),
        announcement.getActionUrl(),
        announcement.getActive(),
        announcement.getCreatedAt(),
        announcement.getUpdatedAt());
  }
}