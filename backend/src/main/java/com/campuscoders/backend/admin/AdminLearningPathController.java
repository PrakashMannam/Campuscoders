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
import com.campuscoders.backend.learningpath.LearningPathService;
import com.campuscoders.backend.learningpath.dto.CreateLearningPathRequest;
import com.campuscoders.backend.learningpath.dto.LearningPathResponse;
import com.campuscoders.backend.learningpath.dto.UpdateLearningPathRequest;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/learning-paths")
@PreAuthorize("hasRole('ADMIN')")
public class AdminLearningPathController {

  private final AdminLearningResourceService adminLearningResourceService;
  private final LearningPathService learningPathService;

  public AdminLearningPathController(
      AdminLearningResourceService adminLearningResourceService,
      LearningPathService learningPathService) {
    this.adminLearningResourceService = adminLearningResourceService;
    this.learningPathService = learningPathService;
  }

  // Admin table endpoint: supports filtering learning paths by active state.
  @GetMapping
  public List<LearningPathResponse> getLearningPathsForAdmin(
      @RequestParam(required = false) Boolean active) {
    return learningPathService.getLearningPathsForAdmin(active);
  }

  // Dropdown endpoint useful for topic creation screens.
  @GetMapping("/options")
  public List<AdminLearningPathOptionResponse> getLearningPathOptions() {
    return adminLearningResourceService.getLearningPathOptions();
  }

  // Admin endpoint for creating a learning path from the admin panel.
  @PostMapping
  public LearningPathResponse createLearningPathForAdmin(
      @Valid @RequestBody CreateLearningPathRequest request) {
    return learningPathService.createLearningPath(request);
  }

  // Admin endpoint for editing learning path details.
  @PutMapping("/{learningPathId}")
  public LearningPathResponse updateLearningPathForAdmin(
      @PathVariable Long learningPathId,
      @Valid @RequestBody UpdateLearningPathRequest request) {
    return learningPathService.updateLearningPath(learningPathId, request);
  }

  // Admin endpoint for hiding a learning path without deleting its topics/resources.
  @PatchMapping("/{learningPathId}/deactivate")
  public LearningPathResponse deactivateLearningPathForAdmin(@PathVariable Long learningPathId) {
    return learningPathService.deactivateLearningPath(learningPathId);
  }

  // Admin endpoint for restoring a hidden learning path.
  @PatchMapping("/{learningPathId}/activate")
  public LearningPathResponse activateLearningPathForAdmin(@PathVariable Long learningPathId) {
    return learningPathService.activateLearningPath(learningPathId);
  }
}