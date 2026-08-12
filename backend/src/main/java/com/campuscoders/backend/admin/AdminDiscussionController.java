package com.campuscoders.backend.admin;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.campuscoders.backend.discussion.DiscussionService;
import com.campuscoders.backend.discussion.dto.DiscussionPostResponse;
import com.campuscoders.backend.discussion.dto.DiscussionReplyResponse;

@RestController
@RequestMapping("/api/admin/discussions")
@PreAuthorize("hasRole('ADMIN')")
public class AdminDiscussionController {

  private final DiscussionService discussionService;

  public AdminDiscussionController(DiscussionService discussionService) {
    this.discussionService = discussionService;
  }

  // Lists all posts including soft-deleted ones for moderation.
  @GetMapping
  public List<DiscussionPostResponse> getAllDiscussionsForAdmin(
      @RequestParam(required = false) String categorySlug,
      @RequestParam(required = false) Boolean featured,
      @RequestParam(required = false) Boolean active,
      @RequestParam(required = false) String search) {
    return discussionService.getAllDiscussionsForAdmin(categorySlug, featured, active, search);
  }

  // Highlights a post as featured on the community page.
  @PatchMapping("/{postId}/feature")
  public DiscussionPostResponse featurePost(@PathVariable Long postId) {
    return discussionService.featurePost(postId);
  }

  // Removes featured status from a post.
  @PatchMapping("/{postId}/unfeature")
  public DiscussionPostResponse unfeaturePost(@PathVariable Long postId) {
    return discussionService.unfeaturePost(postId);
  }

  // Soft-deletes a discussion post (active = false).
  @PatchMapping("/{postId}/deactivate")
  public DiscussionPostResponse deactivatePost(@PathVariable Long postId) {
    return discussionService.deactivatePost(postId);
  }

  // Restores a soft-deleted discussion post (active = true).
  @PatchMapping("/{postId}/activate")
  public DiscussionPostResponse activatePost(@PathVariable Long postId) {
    return discussionService.activatePost(postId);
  }

  // Soft-deletes an offensive reply.
  @PatchMapping("/replies/{replyId}/deactivate")
  public DiscussionReplyResponse deactivateReply(@PathVariable Long replyId) {
    return discussionService.deactivateReply(replyId);
  }

  // Restores a soft-deleted reply.
  @PatchMapping("/replies/{replyId}/activate")
  public DiscussionReplyResponse activateReply(@PathVariable Long replyId) {
    return discussionService.activateReply(replyId);
  }
}
