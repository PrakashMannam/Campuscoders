package com.campuscoders.backend.learningpath;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.campuscoders.backend.common.dto.PageResponse;
import com.campuscoders.backend.learningpath.dto.CreateLearningResourceRequest;
import com.campuscoders.backend.learningpath.dto.LearningResourceResponse;
import com.campuscoders.backend.learningpath.dto.UpdateLearningResourceRequest;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/resources")
public class LearningResourceController {

  private final LearningResourceService learningResourceService;

  public LearningResourceController(LearningResourceService learningResourceService) {
    this.learningResourceService = learningResourceService;
  }

  // Public endpoint for browsing all visible resources.
  @GetMapping
  public PageResponse<LearningResourceResponse> getAllActiveResources(
      @PageableDefault(page = 0, size = 10, sort = "title", direction = Sort.Direction.ASC) Pageable pageable) {
    return learningResourceService.getAllActiveResources(pageable);
  }

  // Public endpoint for opening one visible resource by database id.
  @GetMapping("/{resourceId}")
  public LearningResourceResponse getActiveResourceById(@PathVariable Long resourceId) {
    return learningResourceService.getActiveResourceById(resourceId);
  }

  // Admin-facing endpoint for creating a resource under an existing topic.
  @PreAuthorize("hasRole('ADMIN')")
  @PostMapping
  public LearningResourceResponse createLearningResource(
      @Valid @RequestBody CreateLearningResourceRequest request) {
    return learningResourceService.createLearningResource(request);
  }

  // Admin-facing endpoint for editing a resource or moving it to another topic.
  @PreAuthorize("hasRole('ADMIN')")
  @PutMapping("/{resourceId}")
  public LearningResourceResponse updateLearningResource(
      @PathVariable Long resourceId,
      @Valid @RequestBody UpdateLearningResourceRequest request) {
    return learningResourceService.updateLearningResource(resourceId, request);
  }

  // Admin-facing endpoint for hiding a resource without deleting its database
  // row.
  @PreAuthorize("hasRole('ADMIN')")
  @PatchMapping("/{resourceId}/deactivate")
  public LearningResourceResponse deactivateLearningResource(@PathVariable Long resourceId) {
    return learningResourceService.deactivateLearningResource(resourceId);
  }

  // Admin-facing endpoint for showing a previously hidden resource again.
  @PreAuthorize("hasRole('ADMIN')")
  @PatchMapping("/{resourceId}/activate")
  public LearningResourceResponse activateLearningResource(@PathVariable Long resourceId) {
    return learningResourceService.activateLearningResource(resourceId);
  }

  // Toggles the bookmark status of a resource for the authenticated user.
  @PostMapping("/{id}/bookmark")
  public com.campuscoders.backend.common.dto.BookmarkToggleResponse toggleBookmark(
      org.springframework.security.core.Authentication authentication,
      @PathVariable Long id) {
    return learningResourceService.toggleBookmark(authentication.getName(), id);
  }
}