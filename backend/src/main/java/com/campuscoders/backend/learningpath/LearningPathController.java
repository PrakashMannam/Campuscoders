package com.campuscoders.backend.learningpath;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.campuscoders.backend.learningpath.dto.CreateLearningPathRequest;
import com.campuscoders.backend.learningpath.dto.LearningPathResponse;
import com.campuscoders.backend.learningpath.dto.TopicResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/learning-paths")
public class LearningPathController {

  private final LearningPathService learningPathService;
  private final TopicService topicService;

  public LearningPathController(
      LearningPathService learningPathService,
      TopicService topicService) {
    this.learningPathService = learningPathService;
    this.topicService = topicService;
  }

  // Admin-facing endpoint for creating a new learning path. Role checks come later.
  @PreAuthorize("hasRole('ADMIN')")
  @PostMapping
  public LearningPathResponse createLearningPath(
      @Valid @RequestBody CreateLearningPathRequest request) {
    return learningPathService.createLearningPath(request);
  }

  // Public/student endpoint used by the frontend Learning Hub page.
  @GetMapping
  public List<LearningPathResponse> getAllLearningPaths() {
    return learningPathService.getAllActiveLearningPaths();
  }

  // Fetches one path by its URL-friendly slug, for pages like /resources/java-full-stack.
  @GetMapping("/{slug}")
  public LearningPathResponse getLearningPathBySlug(@PathVariable String slug) {
    return learningPathService.getLearningPathBySlug(slug);
  }

  // Fetches topics belonging to one learning path, sorted by sortOrder.
  @GetMapping("/{slug}/topics")
  public List<TopicResponse> getTopicsByLearningPathSlug(@PathVariable String slug) {
    return topicService.getActiveTopicsByLearningPathSlug(slug);
  }
}