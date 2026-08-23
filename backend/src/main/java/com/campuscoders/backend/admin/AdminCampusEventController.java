package com.campuscoders.backend.admin;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.campuscoders.backend.event.CampusEventService;
import com.campuscoders.backend.event.dto.CampusEventResponse;
import com.campuscoders.backend.event.dto.CreateCampusEventRequest;
import com.campuscoders.backend.event.dto.UpdateCampusEventRequest;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/events")
@PreAuthorize("hasRole('ADMIN')")
public class AdminCampusEventController {

  private final CampusEventService campusEventService;

  public AdminCampusEventController(CampusEventService campusEventService) {
    this.campusEventService = campusEventService;
  }

  @PostMapping
  public CampusEventResponse create(@Valid @RequestBody CreateCampusEventRequest request) {
    return campusEventService.create(request);
  }

  @PutMapping("/{eventId}")
  public CampusEventResponse update(
      @PathVariable Long eventId,
      @Valid @RequestBody UpdateCampusEventRequest request) {
    return campusEventService.update(eventId, request);
  }

  @PatchMapping("/{eventId}/deactivate")
  public CampusEventResponse deactivate(@PathVariable Long eventId) {
    return campusEventService.setActive(eventId, false);
  }

  @PatchMapping("/{eventId}/activate")
  public CampusEventResponse activate(@PathVariable Long eventId) {
    return campusEventService.setActive(eventId, true);
  }
}
