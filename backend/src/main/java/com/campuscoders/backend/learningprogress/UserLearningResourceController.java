package com.campuscoders.backend.learningprogress;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.campuscoders.backend.learningprogress.dto.CompleteResourceRequest;
import com.campuscoders.backend.learningprogress.dto.CompletedResourceResponse;
import com.campuscoders.backend.learningprogress.dto.LearningPathProgressResponse;
import com.campuscoders.backend.learningprogress.dto.TopicProgressResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/learning-progress")
public class UserLearningResourceController {

  private final UserLearningResourceService userLearningResourceService;

  public UserLearningResourceController(UserLearningResourceService userLearningResourceService) {
    this.userLearningResourceService = userLearningResourceService;
  }

  // Uses Spring Security's Authentication context to identify current user securely via JWT token.
  @GetMapping
  public List<CompletedResourceResponse> listCompleted(Authentication authentication) {
    return userLearningResourceService.listCompleted(authentication.getName());
  }

  // Calculates completion metrics and percentage for a given Learning Path.
  @GetMapping("/paths/{learningPathId}")
  public LearningPathProgressResponse getLearningPathProgress(
      Authentication authentication,
      @PathVariable Long learningPathId) {
    return userLearningResourceService.getLearningPathProgress(authentication.getName(), learningPathId);
  }

  // Calculates completion metrics and percentage for a single Topic.
  @GetMapping("/topics/{topicId}")
  public TopicProgressResponse getTopicProgress(
      Authentication authentication,
      @PathVariable Long topicId) {
    return userLearningResourceService.getTopicProgress(authentication.getName(), topicId);
  }

  // @Valid triggers bean validation rules on CompleteResourceRequest prior to service execution.
  @PostMapping("/complete")
  public CompletedResourceResponse complete(
      Authentication authentication,
      @Valid @RequestBody CompleteResourceRequest request) {
    return userLearningResourceService.complete(authentication.getName(), request);
  }
}
