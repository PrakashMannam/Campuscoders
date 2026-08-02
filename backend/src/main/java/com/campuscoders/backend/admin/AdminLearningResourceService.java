package com.campuscoders.backend.admin;

import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;

import com.campuscoders.backend.admin.dto.AdminLearningPathOptionResponse;
import com.campuscoders.backend.admin.dto.AdminLearningResourceResponse;
import com.campuscoders.backend.admin.dto.AdminTopicOptionResponse;
import com.campuscoders.backend.learningpath.DifficultyLevel;
import com.campuscoders.backend.learningpath.LearningPath;
import com.campuscoders.backend.learningpath.LearningResource;
import com.campuscoders.backend.learningpath.ResourceType;
import com.campuscoders.backend.learningpath.Topic;
import com.campuscoders.backend.learningpath.repository.LearningPathRepository;
import com.campuscoders.backend.learningpath.repository.LearningResourceRepository;
import com.campuscoders.backend.learningpath.repository.TopicRepository;

@Service
public class AdminLearningResourceService {

  private final LearningPathRepository learningPathRepository;
  private final TopicRepository topicRepository;
  private final LearningResourceRepository learningResourceRepository;

  public AdminLearningResourceService(
      LearningPathRepository learningPathRepository,
      TopicRepository topicRepository,
      LearningResourceRepository learningResourceRepository) {
    this.learningPathRepository = learningPathRepository;
    this.topicRepository = topicRepository;
    this.learningResourceRepository = learningResourceRepository;
  }

  public List<AdminLearningPathOptionResponse> getLearningPathOptions() {
    return learningPathRepository.findAll()
        .stream()
        .sorted(Comparator.comparing(LearningPath::getTitle, String.CASE_INSENSITIVE_ORDER))
        .map(this::toLearningPathOption)
        .toList();
  }

  public List<AdminTopicOptionResponse> getTopicOptions(Long learningPathId) {
    return topicRepository.findAll()
        .stream()
        .filter(topic -> learningPathId == null || topic.getLearningPath().getId().equals(learningPathId))
        .sorted(Comparator
            .comparing((Topic topic) -> topic.getLearningPath().getTitle(), String.CASE_INSENSITIVE_ORDER)
            .thenComparing(topic -> nullSafeSortOrder(topic.getSortOrder()))
            .thenComparing(Topic::getTitle, String.CASE_INSENSITIVE_ORDER))
        .map(this::toTopicOption)
        .toList();
  }

  public List<AdminLearningResourceResponse> getResourcesForAdmin(
      Long topicId,
      Boolean active,
      ResourceType type,
      DifficultyLevel difficulty) {
    return learningResourceRepository.findAll()
        .stream()
        .filter(resource -> topicId == null || resource.getTopic().getId().equals(topicId))
        .filter(resource -> active == null || resource.getActive().equals(active))
        .filter(resource -> type == null || resource.getType() == type)
        .filter(resource -> difficulty == null || resource.getDifficulty() == difficulty)
        .sorted(Comparator
            .comparing((LearningResource resource) -> resource.getTopic().getLearningPath().getTitle(),
                String.CASE_INSENSITIVE_ORDER)
            .thenComparing(resource -> nullSafeSortOrder(resource.getTopic().getSortOrder()))
            .thenComparing(resource -> nullSafeSortOrder(resource.getSortOrder()))
            .thenComparing(LearningResource::getTitle, String.CASE_INSENSITIVE_ORDER))
        .map(this::toAdminResourceResponse)
        .toList();
  }

  private AdminLearningPathOptionResponse toLearningPathOption(LearningPath learningPath) {
    return new AdminLearningPathOptionResponse(
        learningPath.getId(),
        learningPath.getTitle(),
        learningPath.getSlug(),
        learningPath.getActive());
  }

  private AdminTopicOptionResponse toTopicOption(Topic topic) {
    LearningPath learningPath = topic.getLearningPath();

    return new AdminTopicOptionResponse(
        topic.getId(),
        learningPath.getId(),
        learningPath.getTitle(),
        topic.getTitle(),
        topic.getSlug(),
        topic.getSortOrder(),
        topic.getActive());
  }

  private AdminLearningResourceResponse toAdminResourceResponse(LearningResource resource) {
    Topic topic = resource.getTopic();
    LearningPath learningPath = topic.getLearningPath();

    return new AdminLearningResourceResponse(
        resource.getId(),
        topic.getId(),
        topic.getTitle(),
        learningPath.getId(),
        learningPath.getTitle(),
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

  private Integer nullSafeSortOrder(Integer sortOrder) {
    return sortOrder == null ? Integer.MAX_VALUE : sortOrder;
  }
}