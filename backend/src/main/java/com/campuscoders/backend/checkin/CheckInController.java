package com.campuscoders.backend.checkin;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.campuscoders.backend.checkin.dto.CheckInStatusResponse;

@RestController
@RequestMapping("/api/check-ins")
public class CheckInController {

  private final CheckInService checkInService;

  public CheckInController(CheckInService checkInService) {
    this.checkInService = checkInService;
  }

  @GetMapping("/status")
  public CheckInStatusResponse getTodayStatus(Authentication authentication) {
    return checkInService.getTodayStatus(authentication.getName());
  }

  @PostMapping("/today")
  public CheckInStatusResponse checkInToday(Authentication authentication) {
    return checkInService.checkInToday(authentication.getName());
  }
}