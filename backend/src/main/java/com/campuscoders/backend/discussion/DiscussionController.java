package com.campuscoders.backend.discussion;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.campuscoders.backend.discussion.dto.CreateDiscussionPostRequest;
import com.campuscoders.backend.discussion.dto.CreateDiscussionReplyRequest;
import com.campuscoders.backend.discussion.dto.DiscussionPostDetailsResponse;
import com.campuscoders.backend.discussion.dto.DiscussionPostResponse;
import com.campuscoders.backend.discussion.dto.DiscussionReplyResponse;
import com.campuscoders.backend.discussion.dto.UpdateDiscussionPostRequest;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/discussions")
public class DiscussionController {

  private final DiscussionService discussionService;

  public DiscussionController(DiscussionService discussionService) {
    this.discussionService = discussionService;
  }

  // Returns active discussion posts list; supports optional filters by category, featured status, and search query.
  @GetMapping
  public List<DiscussionPostResponse> getDiscussions(
      @RequestParam(required = false) DiscussionCategory category,
      @RequestParam(required = false) Boolean featured,
      @RequestParam(required = false) String search) {
    return discussionService.getDiscussions(category, featured, search);
  }

  // Returns single thread details including content and active replies.
  @GetMapping("/{postId}")
  public DiscussionPostDetailsResponse getPostDetails(@PathVariable Long postId) {
    return discussionService.getPostDetails(postId);
  }

  // Authenticated user creates a new discussion post.
  @PostMapping
  public DiscussionPostResponse createPost(
      Authentication authentication,
      @Valid @RequestBody CreateDiscussionPostRequest request) {
    return discussionService.createPost(authentication.getName(), request);
  }

  // Post author or Admin updates thread title, category, content, or tags.
  @PutMapping("/{postId}")
  public DiscussionPostResponse updatePost(
      Authentication authentication,
      @PathVariable Long postId,
      @Valid @RequestBody UpdateDiscussionPostRequest request) {
    return discussionService.updatePost(authentication.getName(), postId, request);
  }

  // Authenticated user posts a reply. Blocked if the thread is closed.
  @PostMapping("/{postId}/replies")
  public DiscussionReplyResponse addReply(
      Authentication authentication,
      @PathVariable Long postId,
      @Valid @RequestBody CreateDiscussionReplyRequest request) {
    return discussionService.addReply(authentication.getName(), postId, request);
  }

  // Post author or Admin closes a discussion thread.
  @PatchMapping("/{postId}/close")
  public DiscussionPostResponse closePost(
      Authentication authentication,
      @PathVariable Long postId) {
    return discussionService.closePost(authentication.getName(), postId);
  }

  // Post author or Admin reopens a closed discussion thread.
  @PatchMapping("/{postId}/reopen")
  public DiscussionPostResponse reopenPost(
      Authentication authentication,
      @PathVariable Long postId) {
    return discussionService.reopenPost(authentication.getName(), postId);
  }

  // Post author or Admin marks a reply as the accepted answer.
  @PatchMapping("/replies/{replyId}/accepted")
  public DiscussionReplyResponse markReplyAsAccepted(
      Authentication authentication,
      @PathVariable Long replyId) {
    return discussionService.markReplyAsAccepted(authentication.getName(), replyId);
  }
}
