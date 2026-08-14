package com.campuscoders.backend.learningpath;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.campuscoders.backend.common.dto.PageResponse;
import com.campuscoders.backend.learningpath.dto.CreateLearningResourceRequest;
import com.campuscoders.backend.learningpath.dto.LearningResourceResponse;
import com.campuscoders.backend.learningpath.dto.UpdateLearningResourceRequest;
import com.campuscoders.backend.learningpath.repository.LearningResourceRepository;
import com.campuscoders.backend.learningpath.repository.TopicRepository;

@Service
public class LearningResourceService {

  private final LearningResourceRepository learningResourceRepository;
  private final TopicRepository topicRepository;

  public LearningResourceService(
      LearningResourceRepository learningResourceRepository,
      TopicRepository topicRepository) {
    this.learningResourceRepository = learningResourceRepository;
    this.topicRepository = topicRepository;
  }

  @Transactional
  public LearningResourceResponse createLearningResource(CreateLearningResourceRequest request) {
    Topic topic = findTopicById(request.topicId());

    // Convert incoming request DTO into a LearningResource entity associated with parent Topic.
    LearningResource resource = new LearningResource();
    resource.setTopic(topic);
    resource.setTitle(request.title());
    resource.setDescription(request.description());
    resource.setType(request.type());
    resource.setDifficulty(request.difficulty());
    resource.setUrl(request.url());
    resource.setProvider(request.provider());
    resource.setThumbnailUrl(request.thumbnailUrl());
    resource.setEstimatedMinutes(request.estimatedMinutes());
    resource.setSortOrder(request.sortOrder());
    resource.setActive(true);

    LearningResource savedResource = learningResourceRepository.save(resource);

    return toResponse(savedResource);
  }

  @Transactional(readOnly = true)
  public PageResponse<LearningResourceResponse> getAllActiveResources(Pageable pageable) {
    Page<LearningResource> page = learningResourceRepository.findByActiveTrue(pageable);
    List<LearningResourceResponse> mapped = page.getContent().stream()
        .map(this::toResponse)
        .toList();
    return PageResponse.from(page, mapped);
  }

  @Transactional(readOnly = true)
  public LearningResourceResponse getActiveResourceById(Long resourceId) {
    LearningResource resource = learningResourceRepository.findByIdAndActiveTrue(resourceId)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "Resource not found"));

    return toResponse(resource);
  }

  // Topic lookup by slug: Fetches active resources ordered by custom sort_order for structured lesson flows.
  @Transactional(readOnly = true)
  public List<LearningResourceResponse> getActiveResourcesByTopicSlug(String topicSlug) {
    Topic topic = topicRepository.findBySlug(topicSlug)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "Topic not found"));

    return learningResourceRepository.findByTopicIdAndActiveTrueOrderBySortOrderAsc(topic.getId())
        .stream()
        .map(this::toResponse)
        .toList();
  }

  @Transactional
  public LearningResourceResponse updateLearningResource(
      Long resourceId,
      UpdateLearningResourceRequest request) {
    LearningResource resource = findResourceById(resourceId);
    Topic topic = findTopicById(request.topicId());

    // Admins can modify resource attributes or reassign the resource to a different topic.
    resource.setTopic(topic);
    resource.setTitle(request.title());
    resource.setDescription(request.description());
    resource.setType(request.type());
    resource.setDifficulty(request.difficulty());
    resource.setUrl(request.url());
    resource.setProvider(request.provider());
    resource.setThumbnailUrl(request.thumbnailUrl());
    resource.setEstimatedMinutes(request.estimatedMinutes());
    resource.setSortOrder(request.sortOrder());
    resource.setActive(request.active());

    LearningResource savedResource = learningResourceRepository.save(resource);

    return toResponse(savedResource);
  }

  @Transactional
  public LearningResourceResponse deactivateLearningResource(Long resourceId) {
    LearningResource resource = findResourceById(resourceId);
    resource.setActive(false);

    LearningResource savedResource = learningResourceRepository.save(resource);

    return toResponse(savedResource);
  }

  @Transactional
  public LearningResourceResponse activateLearningResource(Long resourceId) {
    LearningResource resource = findResourceById(resourceId);
    resource.setActive(true);

    LearningResource savedResource = learningResourceRepository.save(resource);

    return toResponse(savedResource);
  }

  private Topic findTopicById(Long topicId) {
    return topicRepository.findById(topicId)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "Topic not found"));
  }

  private LearningResource findResourceById(Long resourceId) {
    return learningResourceRepository.findById(resourceId)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "Resource not found"));
  }

  // DTO mapping helper isolates database entities from API response contracts.
  private LearningResourceResponse toResponse(LearningResource resource) {
    return new LearningResourceResponse(
        resource.getId(),
        resource.getTopic().getId(),
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
}