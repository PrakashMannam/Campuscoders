package com.campuscoders.backend.admin;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.campuscoders.backend.admin.dto.AdminTopicOptionResponse;
import com.campuscoders.backend.learningpath.TopicService;
import com.campuscoders.backend.learningpath.dto.CreateTopicRequest;
import com.campuscoders.backend.learningpath.dto.TopicResponse;
import com.campuscoders.backend.learningpath.dto.UpdateTopicRequest;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/topics")
@PreAuthorize("hasRole('ADMIN')")
public class AdminTopicController {

  private final AdminLearningResourceService adminLearningResourceService;
  private final TopicService topicService;

  public AdminTopicController(
      AdminLearningResourceService adminLearningResourceService,
      TopicService topicService) {
    this.adminLearningResourceService = adminLearningResourceService;
    this.topicService = topicService;
  }

  // Admin table endpoint: supports filtering topics by learning path and active state.
  @GetMapping
  public List<TopicResponse> getTopicsForAdmin(
      @RequestParam(required = false) Long learningPathId,
      @RequestParam(required = false) Boolean active) {
    return topicService.getTopicsForAdmin(learningPathId, active);
  }

  // Dropdown endpoint used before creating or moving a resource.
  @GetMapping("/options")
  public List<AdminTopicOptionResponse> getTopicOptions(
      @RequestParam(required = false) Long learningPathId) {
    return adminLearningResourceService.getTopicOptions(learningPathId);
  }

  // Admin endpoint for creating a topic from the admin panel.
  @PostMapping
  public TopicResponse createTopicForAdmin(@Valid @RequestBody CreateTopicRequest request) {
    return topicService.createTopic(request);
  }

  // Admin endpoint for editing topic details or moving it to another learning path.
  @PutMapping("/{topicId}")
  public TopicResponse updateTopicForAdmin(
      @PathVariable Long topicId,
      @Valid @RequestBody UpdateTopicRequest request) {
    return topicService.updateTopic(topicId, request);
  }

  // Admin endpoint for hiding a topic without deleting its database row.
  @PatchMapping("/{topicId}/deactivate")
  public TopicResponse deactivateTopicForAdmin(@PathVariable Long topicId) {
    return topicService.deactivateTopic(topicId);
  }

  // Admin endpoint for restoring a hidden topic.
  @PatchMapping("/{topicId}/activate")
  public TopicResponse activateTopicForAdmin(@PathVariable Long topicId) {
    return topicService.activateTopic(topicId);
  }

  // Hard-delete topic (also removes its resources, bookmarks, and completion rows).
  @DeleteMapping("/{topicId}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void deleteTopicForAdmin(@PathVariable Long topicId) {
    topicService.deleteTopic(topicId);
  }
}
