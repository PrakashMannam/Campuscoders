package com.campuscoders.backend.admin;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.campuscoders.backend.admin.dto.AdminLearningPathOptionResponse;
import com.campuscoders.backend.admin.dto.AdminLearningResourceResponse;
import com.campuscoders.backend.admin.dto.AdminTopicOptionResponse;
import com.campuscoders.backend.learningpath.DifficultyLevel;
import com.campuscoders.backend.learningpath.LearningPathService;
import com.campuscoders.backend.learningpath.LearningResourceService;
import com.campuscoders.backend.learningpath.ResourceType;
import com.campuscoders.backend.learningpath.TopicService;
import com.campuscoders.backend.learningpath.dto.CreateLearningPathRequest;
import com.campuscoders.backend.learningpath.dto.CreateLearningResourceRequest;
import com.campuscoders.backend.learningpath.dto.CreateTopicRequest;
import com.campuscoders.backend.learningpath.dto.LearningPathResponse;
import com.campuscoders.backend.learningpath.dto.LearningResourceResponse;
import com.campuscoders.backend.learningpath.dto.TopicResponse;
import com.campuscoders.backend.learningpath.dto.UpdateLearningPathRequest;
import com.campuscoders.backend.learningpath.dto.UpdateLearningResourceRequest;
import com.campuscoders.backend.learningpath.dto.UpdateTopicRequest;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminLearningResourceController {

  private final AdminLearningResourceService adminLearningResourceService;
  private final LearningPathService learningPathService;
  private final LearningResourceService learningResourceService;
  private final TopicService topicService;

  public AdminLearningResourceController(
      AdminLearningResourceService adminLearningResourceService,
      LearningPathService learningPathService,
      LearningResourceService learningResourceService,
      TopicService topicService) {
    this.adminLearningResourceService = adminLearningResourceService;
    this.learningPathService = learningPathService;
    this.learningResourceService = learningResourceService;
    this.topicService = topicService;
  }

  // Admin table endpoint: supports filtering learning paths by active state.
  @GetMapping("/learning-paths")
  public List<LearningPathResponse> getLearningPathsForAdmin(
      @RequestParam(required = false) Boolean active) {
    return learningPathService.getLearningPathsForAdmin(active);
  }

  // Admin endpoint for creating a learning path from the admin panel.
  @PostMapping("/learning-paths")
  public LearningPathResponse createLearningPathForAdmin(
      @Valid @RequestBody CreateLearningPathRequest request) {
    return learningPathService.createLearningPath(request);
  }

  // Admin endpoint for editing learning path details.
  @PutMapping("/learning-paths/{learningPathId}")
  public LearningPathResponse updateLearningPathForAdmin(
      @PathVariable Long learningPathId,
      @Valid @RequestBody UpdateLearningPathRequest request) {
    return learningPathService.updateLearningPath(learningPathId, request);
  }

  // Admin endpoint for hiding a learning path without deleting its topics/resources.
  @PatchMapping("/learning-paths/{learningPathId}/deactivate")
  public LearningPathResponse deactivateLearningPathForAdmin(@PathVariable Long learningPathId) {
    return learningPathService.deactivateLearningPath(learningPathId);
  }

  // Admin endpoint for restoring a hidden learning path.
  @PatchMapping("/learning-paths/{learningPathId}/activate")
  public LearningPathResponse activateLearningPathForAdmin(@PathVariable Long learningPathId) {
    return learningPathService.activateLearningPath(learningPathId);
  }

  // Admin table endpoint: supports optional filters and includes inactive resources.
  @GetMapping("/resources")
  public List<AdminLearningResourceResponse> getResourcesForAdmin(
      @RequestParam(required = false) Long topicId,
      @RequestParam(required = false) Boolean active,
      @RequestParam(required = false) ResourceType type,
      @RequestParam(required = false) DifficultyLevel difficulty) {
    return adminLearningResourceService.getResourcesForAdmin(topicId, active, type, difficulty);
  }

  // Admin endpoint for adding a new resource from the admin panel.
  @PostMapping("/resources")
  public LearningResourceResponse createResourceForAdmin(
      @Valid @RequestBody CreateLearningResourceRequest request) {
    return learningResourceService.createLearningResource(request);
  }

  // Admin endpoint for editing a resource from the admin panel.
  @PutMapping("/resources/{resourceId}")
  public LearningResourceResponse updateResourceForAdmin(
      @PathVariable Long resourceId,
      @Valid @RequestBody UpdateLearningResourceRequest request) {
    return learningResourceService.updateLearningResource(resourceId, request);
  }

  // Admin endpoint for hiding a resource without deleting it permanently.
  @PatchMapping("/resources/{resourceId}/deactivate")
  public LearningResourceResponse deactivateResourceForAdmin(@PathVariable Long resourceId) {
    return learningResourceService.deactivateLearningResource(resourceId);
  }

  // Admin endpoint for restoring a hidden resource.
  @PatchMapping("/resources/{resourceId}/activate")
  public LearningResourceResponse activateResourceForAdmin(@PathVariable Long resourceId) {
    return learningResourceService.activateLearningResource(resourceId);
  }

  // Admin table endpoint: supports filtering topics by learning path and active state.
  @GetMapping("/topics")
  public List<TopicResponse> getTopicsForAdmin(
      @RequestParam(required = false) Long learningPathId,
      @RequestParam(required = false) Boolean active) {
    return topicService.getTopicsForAdmin(learningPathId, active);
  }

  // Admin endpoint for creating a topic from the admin panel.
  @PostMapping("/topics")
  public TopicResponse createTopicForAdmin(@Valid @RequestBody CreateTopicRequest request) {
    return topicService.createTopic(request);
  }

  // Admin endpoint for editing topic details or moving it to another learning path.
  @PutMapping("/topics/{topicId}")
  public TopicResponse updateTopicForAdmin(
      @PathVariable Long topicId,
      @Valid @RequestBody UpdateTopicRequest request) {
    return topicService.updateTopic(topicId, request);
  }

  // Admin endpoint for hiding a topic without deleting its database row.
  @PatchMapping("/topics/{topicId}/deactivate")
  public TopicResponse deactivateTopicForAdmin(@PathVariable Long topicId) {
    return topicService.deactivateTopic(topicId);
  }

  // Admin endpoint for restoring a hidden topic.
  @PatchMapping("/topics/{topicId}/activate")
  public TopicResponse activateTopicForAdmin(@PathVariable Long topicId) {
    return topicService.activateTopic(topicId);
  }

  // Dropdown endpoint used before creating or moving a resource.
  @GetMapping("/topics/options")
  public List<AdminTopicOptionResponse> getTopicOptions(
      @RequestParam(required = false) Long learningPathId) {
    return adminLearningResourceService.getTopicOptions(learningPathId);
  }

  // Dropdown endpoint useful for topic creation screens.
  @GetMapping("/learning-paths/options")
  public List<AdminLearningPathOptionResponse> getLearningPathOptions() {
    return adminLearningResourceService.getLearningPathOptions();
  }
}