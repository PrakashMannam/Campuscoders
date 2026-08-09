package com.campuscoders.backend.dailychallenge;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.campuscoders.backend.dailychallenge.dto.CompleteDailyChallengeResponse;
import com.campuscoders.backend.dailychallenge.dto.DailyChallengeResponse;

@RestController
@RequestMapping("/api/daily-challenge")
public class DailyChallengeController {

  private final DailyChallengeService dailyChallengeService;

  public DailyChallengeController(DailyChallengeService dailyChallengeService) {
    this.dailyChallengeService = dailyChallengeService;
  }

  // Returns today's active Problem of the Day alongside student completion status.
  @GetMapping("/today")
  public DailyChallengeResponse getTodayChallenge(Authentication authentication) {
    return dailyChallengeService.getTodayChallenge(authentication.getName());
  }

  // Completes a daily challenge, awards XP reward, and increments total problems solved count.
  @PostMapping("/{dailyChallengeId}/complete")
  public CompleteDailyChallengeResponse completeChallenge(
      Authentication authentication,
      @PathVariable Long dailyChallengeId) {
    return dailyChallengeService.completeChallenge(authentication.getName(), dailyChallengeId);
  }

  // Returns past daily challenges and completion statuses for historical overview.
  @GetMapping("/history")
  public List<DailyChallengeResponse> getChallengeHistory(Authentication authentication) {
    return dailyChallengeService.getChallengeHistory(authentication.getName());
  }
}
