package com.campuscoders.backend.announcement;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.campuscoders.backend.announcement.dto.AnnouncementResponse;
import com.campuscoders.backend.announcement.dto.CreateAnnouncementRequest;
import com.campuscoders.backend.announcement.dto.UpdateAnnouncementRequest;
import com.campuscoders.backend.announcement.repository.AnnouncementRepository;

@Service
public class AnnouncementService {

  private final AnnouncementRepository announcementRepository;

  public AnnouncementService(AnnouncementRepository announcementRepository) {
    this.announcementRepository = announcementRepository;
  }

  public List<AnnouncementResponse> getActiveAnnouncements() {
    return announcementRepository.findByActiveTrueOrderByCreatedAtDesc()
        .stream()
        .map(this::toResponse)
        .toList();
  }

  public List<AnnouncementResponse> getAnnouncementsForAdmin() {
    return announcementRepository.findAll()
        .stream()
        .map(this::toResponse)
        .toList();
  }

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

  public AnnouncementResponse deactivateAnnouncement(Long announcementId) {
    Announcement announcement = findAnnouncementById(announcementId);
    announcement.setActive(false);
    return toResponse(announcementRepository.save(announcement));
  }

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