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
import org.springframework.web.bind.annotation.RestController;

import com.campuscoders.backend.discussion.DiscussionService;
import com.campuscoders.backend.discussion.dto.CreateDiscussionCategoryRequest;
import com.campuscoders.backend.discussion.dto.DiscussionCategoryResponse;
import com.campuscoders.backend.discussion.dto.UpdateDiscussionCategoryRequest;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/discussion-categories")
@PreAuthorize("hasRole('ADMIN')")
public class AdminDiscussionCategoryController {

  private final DiscussionService discussionService;

  public AdminDiscussionCategoryController(DiscussionService discussionService) {
    this.discussionService = discussionService;
  }

  // Lists all categories including inactive ones for administrative management.
  @GetMapping
  public List<DiscussionCategoryResponse> getAllCategoriesForAdmin() {
    return discussionService.getAllCategoriesForAdmin();
  }

  // Creates a new discussion category.
  @PostMapping
  public DiscussionCategoryResponse createCategory(@Valid @RequestBody CreateDiscussionCategoryRequest request) {
    return discussionService.createCategory(request);
  }

  // Updates an existing category's attributes (name, slug, description, color, iconName, sortOrder).
  @PutMapping("/{categoryId}")
  public DiscussionCategoryResponse updateCategory(
      @PathVariable Long categoryId,
      @Valid @RequestBody UpdateDiscussionCategoryRequest request) {
    return discussionService.updateCategory(categoryId, request);
  }

  // Enables a soft-deactivated discussion category.
  @PatchMapping("/{categoryId}/activate")
  public DiscussionCategoryResponse activateCategory(@PathVariable Long categoryId) {
    return discussionService.activateCategory(categoryId);
  }

  // Soft-deactivates a discussion category (active = false).
  @PatchMapping("/{categoryId}/deactivate")
  public DiscussionCategoryResponse deactivateCategory(@PathVariable Long categoryId) {
    return discussionService.deactivateCategory(categoryId);
  }
}
