package com.campuscoders.backend.learningpath;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.campuscoders.backend.learningpath.dto.CreateLearningPathRequest;
import com.campuscoders.backend.learningpath.dto.LearningPathResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/learning-paths")
public class LearningPathController {

  private final LearningPathService learningPathService;

  public LearningPathController(LearningPathService learningPathService) {
    this.learningPathService = learningPathService;
  }

  @PostMapping
  public LearningPathResponse createLearningPath(
      @Valid @RequestBody CreateLearningPathRequest request) {
    return learningPathService.createLearningPath(request);
  }

  @GetMapping
  public List<LearningPathResponse> getAllLearningPaths() {
    return learningPathService.getAllActiveLearningPaths();
  }

  @GetMapping("/{slug}")
  public LearningPathResponse getLearningPathBySlug(@PathVariable String slug) {
    return learningPathService.getLearningPathBySlug(slug);
  }
}