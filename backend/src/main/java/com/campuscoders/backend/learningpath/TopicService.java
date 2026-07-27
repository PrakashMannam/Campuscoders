package com.campuscoders.backend.learningpath;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.campuscoders.backend.learningpath.dto.CreateTopicRequest;
import com.campuscoders.backend.learningpath.dto.TopicResponse;
import com.campuscoders.backend.learningpath.repository.LearningPathRepository;
import com.campuscoders.backend.learningpath.repository.TopicRepository;

@Service
public class TopicService {

  private final TopicRepository topicRepository;
  private final LearningPathRepository learningPathRepository;

  public TopicService(
      TopicRepository topicRepository,
      LearningPathRepository learningPathRepository) {
    this.topicRepository = topicRepository;
    this.learningPathRepository = learningPathRepository;
  }

  public TopicResponse createTopic(CreateTopicRequest request) {
    // Topic slugs are used in URLs, so we reject duplicates before saving.
    if (topicRepository.existsBySlug(request.slug())) {
      throw new ResponseStatusException(
          HttpStatus.CONFLICT,
          "Topic slug already exists");
    }

    LearningPath learningPath = learningPathRepository.findById(request.learningPathId())
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "Learning path not found"));

    // Convert the request DTO into a Topic entity linked to its parent path.
    Topic topic = new Topic();
    topic.setLearningPath(learningPath);
    topic.setTitle(request.title());
    topic.setSlug(request.slug());
    topic.setDescription(request.description());
    topic.setEstimatedMinutes(request.estimatedMinutes());
    topic.setSortOrder(request.sortOrder());
    topic.setActive(true);

    Topic savedTopic = topicRepository.save(topic);

    return toResponse(savedTopic);
  }

  public List<TopicResponse> getActiveTopicsByLearningPathSlug(String learningPathSlug) {
    LearningPath learningPath = learningPathRepository.findBySlug(learningPathSlug)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "Learning path not found"));

    return topicRepository.findByLearningPathIdAndActiveTrueOrderBySortOrderAsc(learningPath.getId())
        .stream()
        .map(this::toResponse)
        .toList();
  }

  // Keep API responses separate from database entities.
  private TopicResponse toResponse(Topic topic) {
    return new TopicResponse(
        topic.getId(),
        topic.getLearningPath().getId(),
        topic.getTitle(),
        topic.getSlug(),
        topic.getDescription(),
        topic.getEstimatedMinutes(),
        topic.getSortOrder(),
        topic.getActive());
  }
}