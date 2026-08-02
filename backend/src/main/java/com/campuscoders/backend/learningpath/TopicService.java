package com.campuscoders.backend.learningpath;

import java.util.Comparator;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.campuscoders.backend.learningpath.dto.CreateTopicRequest;
import com.campuscoders.backend.learningpath.dto.TopicResponse;
import com.campuscoders.backend.learningpath.dto.UpdateTopicRequest;
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

    LearningPath learningPath = findLearningPathById(request.learningPathId());

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

  public List<TopicResponse> getTopicsForAdmin(Long learningPathId, Boolean active) {
    return topicRepository.findAll()
        .stream()
        .filter(topic -> learningPathId == null || topic.getLearningPath().getId().equals(learningPathId))
        .filter(topic -> active == null || topic.getActive().equals(active))
        .sorted(Comparator
            .comparing((Topic topic) -> topic.getLearningPath().getTitle(), String.CASE_INSENSITIVE_ORDER)
            .thenComparing(topic -> nullSafeSortOrder(topic.getSortOrder()))
            .thenComparing(Topic::getTitle, String.CASE_INSENSITIVE_ORDER))
        .map(this::toResponse)
        .toList();
  }

  public TopicResponse updateTopic(Long topicId, UpdateTopicRequest request) {
    Topic topic = findTopicById(topicId);
    LearningPath learningPath = findLearningPathById(request.learningPathId());

    if (!topic.getSlug().equals(request.slug()) && topicRepository.existsBySlug(request.slug())) {
      throw new ResponseStatusException(
          HttpStatus.CONFLICT,
          "Topic slug already exists");
    }

    // Admins can also move a topic to another learning path by changing learningPathId.
    topic.setLearningPath(learningPath);
    topic.setTitle(request.title());
    topic.setSlug(request.slug());
    topic.setDescription(request.description());
    topic.setEstimatedMinutes(request.estimatedMinutes());
    topic.setSortOrder(request.sortOrder());
    topic.setActive(request.active());

    Topic savedTopic = topicRepository.save(topic);

    return toResponse(savedTopic);
  }

  public TopicResponse deactivateTopic(Long topicId) {
    Topic topic = findTopicById(topicId);
    topic.setActive(false);

    Topic savedTopic = topicRepository.save(topic);

    return toResponse(savedTopic);
  }

  public TopicResponse activateTopic(Long topicId) {
    Topic topic = findTopicById(topicId);
    topic.setActive(true);

    Topic savedTopic = topicRepository.save(topic);

    return toResponse(savedTopic);
  }

  private LearningPath findLearningPathById(Long learningPathId) {
    return learningPathRepository.findById(learningPathId)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "Learning path not found"));
  }

  private Topic findTopicById(Long topicId) {
    return topicRepository.findById(topicId)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "Topic not found"));
  }

  private Integer nullSafeSortOrder(Integer sortOrder) {
    return sortOrder == null ? Integer.MAX_VALUE : sortOrder;
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