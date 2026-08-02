package com.campuscoders.backend.learningpath;

import java.util.Comparator;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.campuscoders.backend.learningpath.dto.CreateLearningPathRequest;
import com.campuscoders.backend.learningpath.dto.LearningPathDetailsResponse;
import com.campuscoders.backend.learningpath.dto.LearningPathDetailsResponse.ResourceDetails;
import com.campuscoders.backend.learningpath.dto.LearningPathDetailsResponse.TopicDetails;
import com.campuscoders.backend.learningpath.dto.LearningPathResponse;
import com.campuscoders.backend.learningpath.dto.UpdateLearningPathRequest;
import com.campuscoders.backend.learningpath.repository.LearningPathRepository;
import com.campuscoders.backend.learningpath.repository.LearningResourceRepository;
import com.campuscoders.backend.learningpath.repository.TopicRepository;

@Service
public class LearningPathService {

  private final LearningPathRepository learningPathRepository;
  private final TopicRepository topicRepository;
  private final LearningResourceRepository learningResourceRepository;

  public LearningPathService(
      LearningPathRepository learningPathRepository,
      TopicRepository topicRepository,
      LearningResourceRepository learningResourceRepository) {
    this.learningPathRepository = learningPathRepository;
    this.topicRepository = topicRepository;
    this.learningResourceRepository = learningResourceRepository;
  }

  public LearningPathResponse createLearningPath(CreateLearningPathRequest request) {
    // Slugs are used in URLs, so each learning path must have a unique slug.
    if (learningPathRepository.existsBySlug(request.slug())) {
      throw new ResponseStatusException(
          HttpStatus.CONFLICT,
          "Learning path slug already exists");
    }

    // Convert incoming API data into the entity that JPA can store in MySQL.
    LearningPath learningPath = new LearningPath();
    learningPath.setTitle(request.title());
    learningPath.setSlug(request.slug());
    learningPath.setDescription(request.description());
    learningPath.setShortDescription(request.shortDescription());
    learningPath.setIconName(request.iconName());
    learningPath.setCategory(request.category());
    learningPath.setDifficulty(request.difficulty());
    learningPath.setEstimatedHours(request.estimatedHours());
    learningPath.setActive(true);

    LearningPath savedLearningPath = learningPathRepository.save(learningPath);

    return toResponse(savedLearningPath);
  }

  public List<LearningPathResponse> getAllActiveLearningPaths() {
    return learningPathRepository.findByActiveTrueOrderByTitleAsc()
        .stream()
        .map(this::toResponse)
        .toList();
  }

  public List<LearningPathResponse> getLearningPathsForAdmin(Boolean active) {
    return learningPathRepository.findAll()
        .stream()
        .filter(learningPath -> active == null || learningPath.getActive().equals(active))
        .sorted(Comparator.comparing(LearningPath::getTitle, String.CASE_INSENSITIVE_ORDER))
        .map(this::toResponse)
        .toList();
  }

  public LearningPathResponse getLearningPathBySlug(String slug) {
    LearningPath learningPath = findLearningPathBySlug(slug);

    return toResponse(learningPath);
  }

  public LearningPathResponse updateLearningPath(
      Long learningPathId,
      UpdateLearningPathRequest request) {
    LearningPath learningPath = findLearningPathById(learningPathId);

    if (!learningPath.getSlug().equals(request.slug()) && learningPathRepository.existsBySlug(request.slug())) {
      throw new ResponseStatusException(
          HttpStatus.CONFLICT,
          "Learning path slug already exists");
    }

    learningPath.setTitle(request.title());
    learningPath.setSlug(request.slug());
    learningPath.setDescription(request.description());
    learningPath.setShortDescription(request.shortDescription());
    learningPath.setIconName(request.iconName());
    learningPath.setCategory(request.category());
    learningPath.setDifficulty(request.difficulty());
    learningPath.setEstimatedHours(request.estimatedHours());
    learningPath.setActive(request.active());

    LearningPath savedLearningPath = learningPathRepository.save(learningPath);

    return toResponse(savedLearningPath);
  }

  public LearningPathResponse deactivateLearningPath(Long learningPathId) {
    LearningPath learningPath = findLearningPathById(learningPathId);
    learningPath.setActive(false);

    LearningPath savedLearningPath = learningPathRepository.save(learningPath);

    return toResponse(savedLearningPath);
  }

  public LearningPathResponse activateLearningPath(Long learningPathId) {
    LearningPath learningPath = findLearningPathById(learningPathId);
    learningPath.setActive(true);

    LearningPath savedLearningPath = learningPathRepository.save(learningPath);

    return toResponse(savedLearningPath);
  }

  public LearningPathDetailsResponse getLearningPathDetailsBySlug(String slug) {
    LearningPath learningPath = findLearningPathBySlug(slug);

    // Build the page-friendly tree: learning path -> topics -> resources.
    List<TopicDetails> topics = topicRepository
        .findByLearningPathIdAndActiveTrueOrderBySortOrderAsc(learningPath.getId())
        .stream()
        .map(this::toTopicDetails)
        .toList();

    return new LearningPathDetailsResponse(
        learningPath.getId(),
        learningPath.getTitle(),
        learningPath.getSlug(),
        learningPath.getDescription(),
        learningPath.getShortDescription(),
        learningPath.getIconName(),
        learningPath.getCategory(),
        learningPath.getDifficulty(),
        learningPath.getEstimatedHours(),
        learningPath.getActive(),
        topics);
  }

  private LearningPath findLearningPathBySlug(String slug) {
    return learningPathRepository.findBySlug(slug)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "Learning path not found"));
  }

  private LearningPath findLearningPathById(Long learningPathId) {
    return learningPathRepository.findById(learningPathId)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "Learning path not found"));
  }

  private TopicDetails toTopicDetails(Topic topic) {
    List<ResourceDetails> resources = learningResourceRepository
        .findByTopicIdAndActiveTrueOrderBySortOrderAsc(topic.getId())
        .stream()
        .map(this::toResourceDetails)
        .toList();

    return new TopicDetails(
        topic.getId(),
        topic.getTitle(),
        topic.getSlug(),
        topic.getDescription(),
        topic.getEstimatedMinutes(),
        topic.getSortOrder(),
        topic.getActive(),
        resources);
  }

  private ResourceDetails toResourceDetails(LearningResource resource) {
    return new ResourceDetails(
        resource.getId(),
        resource.getTitle(),
        resource.getDescription(),
        resource.getType(),
        resource.getDifficulty(),
        resource.getUrl(),
        resource.getProvider(),
        resource.getThumbnailUrl(),
        resource.getEstimatedMinutes(),
        resource.getSortOrder(),
        resource.getActive());
  }

  // Keep API responses separate from database entities.
  private LearningPathResponse toResponse(LearningPath learningPath) {
    return new LearningPathResponse(
        learningPath.getId(),
        learningPath.getTitle(),
        learningPath.getSlug(),
        learningPath.getDescription(),
        learningPath.getShortDescription(),
        learningPath.getIconName(),
        learningPath.getCategory(),
        learningPath.getDifficulty(),
        learningPath.getEstimatedHours(),
        learningPath.getActive());
  }
}