package com.campuscoders.backend.learningpath;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.campuscoders.backend.learningpath.dto.CreateLearningResourceRequest;
import com.campuscoders.backend.learningpath.dto.LearningResourceResponse;
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

  public LearningResourceResponse createLearningResource(CreateLearningResourceRequest request) {
    Topic topic = topicRepository.findById(request.topicId())
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "Topic not found"));

    // Convert the request DTO into a resource entity linked to its parent topic.
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

  // Keep API responses separate from database entities.
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