package com.campuscoders.backend.learningprogress;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.campuscoders.backend.learningpath.LearningResource;
import com.campuscoders.backend.learningpath.repository.LearningPathRepository;
import com.campuscoders.backend.learningpath.repository.LearningResourceRepository;
import com.campuscoders.backend.learningpath.repository.TopicRepository;
import com.campuscoders.backend.learningprogress.dto.CompleteResourceRequest;
import com.campuscoders.backend.learningprogress.dto.CompletedResourceResponse;
import com.campuscoders.backend.learningprogress.repository.UserLearningResourceRepository;
import com.campuscoders.backend.user.User;
import com.campuscoders.backend.user.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class UserLearningResourceServiceTest {

  @Mock
  private UserLearningResourceRepository ulrRepo;

  @Mock
  private UserRepository userRepo;

  @Mock
  private LearningResourceRepository lrRepo;

  @Mock
  private LearningPathRepository learningPathRepository;

  @Mock
  private TopicRepository topicRepository;

  @InjectMocks
  private UserLearningResourceService service;

  @Test
  void complete_firstTime_shouldSaveCompletion() {
    User user = new User();
    user.setId(1L);
    user.setEmail("student@campus.com");
    user.setTotalXp(10);

    LearningResource resource = new LearningResource();
    resource.setId(100L);
    resource.setTitle("Java OOP Video");

    CompleteResourceRequest req = new CompleteResourceRequest(100L);

    when(userRepo.findByEmail("student@campus.com")).thenReturn(Optional.of(user));
    when(userRepo.findById(1L)).thenReturn(Optional.of(user));
    when(lrRepo.findById(100L)).thenReturn(Optional.of(resource));
    when(ulrRepo.findByUserIdAndResourceId(1L, 100L)).thenReturn(Optional.empty());

    UserLearningResource savedUlr = new UserLearningResource();
    savedUlr.setId(500L);
    savedUlr.setUser(user);
    savedUlr.setResource(resource);

    when(ulrRepo.save(any(UserLearningResource.class))).thenReturn(savedUlr);

    CompletedResourceResponse response = service.complete("student@campus.com", req);

    assertNotNull(response);
    assertEquals(100L, response.resourceId());
    assertEquals("Java OOP Video", response.resourceTitle());
    assertEquals(10, user.getTotalXp());
    verify(ulrRepo).save(any(UserLearningResource.class));
  }
}
