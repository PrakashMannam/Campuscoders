package com.campuscoders.backend.event;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.campuscoders.backend.event.dto.CampusEventResponse;

@RestController
public class CampusEventController {

  private final CampusEventService campusEventService;

  public CampusEventController(CampusEventService campusEventService) {
    this.campusEventService = campusEventService;
  }

  @GetMapping("/api/events/upcoming")
  public List<CampusEventResponse> getUpcoming(
      @RequestParam(required = false, defaultValue = "8") int limit) {
    return campusEventService.getUpcoming(limit);
  }

  @PreAuthorize("hasRole('ADMIN')")
  @GetMapping("/api/admin/events")
  public List<CampusEventResponse> getAllForAdmin() {
    return campusEventService.getAllForAdmin();
  }
}
