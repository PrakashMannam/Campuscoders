package com.campuscoders.backend.event;

import java.time.Instant;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.campuscoders.backend.event.dto.CampusEventResponse;
import com.campuscoders.backend.event.dto.CreateCampusEventRequest;
import com.campuscoders.backend.event.dto.UpdateCampusEventRequest;
import com.campuscoders.backend.event.repository.CampusEventRepository;
import com.campuscoders.backend.notification.NotificationService;
import com.campuscoders.backend.notification.NotificationType;

@Service
public class CampusEventService {

  private final CampusEventRepository campusEventRepository;
  private final NotificationService notificationService;

  public CampusEventService(CampusEventRepository campusEventRepository, NotificationService notificationService) {
    this.campusEventRepository = campusEventRepository;
    this.notificationService = notificationService;
  }

  @Transactional(readOnly = true)
  public List<CampusEventResponse> getUpcoming(int limit) {
    int size = Math.min(Math.max(limit, 1), 20);
    return campusEventRepository.findUpcoming(Instant.now()).stream()
        .limit(size)
        .map(this::toResponse)
        .toList();
  }

  @Transactional(readOnly = true)
  public List<CampusEventResponse> getAllForAdmin() {
    return campusEventRepository.findAllByOrderByStartsAtDesc().stream()
        .map(this::toResponse)
        .toList();
  }

  @Transactional
  public CampusEventResponse create(CreateCampusEventRequest request) {
    validateWindow(request.startsAt(), request.endsAt());
    CampusEvent event = new CampusEvent();
    apply(event, request.title(), request.description(), request.type(), request.platform(),
        request.startsAt(), request.endsAt(), request.actionLabel(), request.actionUrl());
    event.setActive(true);
    CampusEvent saved = campusEventRepository.save(event);
    
    notificationService.notifyAllUsers(
        "New Campus Event",
        "A new event '" + request.title() + "' has been scheduled.",
        NotificationType.SYSTEM,
        "/dashboard/community"
    );
    
    return toResponse(saved);
  }

  @Transactional
  public CampusEventResponse update(Long id, UpdateCampusEventRequest request) {
    validateWindow(request.startsAt(), request.endsAt());
    CampusEvent event = getOrThrow(id);
    apply(event, request.title(), request.description(), request.type(), request.platform(),
        request.startsAt(), request.endsAt(), request.actionLabel(), request.actionUrl());
    return toResponse(campusEventRepository.save(event));
  }

  @Transactional
  public CampusEventResponse setActive(Long id, boolean active) {
    CampusEvent event = getOrThrow(id);
    event.setActive(active);
    return toResponse(campusEventRepository.save(event));
  }

  private CampusEvent getOrThrow(Long id) {
    return campusEventRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));
  }

  private void validateWindow(Instant startsAt, Instant endsAt) {
    if (endsAt != null && endsAt.isBefore(startsAt)) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End time must be after start time");
    }
  }

  private void apply(
      CampusEvent event,
      String title,
      String description,
      CampusEventType type,
      String platform,
      Instant startsAt,
      Instant endsAt,
      String actionLabel,
      String actionUrl) {
    event.setTitle(title.trim());
    event.setDescription(blankToNull(description));
    event.setType(type);
    event.setPlatform(blankToNull(platform));
    event.setStartsAt(startsAt);
    event.setEndsAt(endsAt);
    event.setActionLabel(blankToNull(actionLabel));
    event.setActionUrl(blankToNull(actionUrl));
  }

  private String blankToNull(String value) {
    if (value == null || value.isBlank()) {
      return null;
    }
    return value.trim();
  }

  private CampusEventResponse toResponse(CampusEvent event) {
    return new CampusEventResponse(
        event.getId(),
        event.getTitle(),
        event.getDescription(),
        event.getType(),
        event.getPlatform(),
        event.getStartsAt(),
        event.getEndsAt(),
        event.getActionLabel(),
        event.getActionUrl(),
        event.getActive(),
        event.getCreatedAt(),
        event.getUpdatedAt());
  }
}
