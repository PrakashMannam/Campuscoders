package com.campuscoders.backend.learningpath;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.campuscoders.backend.learningpath.dto.CreateLearningPathRequest;
import com.campuscoders.backend.learningpath.dto.LearningPathResponse;
import com.campuscoders.backend.learningpath.repository.LearningPathRepository;

@Service
public class LearningPathService {

  private final LearningPathRepository learningPathRepository;

  public LearningPathService(LearningPathRepository learningPathRepository) {
    this.learningPathRepository = learningPathRepository;
  }

  public LearningPathResponse createLearningPath(CreateLearningPathRequest request) {
    if (learningPathRepository.existsBySlug(request.slug())) {
      throw new ResponseStatusException(
          HttpStatus.CONFLICT,
          "Learning path slug already exists");
    }

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

  public LearningPathResponse getLearningPathBySlug(String slug) {
    LearningPath learningPath = learningPathRepository.findBySlug(slug)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "Learning path not found"));

    return toResponse(learningPath);
  }

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