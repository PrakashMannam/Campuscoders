package com.campuscoders.backend.dailychallenge;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.campuscoders.backend.dailychallenge.dto.CodingProblemResponse;
import com.campuscoders.backend.dailychallenge.dto.CompleteDailyChallengeResponse;
import com.campuscoders.backend.dailychallenge.dto.CreateCodingProblemRequest;
import com.campuscoders.backend.dailychallenge.dto.CreateDailyChallengeRequest;
import com.campuscoders.backend.dailychallenge.dto.DailyChallengeResponse;
import com.campuscoders.backend.dailychallenge.dto.UpdateCodingProblemRequest;
import com.campuscoders.backend.dailychallenge.dto.UpdateDailyChallengeRequest;
import com.campuscoders.backend.dailychallenge.repository.CodingProblemRepository;
import com.campuscoders.backend.dailychallenge.repository.DailyChallengeRepository;
import com.campuscoders.backend.dailychallenge.repository.UserDailyChallengeAttemptRepository;
import com.campuscoders.backend.exception.CustomException;
import com.campuscoders.backend.user.User;
import com.campuscoders.backend.user.repository.UserRepository;

@Service
public class DailyChallengeService {

  private final CodingProblemRepository codingProblemRepository;
  private final DailyChallengeRepository dailyChallengeRepository;
  private final UserDailyChallengeAttemptRepository attemptRepository;
  private final UserRepository userRepository;

  public DailyChallengeService(
      CodingProblemRepository codingProblemRepository,
      DailyChallengeRepository dailyChallengeRepository,
      UserDailyChallengeAttemptRepository attemptRepository,
      UserRepository userRepository) {
    this.codingProblemRepository = codingProblemRepository;
    this.dailyChallengeRepository = dailyChallengeRepository;
    this.attemptRepository = attemptRepository;
    this.userRepository = userRepository;
  }

  // --- Student Service Methods ---

  // Fetches today's active challenge using LocalDate.now() and checks whether authenticated student completed it.
  @Transactional(readOnly = true)
  public DailyChallengeResponse getTodayChallenge(String userEmail) {
    User user = getUserByEmail(userEmail);
    LocalDate today = LocalDate.now();

    DailyChallenge challenge = dailyChallengeRepository.findByChallengeDateAndActiveTrue(today)
        .orElseThrow(() -> new CustomException("No active daily challenge found for today", HttpStatus.NOT_FOUND));

    boolean completed = attemptRepository.existsByUserIdAndDailyChallengeId(user.getId(), challenge.getId());

    return toDailyChallengeResponse(challenge, completed);
  }

  // Atomically completes today's challenge: saves attempt, awards XP, and increments problemsSolved.
  // Both XP increment and attempt persistence MUST happen in one transaction to avoid partial DB state.
  @Transactional
  public CompleteDailyChallengeResponse completeChallenge(String userEmail, Long dailyChallengeId) {
    User user = getUserByEmail(userEmail);

    DailyChallenge challenge = dailyChallengeRepository.findById(dailyChallengeId)
        .orElseThrow(() -> new CustomException("Daily challenge not found", HttpStatus.NOT_FOUND));

    if (!challenge.getActive()) {
      throw new CustomException("This daily challenge is no longer active", HttpStatus.BAD_REQUEST);
    }

    // Duplicate Completion Guard: Prevents double XP claims for the same daily challenge.
    if (attemptRepository.existsByUserIdAndDailyChallengeId(user.getId(), dailyChallengeId)) {
      throw new CustomException("You have already completed this daily challenge", HttpStatus.BAD_REQUEST);
    }

    // 1️⃣ Save attempt bridge entity
    UserDailyChallengeAttempt attempt = new UserDailyChallengeAttempt();
    attempt.setUser(user);
    attempt.setDailyChallenge(challenge);
    attempt.setXpAwarded(challenge.getXpReward());
    UserDailyChallengeAttempt savedAttempt = attemptRepository.save(attempt);

    // 2️⃣ Mutate user statistics atomically: add XP reward and increment problemsSolved counter
    user.setTotalXp(user.getTotalXp() + challenge.getXpReward());
    user.setProblemsSolved(user.getProblemsSolved() + 1);
    User updatedUser = userRepository.save(user);

    return new CompleteDailyChallengeResponse(
        challenge.getId(),
        challenge.getCodingProblem().getTitle(),
        challenge.getXpReward(),
        updatedUser.getTotalXp(),
        updatedUser.getProblemsSolved(),
        savedAttempt.getCompletedAt());
  }

