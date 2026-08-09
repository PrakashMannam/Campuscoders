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
// Class-level authorization guard: Ensures all endpoints in this controller require ROLE_ADMIN authority.
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

  // Admin catalog query: Optional 'active' filter parameter allows admins to toggle between active, archived, or all paths.
  @GetMapping
  public List<LearningPathResponse> getLearningPathsForAdmin(
      @RequestParam(required = false) Boolean active) {
    return learningPathService.getLearningPathsForAdmin(active);
  }

  // Optimized lightweight endpoint returning only path IDs and titles to populate select dropdowns in admin forms.
  @GetMapping("/options")
  public List<AdminLearningPathOptionResponse> getLearningPathOptions() {
    return adminLearningResourceService.getLearningPathOptions();
  }

  // Validates incoming DTO and persists a new learning path catalog item.
  @PostMapping
  public LearningPathResponse createLearningPathForAdmin(
      @Valid @RequestBody CreateLearningPathRequest request) {
    return learningPathService.createLearningPath(request);
  }

  // Update existing learning path metadata (title, slug, active status).
  @PutMapping("/{learningPathId}")
  public LearningPathResponse updateLearningPathForAdmin(
      @PathVariable Long learningPathId,
      @Valid @RequestBody UpdateLearningPathRequest request) {
    return learningPathService.updateLearningPath(learningPathId, request);
  }

  // Soft-deactivate a learning path to hide it from students while preserving associated topics and resources.
  @PatchMapping("/{learningPathId}/deactivate")
  public LearningPathResponse deactivateLearningPathForAdmin(@PathVariable Long learningPathId) {
    return learningPathService.deactivateLearningPath(learningPathId);
  }

  // Re-enable a previously soft-deactivated learning path.
  @PatchMapping("/{learningPathId}/activate")
  public LearningPathResponse activateLearningPathForAdmin(@PathVariable Long learningPathId) {
    return learningPathService.activateLearningPath(learningPathId);
  }
}