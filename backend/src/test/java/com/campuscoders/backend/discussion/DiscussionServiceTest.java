package com.campuscoders.backend.discussion;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.campuscoders.backend.discussion.dto.CreateDiscussionPostRequest;
import com.campuscoders.backend.discussion.dto.DiscussionPostResponse;
import com.campuscoders.backend.discussion.repository.DiscussionCategoryRepository;
import com.campuscoders.backend.discussion.repository.DiscussionPostRepository;
import com.campuscoders.backend.discussion.repository.DiscussionReplyRepository;
import com.campuscoders.backend.discussion.repository.DiscussionVoteRepository;
import com.campuscoders.backend.exception.CustomException;
import com.campuscoders.backend.user.User;
import com.campuscoders.backend.user.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class DiscussionServiceTest {

  @Mock
  private DiscussionCategoryRepository categoryRepository;

  @Mock
  private DiscussionPostRepository postRepository;

  @Mock
  private DiscussionReplyRepository replyRepository;

  @Mock
  private DiscussionVoteRepository voteRepository;

  @Mock
  private UserRepository userRepository;

  @InjectMocks
  private DiscussionService discussionService;

  @Test
  void createPost_activeCategory_shouldSaveAndReturnResponse() {
    User author = new User();
    author.setId(1L);
    author.setEmail("student@campus.com");

    DiscussionCategory category = new DiscussionCategory();
    category.setId(10L);
    category.setActive(true);
    category.setName("Java");

    CreateDiscussionPostRequest req = new CreateDiscussionPostRequest(10L, "Java Title", "Java Content", "java,spring-boot");

    DiscussionPost savedPost = new DiscussionPost();
    savedPost.setId(100L);
    savedPost.setAuthor(author);
    savedPost.setCategory(category);
    savedPost.setTitle("Java Title");
    savedPost.setContent("Java Content");
    savedPost.setActive(true);

    when(userRepository.findByEmail("student@campus.com")).thenReturn(Optional.of(author));
    when(categoryRepository.findById(10L)).thenReturn(Optional.of(category));
    when(postRepository.save(any(DiscussionPost.class))).thenReturn(savedPost);
    when(replyRepository.countByPostIdAndActiveTrue(100L)).thenReturn(0L);
    when(voteRepository.findByUserIdAndPostId(1L, 100L)).thenReturn(Optional.empty());

    DiscussionPostResponse res = discussionService.createPost("student@campus.com", req);

    assertNotNull(res);
    assertEquals("Java Title", res.title());
  }

  @Test
  void createPost_inactiveCategory_shouldThrowCustomException() {
    User author = new User();
    author.setId(1L);

    DiscussionCategory category = new DiscussionCategory();
    category.setId(10L);
    category.setActive(false);

    CreateDiscussionPostRequest req = new CreateDiscussionPostRequest(10L, "Title", "Content", "tag");

    when(userRepository.findByEmail("student@campus.com")).thenReturn(Optional.of(author));
    when(categoryRepository.findById(10L)).thenReturn(Optional.of(category));

    assertThrows(CustomException.class, () -> discussionService.createPost("student@campus.com", req));
  }
}