  // Fetches historical daily challenges alongside user's completion status.
  @Transactional(readOnly = true)
  public List<DailyChallengeResponse> getChallengeHistory(String userEmail) {
    User user = getUserByEmail(userEmail);

    return dailyChallengeRepository.findByActiveTrueOrderByChallengeDateDesc().stream()
        .map(challenge -> {
          boolean completed = attemptRepository.existsByUserIdAndDailyChallengeId(user.getId(), challenge.getId());
          return toDailyChallengeResponse(challenge, completed);
        })
        .toList();
  }

  // --- Admin Service Methods ---

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
    return codingProblemRepository.findAll().stream()
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

    CodingProblem saved = codingProblemRepository.save(problem);
    return toCodingProblemResponse(saved);
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

    // One Challenge Per Date Guard: Avoid assigning multiple active challenges to the exact same date.
    if (dailyChallengeRepository.existsByChallengeDateAndActiveTrue(req.challengeDate())) {
      throw new CustomException("An active daily challenge already exists for date " + req.challengeDate(), HttpStatus.BAD_REQUEST);
    }

    DailyChallenge challenge = new DailyChallenge();
    challenge.setCodingProblem(problem);
    challenge.setChallengeDate(req.challengeDate());
    challenge.setXpReward(req.xpReward());
    challenge.setActive(true);

    DailyChallenge saved = dailyChallengeRepository.save(challenge);
    return toDailyChallengeResponse(saved, false);
  }

  @Transactional(readOnly = true)
  public List<DailyChallengeResponse> getAllDailyChallengesForAdmin() {
    return dailyChallengeRepository.findAllByOrderByChallengeDateDesc().stream()
        .map(challenge -> toDailyChallengeResponse(challenge, false))
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
    challenge.setXpReward(req.xpReward());
    challenge.setActive(req.active());

    DailyChallenge saved = dailyChallengeRepository.save(challenge);
    return toDailyChallengeResponse(saved, false);
  }

  @Transactional
  public DailyChallengeResponse deactivateDailyChallenge(Long challengeId) {
    DailyChallenge challenge = dailyChallengeRepository.findById(challengeId)
        .orElseThrow(() -> new CustomException("Daily challenge not found", HttpStatus.NOT_FOUND));
    challenge.setActive(false);
    return toDailyChallengeResponse(dailyChallengeRepository.save(challenge), false);
  }

  @Transactional
  public DailyChallengeResponse activateDailyChallenge(Long challengeId) {
    DailyChallenge challenge = dailyChallengeRepository.findById(challengeId)
        .orElseThrow(() -> new CustomException("Daily challenge not found", HttpStatus.NOT_FOUND));
    challenge.setActive(true);
    return toDailyChallengeResponse(dailyChallengeRepository.save(challenge), false);
  }

  // --- Helper Mapping Methods ---

  private User getUserByEmail(String email) {
    return userRepository.findByEmail(email)
        .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));
  }

  private CodingProblemResponse toCodingProblemResponse(CodingProblem problem) {
    return new CodingProblemResponse(
        problem.getId(),
        problem.getTitle(),
        problem.getPlatform(),
        problem.getProblemUrl(),
        problem.getDifficulty(),
        problem.getTags(),
        problem.getActive());
  }

  private DailyChallengeResponse toDailyChallengeResponse(DailyChallenge challenge, boolean completed) {
    return new DailyChallengeResponse(
        challenge.getId(),
        toCodingProblemResponse(challenge.getCodingProblem()),
        challenge.getChallengeDate(),
        challenge.getXpReward(),
        challenge.getActive(),
        completed);
  }
}
