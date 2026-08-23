package com.campuscoders.backend.dailychallenge;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.campuscoders.backend.dailychallenge.dto.CodingProblemResponse;
import com.campuscoders.backend.dailychallenge.dto.CreateCodingProblemRequest;
import com.campuscoders.backend.dailychallenge.dto.CreateDailyChallengeRequest;
import com.campuscoders.backend.dailychallenge.dto.DailyChallengeResponse;
import com.campuscoders.backend.dailychallenge.dto.UpdateCodingProblemRequest;
import com.campuscoders.backend.dailychallenge.dto.UpdateDailyChallengeRequest;
import com.campuscoders.backend.dailychallenge.repository.CodingProblemRepository;
import com.campuscoders.backend.dailychallenge.repository.DailyChallengeRepository;
import com.campuscoders.backend.exception.CustomException;
import com.campuscoders.backend.notification.NotificationService;
import com.campuscoders.backend.notification.NotificationType;
import com.campuscoders.backend.user.User;
import com.campuscoders.backend.user.repository.UserRepository;

@Service
public class DailyChallengeService {

  private final CodingProblemRepository codingProblemRepository;
  private final DailyChallengeRepository dailyChallengeRepository;
  private final UserRepository userRepository;
  private final NotificationService notificationService;

  public DailyChallengeService(
      CodingProblemRepository codingProblemRepository,
      DailyChallengeRepository dailyChallengeRepository,
      UserRepository userRepository,
      NotificationService notificationService) {
    this.codingProblemRepository = codingProblemRepository;
    this.dailyChallengeRepository = dailyChallengeRepository;
    this.userRepository = userRepository;
    this.notificationService = notificationService;
  }

  @Transactional(readOnly = true)
  public DailyChallengeResponse getTodayChallenge(String userEmail) {
    getUserByEmail(userEmail);
    LocalDate today = LocalDate.now(ZoneOffset.UTC);

    DailyChallenge challenge = dailyChallengeRepository.findByChallengeDateAndActiveTrue(today)
        .orElseThrow(() -> new CustomException("No active daily challenge found for today", HttpStatus.NOT_FOUND));

    return toDailyChallengeResponse(challenge);
  }

  @Transactional(readOnly = true)
  public List<DailyChallengeResponse> getChallengeHistory(String userEmail) {
    getUserByEmail(userEmail);

    return dailyChallengeRepository.findByActiveTrueOrderByChallengeDateDesc().stream()
        .map(this::toDailyChallengeResponse)
        .toList();
  }

  @Transactional
  public CodingProblemResponse createCodingProblem(CreateCodingProblemRequest req) {
    CodingProblem problem = new CodingProblem();
    problem.setTitle(req.title());
    problem.setPlatform(req.platform());
    problem.setProblemUrl(req.problemUrl());
    problem.setDifficulty(req.difficulty());
    problem.setTags(req.tags());
    problem.setActive(true);

    CodingProblem saved = codingProblemRepository.save(problem);
    return toCodingProblemResponse(saved);
  }

  @Transactional(readOnly = true)
  public List<CodingProblemResponse> getAllCodingProblemsForAdmin() {
    return codingProblemRepository.findAllByOrderByCreatedAtDesc().stream()
        .map(this::toCodingProblemResponse)
        .toList();
  }

  @Transactional
  public CodingProblemResponse updateCodingProblem(Long problemId, UpdateCodingProblemRequest req) {
    CodingProblem problem = codingProblemRepository.findById(problemId)
        .orElseThrow(() -> new CustomException("Coding problem not found", HttpStatus.NOT_FOUND));
    problem.setTitle(req.title());
    problem.setPlatform(req.platform());
    problem.setProblemUrl(req.problemUrl());
    problem.setDifficulty(req.difficulty());
    problem.setTags(req.tags());
    problem.setActive(req.active());
    return toCodingProblemResponse(codingProblemRepository.save(problem));
  }

  @Transactional
  public CodingProblemResponse deactivateCodingProblem(Long problemId) {
    CodingProblem problem = codingProblemRepository.findById(problemId)
        .orElseThrow(() -> new CustomException("Coding problem not found", HttpStatus.NOT_FOUND));
    problem.setActive(false);
    return toCodingProblemResponse(codingProblemRepository.save(problem));
  }

