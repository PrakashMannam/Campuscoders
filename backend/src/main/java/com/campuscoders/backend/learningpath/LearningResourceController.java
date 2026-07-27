package com.campuscoders.backend.learningpath;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.campuscoders.backend.learningpath.dto.CreateLearningResourceRequest;
import com.campuscoders.backend.learningpath.dto.LearningResourceResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/resources")
public class LearningResourceController {

  private final LearningResourceService learningResourceService;

  public LearningResourceController(LearningResourceService learningResourceService) {
    this.learningResourceService = learningResourceService;
  }

  // Admin-facing endpoint for creating a resource under an existing topic.
  @PreAuthorize("hasRole('ADMIN')")
  @PostMapping
  public LearningResourceResponse createLearningResource(
      @Valid @RequestBody CreateLearningResourceRequest request) {
    return learningResourceService.createLearningResource(request);
  }
}