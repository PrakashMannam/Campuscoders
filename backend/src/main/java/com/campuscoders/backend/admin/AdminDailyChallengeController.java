package com.campuscoders.backend.admin;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.campuscoders.backend.dailychallenge.DailyChallengeService;
import com.campuscoders.backend.dailychallenge.dto.CodingProblemResponse;
import com.campuscoders.backend.dailychallenge.dto.CreateCodingProblemRequest;
import com.campuscoders.backend.dailychallenge.dto.CreateDailyChallengeRequest;
import com.campuscoders.backend.dailychallenge.dto.DailyChallengeResponse;
import com.campuscoders.backend.dailychallenge.dto.UpdateCodingProblemRequest;
import com.campuscoders.backend.dailychallenge.dto.UpdateDailyChallengeRequest;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminDailyChallengeController {

  private final DailyChallengeService dailyChallengeService;

  public AdminDailyChallengeController(DailyChallengeService dailyChallengeService) {
    this.dailyChallengeService = dailyChallengeService;
  }

  // --- Coding Problem Bank Endpoints ---

  @PostMapping("/coding-problems")
  public CodingProblemResponse createCodingProblem(@Valid @RequestBody CreateCodingProblemRequest request) {
    return dailyChallengeService.createCodingProblem(request);
  }

  @GetMapping("/coding-problems")
  public List<CodingProblemResponse> getAllCodingProblemsForAdmin() {
    return dailyChallengeService.getAllCodingProblemsForAdmin();
  }

  @PutMapping("/coding-problems/{problemId}")
  public CodingProblemResponse updateCodingProblem(
      @PathVariable Long problemId,
      @Valid @RequestBody UpdateCodingProblemRequest request) {
    return dailyChallengeService.updateCodingProblem(problemId, request);
  }

  @PatchMapping("/coding-problems/{problemId}/deactivate")
  public CodingProblemResponse deactivateCodingProblem(@PathVariable Long problemId) {
    return dailyChallengeService.deactivateCodingProblem(problemId);
  }

  @PatchMapping("/coding-problems/{problemId}/activate")
  public CodingProblemResponse activateCodingProblem(@PathVariable Long problemId) {
    return dailyChallengeService.activateCodingProblem(problemId);
  }

  // --- Daily Challenge Schedule Endpoints ---

  @PostMapping("/daily-challenges")
  public DailyChallengeResponse createDailyChallenge(@Valid @RequestBody CreateDailyChallengeRequest request) {
    return dailyChallengeService.createDailyChallenge(request);
  }

  @GetMapping("/daily-challenges")
  public List<DailyChallengeResponse> getAllDailyChallengesForAdmin() {
    return dailyChallengeService.getAllDailyChallengesForAdmin();
  }

  @PutMapping("/daily-challenges/{dailyChallengeId}")
  public DailyChallengeResponse updateDailyChallenge(
      @PathVariable Long dailyChallengeId,
      @Valid @RequestBody UpdateDailyChallengeRequest request) {
    return dailyChallengeService.updateDailyChallenge(dailyChallengeId, request);
  }

  @PatchMapping("/daily-challenges/{dailyChallengeId}/deactivate")
  public DailyChallengeResponse deactivateDailyChallenge(@PathVariable Long dailyChallengeId) {
    return dailyChallengeService.deactivateDailyChallenge(dailyChallengeId);
  }

  @PatchMapping("/daily-challenges/{dailyChallengeId}/activate")
  public DailyChallengeResponse activateDailyChallenge(@PathVariable Long dailyChallengeId) {
    return dailyChallengeService.activateDailyChallenge(dailyChallengeId);
  }
}