  @Transactional
  public CodingProblemResponse activateCodingProblem(Long problemId) {
    CodingProblem problem = codingProblemRepository.findById(problemId)
        .orElseThrow(() -> new CustomException("Coding problem not found", HttpStatus.NOT_FOUND));
    problem.setActive(true);
    return toCodingProblemResponse(codingProblemRepository.save(problem));
  }

  @Transactional
  public DailyChallengeResponse createDailyChallenge(CreateDailyChallengeRequest req) {
    CodingProblem problem = codingProblemRepository.findById(req.codingProblemId())
        .orElseThrow(() -> new CustomException("Coding problem not found", HttpStatus.NOT_FOUND));

    if (dailyChallengeRepository.existsByChallengeDateAndActiveTrue(req.challengeDate())) {
      throw new CustomException("An active daily challenge already exists for date " + req.challengeDate(),
          HttpStatus.BAD_REQUEST);
    }

    DailyChallenge challenge = new DailyChallenge();
    challenge.setCodingProblem(problem);
    challenge.setChallengeDate(req.challengeDate());
    challenge.setXpReward(0);
    challenge.setActive(true);

    DailyChallenge saved = dailyChallengeRepository.save(challenge);

    if (req.challengeDate().equals(LocalDate.now(ZoneOffset.UTC))) {
      notificationService.notifyAllUsers(
          "New Daily Challenge",
          "Today's coding problem is now available: " + problem.getTitle(),
          NotificationType.SYSTEM,
          "/dashboard/practice");
    }

    return toDailyChallengeResponse(saved);
  }

  @Transactional(readOnly = true)
  public List<DailyChallengeResponse> getAllDailyChallengesForAdmin() {
    return dailyChallengeRepository.findAllByOrderByChallengeDateDesc().stream()
        .map(this::toDailyChallengeResponse)
        .toList();
  }

  @Transactional
  public DailyChallengeResponse updateDailyChallenge(Long challengeId, UpdateDailyChallengeRequest req) {
    DailyChallenge challenge = dailyChallengeRepository.findById(challengeId)
        .orElseThrow(() -> new CustomException("Daily challenge not found", HttpStatus.NOT_FOUND));

    CodingProblem problem = codingProblemRepository.findById(req.codingProblemId())
        .orElseThrow(() -> new CustomException("Coding problem not found", HttpStatus.NOT_FOUND));

    challenge.setCodingProblem(problem);
    challenge.setChallengeDate(req.challengeDate());
    challenge.setXpReward(0);
    challenge.setActive(req.active());

    return toDailyChallengeResponse(dailyChallengeRepository.save(challenge));
  }

  @Transactional
  public DailyChallengeResponse deactivateDailyChallenge(Long challengeId) {
    DailyChallenge challenge = dailyChallengeRepository.findById(challengeId)
        .orElseThrow(() -> new CustomException("Daily challenge not found", HttpStatus.NOT_FOUND));
    challenge.setActive(false);
    return toDailyChallengeResponse(dailyChallengeRepository.save(challenge));
  }

  @Transactional
  public DailyChallengeResponse activateDailyChallenge(Long challengeId) {
    DailyChallenge challenge = dailyChallengeRepository.findById(challengeId)
        .orElseThrow(() -> new CustomException("Daily challenge not found", HttpStatus.NOT_FOUND));
    challenge.setActive(true);
    return toDailyChallengeResponse(dailyChallengeRepository.save(challenge));
  }

  private User getUserByEmail(String email) {
    return userRepository.findByEmail(email)
        .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));
  }

  private CodingProblemResponse toCodingProblemResponse(CodingProblem problem) {
    if (problem == null)
      return null;
    return new CodingProblemResponse(
        problem.getId(),
        problem.getTitle(),
        problem.getPlatform(),
        problem.getProblemUrl(),
        problem.getDifficulty(),
        problem.getTags(),
        problem.getActive());
  }

  private DailyChallengeResponse toDailyChallengeResponse(DailyChallenge challenge) {
    return new DailyChallengeResponse(
        challenge.getId(),
        toCodingProblemResponse(challenge.getCodingProblem()),
        challenge.getChallengeDate(),
        challenge.getActive());
  }
}
