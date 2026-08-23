package com.campuscoders.backend.discussion;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;

import com.campuscoders.backend.common.dto.PageResponse;
import org.springframework.web.bind.annotation.DeleteMapping;
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
import com.campuscoders.backend.discussion.dto.DiscussionCategoryResponse;
import com.campuscoders.backend.discussion.dto.DiscussionPostDetailsResponse;
import com.campuscoders.backend.discussion.dto.DiscussionPostResponse;
import com.campuscoders.backend.discussion.dto.DiscussionReplyResponse;
import com.campuscoders.backend.discussion.dto.UpdateDiscussionPostRequest;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class DiscussionController {

  private final DiscussionService discussionService;

  public DiscussionController(DiscussionService discussionService) {
    this.discussionService = discussionService;
  }

  // Public endpoint listing active discussion categories sorted by sortOrder and name.
  @GetMapping("/discussion-categories")
  public List<DiscussionCategoryResponse> getActiveCategories() {
    return discussionService.getActiveCategories();
  }

  // Returns active discussion posts list; supports optional filters by categorySlug, featured status, search query, and pagination.
  @GetMapping("/discussions")
  public PageResponse<DiscussionPostResponse> getDiscussions(
      Authentication authentication,
      @RequestParam(required = false) String categorySlug,
      @RequestParam(required = false) Boolean featured,
      @RequestParam(required = false) String filter,
      @RequestParam(required = false) String search,
      @PageableDefault(page = 0, size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
    String userEmail = (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getName())) 
        ? authentication.getName() : null;
    return discussionService.getDiscussions(userEmail, categorySlug, featured, filter, search, pageable);
  }

  // Returns single thread details including content and active replies.
  @GetMapping("/discussions/{postId}")
  public DiscussionPostDetailsResponse getPostDetails(Authentication authentication, @PathVariable Long postId) {
    String userEmail = (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getName())) 
        ? authentication.getName() : null;
    return discussionService.getPostDetails(userEmail, postId);
  }

  // Authenticated user creates a new discussion post using categoryId.
  @PostMapping("/discussions")
  public DiscussionPostResponse createPost(
      Authentication authentication,
      @Valid @RequestBody CreateDiscussionPostRequest request) {
    return discussionService.createPost(authentication.getName(), request);
  }

  // Post author or Admin updates thread title, categoryId, content, or tags.
  @PutMapping("/discussions/{postId}")
  public DiscussionPostResponse updatePost(
      Authentication authentication,
      @PathVariable Long postId,
      @Valid @RequestBody UpdateDiscussionPostRequest request) {
    return discussionService.updatePost(authentication.getName(), postId, request);
  }

  // Authenticated user posts a reply. Blocked if the thread is closed.
  @PostMapping("/discussions/{postId}/replies")
  public DiscussionReplyResponse addReply(
      Authentication authentication,
      @PathVariable Long postId,
      @Valid @RequestBody CreateDiscussionReplyRequest request) {
    return discussionService.addReply(authentication.getName(), postId, request);
  }

  // Post author or Admin closes a discussion thread.
  @PatchMapping("/discussions/{postId}/close")
  public DiscussionPostResponse closePost(
      Authentication authentication,
      @PathVariable Long postId) {
    return discussionService.closePost(authentication.getName(), postId);
  }

  // Post author or Admin reopens a closed discussion thread.
  @PatchMapping("/discussions/{postId}/reopen")
  public DiscussionPostResponse reopenPost(
      Authentication authentication,
      @PathVariable Long postId) {
    return discussionService.reopenPost(authentication.getName(), postId);
  }
  // Author or Admin deletes a discussion thread.
  @DeleteMapping("/discussions/{postId}")
  public void deletePost(
      Authentication authentication,
      @PathVariable Long postId) {
    discussionService.deletePost(authentication.getName(), postId);
  }

  // Author or Admin updates a reply.
  @PutMapping("/discussions/replies/{replyId}")
  public DiscussionReplyResponse updateReply(
      Authentication authentication,
      @PathVariable Long replyId,
      @Valid @RequestBody com.campuscoders.backend.discussion.dto.UpdateDiscussionReplyRequest request) {
    return discussionService.updateReply(authentication.getName(), replyId, request);
  }

  // Author or Admin deletes a reply.
  @DeleteMapping("/discussions/replies/{replyId}")
  public void deleteReply(
      Authentication authentication,
      @PathVariable Long replyId) {
    discussionService.deleteReply(authentication.getName(), replyId);
  }

  // Upvote or Downvote a discussion post
  @PostMapping("/discussions/{postId}/vote")
  public DiscussionPostResponse votePost(
      Authentication authentication,
      @PathVariable Long postId,
      @Valid @RequestBody com.campuscoders.backend.discussion.dto.VoteDiscussionPostRequest request) {
    return discussionService.votePost(authentication.getName(), postId, request.voteValue());
  }

  // Get Top Contributors (sidebar)
  @GetMapping("/discussions/contributors/top")
  public List<com.campuscoders.backend.discussion.dto.TopContributorResponse> getTopContributors() {
    return discussionService.getTopContributors();
  }

  // Get Popular Tags (sidebar)
  @GetMapping("/discussions/tags/popular")
  public List<com.campuscoders.backend.discussion.dto.PopularTagResponse> getPopularTags() {
    return discussionService.getPopularTags();
  }
}
