package com.campuscoders.backend.dashboard;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.campuscoders.backend.dashboard.dto.DashboardSummaryResponse;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

  private final DashboardService dashboardService;

  public DashboardController(DashboardService dashboardService) {
    this.dashboardService = dashboardService;
  }

  // Exposes user dashboard statistics. Authenticated user identity is retrieved securely from JWT context.
  @GetMapping("/summary")
  public DashboardSummaryResponse getCurrentUserSummary(Authentication authentication) {
    return dashboardService.getCurrentUserSummary(authentication.getName());
  }
}