package com.campuscoders.backend.announcement;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.campuscoders.backend.announcement.dto.AnnouncementResponse;
import com.campuscoders.backend.announcement.dto.CreateAnnouncementRequest;
import com.campuscoders.backend.announcement.dto.UpdateAnnouncementRequest;
import com.campuscoders.backend.common.dto.PageResponse;

import jakarta.validation.Valid;

@RestController
public class AnnouncementController {

  private final AnnouncementService announcementService;

  public AnnouncementController(AnnouncementService announcementService) {
    this.announcementService = announcementService;
  }

  @GetMapping("/api/announcements")
  public PageResponse<AnnouncementResponse> getActiveAnnouncements(
      @PageableDefault(page = 0, size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
    return announcementService.getActiveAnnouncements(pageable);
  }

  @PreAuthorize("hasRole('ADMIN')")
  @GetMapping("/api/admin/announcements")
  public PageResponse<AnnouncementResponse> getAnnouncementsForAdmin(
      @PageableDefault(page = 0, size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
    return announcementService.getAnnouncementsForAdmin(pageable);
  }

  @PreAuthorize("hasRole('ADMIN')")
  @PostMapping("/api/admin/announcements")
  public AnnouncementResponse createAnnouncement(@Valid @RequestBody CreateAnnouncementRequest request) {
    return announcementService.createAnnouncement(request);
  }

  @PreAuthorize("hasRole('ADMIN')")
  @PutMapping("/api/admin/announcements/{announcementId}")
  public AnnouncementResponse updateAnnouncement(
      @PathVariable Long announcementId,
      @Valid @RequestBody UpdateAnnouncementRequest request) {
    return announcementService.updateAnnouncement(announcementId, request);
  }

  @PreAuthorize("hasRole('ADMIN')")
  @PatchMapping("/api/admin/announcements/{announcementId}/deactivate")
  public AnnouncementResponse deactivateAnnouncement(@PathVariable Long announcementId) {
    return announcementService.deactivateAnnouncement(announcementId);
  }

  @PreAuthorize("hasRole('ADMIN')")
  @PatchMapping("/api/admin/announcements/{announcementId}/activate")
  public AnnouncementResponse activateAnnouncement(@PathVariable Long announcementId) {
    return announcementService.activateAnnouncement(announcementId);
  }
}