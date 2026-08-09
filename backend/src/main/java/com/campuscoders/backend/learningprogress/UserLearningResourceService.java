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

  // Convenience overload allowing controller to pass user email directly from JWT authentication context.
  @Transactional
  public CompletedResourceResponse complete(String userEmail, CompleteResourceRequest req) {
    User user = userRepo.findByEmail(userEmail)
        .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));
    return complete(user.getId(), req);
  }

  @Transactional
  public CompletedResourceResponse complete(Long userId, CompleteResourceRequest req) {
    // 1️⃣ Validate target resource exists in the catalog before tracking progress.
    LearningResource resource = lrRepo.findById(req.resourceId())
        .orElseThrow(() -> new CustomException("Resource not found", HttpStatus.NOT_FOUND));

    // 2️⃣ A user should only complete a resource once. Early exit avoids unneeded user loading or DB writes.
    ulrRepo.findByUserIdAndResourceId(userId, req.resourceId())
        .ifPresent(r -> {
          throw new CustomException("Already completed", HttpStatus.BAD_REQUEST);
        });

    // 3️⃣ Verify user exists before persisting bridge record.
    User user = userRepo.findById(userId)
        .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));

    // 4️⃣ Persist join entity representing user's completion of this resource.
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

  // readOnly = true optimizes Hibernate session flush checks and improves read performance.
  @Transactional(readOnly = true)
  public List<CompletedResourceResponse> listCompleted(Long userId) {
    // Transform JPA entities to lightweight DTOs to hide internal entity details from frontend.
    return ulrRepo.findAllByUserId(userId).stream()
        .map(ulr -> new CompletedResourceResponse(
            ulr.getResource().getId(),
            ulr.getResource().getTitle(),
            ulr.getCompletedAt()))
        .collect(Collectors.toList());
  }
}
