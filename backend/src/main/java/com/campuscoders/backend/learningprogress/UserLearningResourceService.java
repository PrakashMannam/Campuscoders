package com.campuscoders.backend.learningprogress;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.campuscoders.backend.exception.CustomException;
import com.campuscoders.backend.learningpath.LearningResource;
import com.campuscoders.backend.learningpath.repository.LearningResourceRepository;
import com.campuscoders.backend.learningprogress.dto.CompleteResourceRequest;
import com.campuscoders.backend.learningprogress.dto.CompletedResourceResponse;
import com.campuscoders.backend.learningprogress.repository.UserLearningResourceRepository;
import com.campuscoders.backend.user.User;
import com.campuscoders.backend.user.repository.UserRepository;

@Service
public class UserLearningResourceService {

  private final UserLearningResourceRepository ulrRepo;
  private final UserRepository userRepo;
  private final LearningResourceRepository lrRepo;

  public UserLearningResourceService(
      UserLearningResourceRepository ulrRepo,
      UserRepository userRepo,
      LearningResourceRepository lrRepo) {
    this.ulrRepo = ulrRepo;
    this.userRepo = userRepo;
    this.lrRepo = lrRepo;
  }

  @Transactional
  public CompletedResourceResponse complete(String userEmail, CompleteResourceRequest req) {
    User user = userRepo.findByEmail(userEmail)
        .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));
    return complete(user.getId(), req);
  }

  @Transactional
  public CompletedResourceResponse complete(Long userId, CompleteResourceRequest req) {
    // 1️⃣ Validate resource exists
    LearningResource resource = lrRepo.findById(req.resourceId())
        .orElseThrow(() -> new CustomException("Resource not found", HttpStatus.NOT_FOUND));

    // 2️⃣ Prevent duplicate completion
    ulrRepo.findByUserIdAndResourceId(userId, req.resourceId())
        .ifPresent(r -> {
          throw new CustomException("Already completed", HttpStatus.BAD_REQUEST);
        });

    // 3️⃣ Load user
    User user = userRepo.findById(userId)
        .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));

    // 4️⃣ Save bridge entity
    UserLearningResource ulr = new UserLearningResource();
    ulr.setUser(user);
    ulr.setResource(resource);
    UserLearningResource saved = ulrRepo.save(ulr);

    return new CompletedResourceResponse(
        resource.getId(),
        resource.getTitle(),
        saved.getCompletedAt());
  }

  @Transactional(readOnly = true)
  public List<CompletedResourceResponse> listCompleted(String userEmail) {
    User user = userRepo.findByEmail(userEmail)
        .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));
    return listCompleted(user.getId());
  }

  @Transactional(readOnly = true)
  public List<CompletedResourceResponse> listCompleted(Long userId) {
    return ulrRepo.findAllByUserId(userId).stream()
        .map(ulr -> new CompletedResourceResponse(
            ulr.getResource().getId(),
            ulr.getResource().getTitle(),
            ulr.getCompletedAt()))
        .collect(Collectors.toList());
  }
}
