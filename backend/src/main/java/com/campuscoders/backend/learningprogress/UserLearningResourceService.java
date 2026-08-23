package com.campuscoders.backend.learningprogress;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.campuscoders.backend.exception.CustomException;
import com.campuscoders.backend.learningpath.LearningPath;
import com.campuscoders.backend.learningpath.LearningResource;
import com.campuscoders.backend.learningpath.Topic;
import com.campuscoders.backend.learningpath.repository.LearningPathRepository;
import com.campuscoders.backend.learningpath.repository.LearningResourceRepository;
import com.campuscoders.backend.learningpath.repository.TopicRepository;
import com.campuscoders.backend.learningprogress.dto.CompleteResourceRequest;
import com.campuscoders.backend.learningprogress.dto.CompletedResourceResponse;
import com.campuscoders.backend.learningprogress.dto.InProgressLearningPathResponse;
import com.campuscoders.backend.learningprogress.dto.LearningPathProgressResponse;
import com.campuscoders.backend.learningprogress.dto.TopicProgressResponse;
import com.campuscoders.backend.learningprogress.repository.UserLearningResourceRepository;
import com.campuscoders.backend.user.User;
import com.campuscoders.backend.user.repository.UserRepository;

@Service
public class UserLearningResourceService {

  private final UserLearningResourceRepository ulrRepo;
  private final UserRepository userRepo;
  private final LearningResourceRepository lrRepo;
  private final LearningPathRepository learningPathRepository;
  private final TopicRepository topicRepository;

  public UserLearningResourceService(
      UserLearningResourceRepository ulrRepo,
      UserRepository userRepo,
      LearningResourceRepository lrRepo,
      LearningPathRepository learningPathRepository,
      TopicRepository topicRepository) {
    this.ulrRepo = ulrRepo;
    this.userRepo = userRepo;
    this.lrRepo = lrRepo;
    this.learningPathRepository = learningPathRepository;
    this.topicRepository = topicRepository;
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

  @Transactional
  public void uncomplete(String userEmail, Long resourceId) {
    User user = userRepo.findByEmail(userEmail)
        .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));
    UserLearningResource row = ulrRepo.findByUserIdAndResourceId(user.getId(), resourceId)
        .orElseThrow(() -> new CustomException("This resource is not marked complete", HttpStatus.NOT_FOUND));
    ulrRepo.delete(row);
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

  // Calculates completion percentage for a Learning Path (handles 0 total resources safely).
  @Transactional(readOnly = true)
  public LearningPathProgressResponse getLearningPathProgress(String userEmail, Long learningPathId) {
    User user = userRepo.findByEmail(userEmail)
        .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));

    LearningPath learningPath = learningPathRepository.findById(learningPathId)
        .orElseThrow(() -> new CustomException("Learning Path not found", HttpStatus.NOT_FOUND));

    long totalResources = lrRepo.countByTopicLearningPathIdAndActiveTrue(learningPathId);
    long completedResources = ulrRepo.countByUserIdAndResourceTopicLearningPathId(user.getId(), learningPathId);
    double percentage = calculatePercentage(completedResources, totalResources);

    return new LearningPathProgressResponse(
        learningPath.getId(),
        learningPath.getTitle(),
        totalResources,
        completedResources,
        percentage);
  }

  @Transactional(readOnly = true)
  public List<InProgressLearningPathResponse> getInProgressPaths(String userEmail) {
    User user = userRepo.findByEmail(userEmail)
        .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));

    return ulrRepo.findDistinctLearningPathIdsByUserId(user.getId()).stream()
        .map(pathId -> learningPathRepository.findById(pathId).orElse(null))
        .filter(path -> path != null && Boolean.TRUE.equals(path.getActive()))
        .map(path -> {
          long totalResources = lrRepo.countByTopicLearningPathIdAndActiveTrue(path.getId());
          long completedResources = ulrRepo.countByUserIdAndResourceTopicLearningPathId(user.getId(), path.getId());
          double percentage = calculatePercentage(completedResources, totalResources);
          return new InProgressLearningPathResponse(
              path.getId(),
              path.getTitle(),
              path.getSlug(),
              path.getCategory(),
              path.getDifficulty(),
              totalResources,
              completedResources,
              percentage);
        })
        .filter(row -> row.completedResources() > 0 && row.progressPercentage() < 100.0)
        .sorted((a, b) -> Double.compare(b.progressPercentage(), a.progressPercentage()))
        .collect(Collectors.toList());
  }

  // Calculates completion percentage for a Topic (handles 0 total resources safely).
  @Transactional(readOnly = true)
  public TopicProgressResponse getTopicProgress(String userEmail, Long topicId) {
    User user = userRepo.findByEmail(userEmail)
        .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));

    Topic topic = topicRepository.findById(topicId)
        .orElseThrow(() -> new CustomException("Topic not found", HttpStatus.NOT_FOUND));

    long totalResources = lrRepo.countByTopicIdAndActiveTrue(topicId);
    long completedResources = ulrRepo.countByUserIdAndResourceTopicId(user.getId(), topicId);
    double percentage = calculatePercentage(completedResources, totalResources);

    return new TopicProgressResponse(
        topic.getId(),
        topic.getTitle(),
        totalResources,
        completedResources,
        percentage);
  }

  // Safe percentage calculation rounded to 1 decimal place. Avoids division by zero.
  private double calculatePercentage(long completed, long total) {
    if (total == 0) {
      return 0.0;
    }
    double raw = (completed * 100.0) / total;
    return Math.round(raw * 10.0) / 10.0;
  }
}
