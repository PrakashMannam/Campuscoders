package com.campuscoders.backend.dailychallenge;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.campuscoders.backend.dailychallenge.dto.DailyChallengeResponse;

@RestController
@RequestMapping("/api/daily-challenge")
public class DailyChallengeController {

  private final DailyChallengeService dailyChallengeService;

  public DailyChallengeController(DailyChallengeService dailyChallengeService) {
    this.dailyChallengeService = dailyChallengeService;
  }

  // Returns today's active Problem of the Day (curated external link).
  @GetMapping("/today")
  public DailyChallengeResponse getTodayChallenge(Authentication authentication) {
    return dailyChallengeService.getTodayChallenge(authentication.getName());
  }

  // Returns past daily challenges for historical overview.
  @GetMapping("/history")
  public List<DailyChallengeResponse> getChallengeHistory(Authentication authentication) {
    return dailyChallengeService.getChallengeHistory(authentication.getName());
  }
}
