package com.campuscoders.backend.learningpath;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.campuscoders.backend.learningpath.dto.CreateTopicRequest;
import com.campuscoders.backend.learningpath.dto.LearningResourceResponse;
import com.campuscoders.backend.learningpath.dto.TopicResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/topics")
public class TopicController {

  private final TopicService topicService;
  private final LearningResourceService learningResourceService;

  public TopicController(
      TopicService topicService,
      LearningResourceService learningResourceService) {
    this.topicService = topicService;
    this.learningResourceService = learningResourceService;
  }

  // Admin-facing endpoint for creating a topic under an existing learning path.
  @PreAuthorize("hasRole('ADMIN')")
  @PostMapping
  public TopicResponse createTopic(@Valid @RequestBody CreateTopicRequest request) {
    return topicService.createTopic(request);
  }

  // Fetches resources belonging to one topic, sorted by sortOrder.
  @GetMapping("/{slug}/resources")
  public List<LearningResourceResponse> getResourcesByTopicSlug(@PathVariable String slug) {
    return learningResourceService.getActiveResourcesByTopicSlug(slug);
  }
}