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

import com.campuscoders.backend.admin.dto.AdminLearningResourceResponse;
import com.campuscoders.backend.learningpath.DifficultyLevel;
import com.campuscoders.backend.learningpath.LearningResourceService;
import com.campuscoders.backend.learningpath.ResourceType;
import com.campuscoders.backend.learningpath.dto.CreateLearningResourceRequest;
import com.campuscoders.backend.learningpath.dto.LearningResourceResponse;
import com.campuscoders.backend.learningpath.dto.UpdateLearningResourceRequest;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/resources")
@PreAuthorize("hasRole('ADMIN')")
public class AdminLearningResourceController {

  private final AdminLearningResourceService adminLearningResourceService;
  private final LearningResourceService learningResourceService;

  public AdminLearningResourceController(
      AdminLearningResourceService adminLearningResourceService,
      LearningResourceService learningResourceService) {
    this.adminLearningResourceService = adminLearningResourceService;
    this.learningResourceService = learningResourceService;
  }

  // Admin table endpoint: supports optional filters and includes inactive resources.
  @GetMapping
  public List<AdminLearningResourceResponse> getResourcesForAdmin(
      @RequestParam(required = false) Long topicId,
      @RequestParam(required = false) Boolean active,
      @RequestParam(required = false) ResourceType type,
      @RequestParam(required = false) DifficultyLevel difficulty) {
    return adminLearningResourceService.getResourcesForAdmin(topicId, active, type, difficulty);
  }

  // Admin endpoint for adding a new resource from the admin panel.
  @PostMapping
  public LearningResourceResponse createResourceForAdmin(
      @Valid @RequestBody CreateLearningResourceRequest request) {
    return learningResourceService.createLearningResource(request);
  }

  // Admin endpoint for editing a resource from the admin panel.
  @PutMapping("/{resourceId}")
  public LearningResourceResponse updateResourceForAdmin(
      @PathVariable Long resourceId,
      @Valid @RequestBody UpdateLearningResourceRequest request) {
    return learningResourceService.updateLearningResource(resourceId, request);
  }

  // Admin endpoint for hiding a resource without deleting it permanently.
  @PatchMapping("/{resourceId}/deactivate")
  public LearningResourceResponse deactivateResourceForAdmin(@PathVariable Long resourceId) {
    return learningResourceService.deactivateLearningResource(resourceId);
  }

  // Admin endpoint for restoring a hidden resource.
  @PatchMapping("/{resourceId}/activate")
  public LearningResourceResponse activateResourceForAdmin(@PathVariable Long resourceId) {
    return learningResourceService.activateLearningResource(resourceId);
  }
}