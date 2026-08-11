package com.campuscoders.backend.discussion;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.campuscoders.backend.discussion.dto.CreateDiscussionPostRequest;
import com.campuscoders.backend.discussion.dto.CreateDiscussionReplyRequest;
import com.campuscoders.backend.discussion.dto.DiscussionPostDetailsResponse;
import com.campuscoders.backend.discussion.dto.DiscussionPostResponse;
import com.campuscoders.backend.discussion.dto.DiscussionReplyResponse;
import com.campuscoders.backend.discussion.dto.UpdateDiscussionPostRequest;
import com.campuscoders.backend.discussion.repository.DiscussionPostRepository;
import com.campuscoders.backend.discussion.repository.DiscussionReplyRepository;
import com.campuscoders.backend.exception.CustomException;
import com.campuscoders.backend.user.Role;
import com.campuscoders.backend.user.User;
import com.campuscoders.backend.user.repository.UserRepository;

@Service
public class DiscussionService {

  private final DiscussionPostRepository postRepository;
  private final DiscussionReplyRepository replyRepository;
  private final UserRepository userRepository;

  public DiscussionService(
      DiscussionPostRepository postRepository,
      DiscussionReplyRepository replyRepository,
      UserRepository userRepository) {
    this.postRepository = postRepository;
    this.replyRepository = replyRepository;
    this.userRepository = userRepository;
  }

  // --- Student & Public Service Methods ---

  // Fetches active discussion threads supporting optional filters for category, featured status, and text search.
  @Transactional(readOnly = true)
  public List<DiscussionPostResponse> getDiscussions(
      DiscussionCategory category,
      Boolean featured,
      String search) {
    String query = (search != null) ? search.trim().toLowerCase() : "";

    return postRepository.findByActiveTrueOrderByCreatedAtDesc().stream()
        .filter(post -> category == null || post.getCategory() == category)
        .filter(post -> featured == null || post.getFeatured().equals(featured))
        .filter(post -> query.isEmpty()
            || post.getTitle().toLowerCase().contains(query)
            || post.getContent().toLowerCase().contains(query)
            || (post.getTags() != null && post.getTags().toLowerCase().contains(query)))
        .map(this::toPostResponse)
        .toList();
  }

  // Fetches detailed thread view including author details and active replies.
  @Transactional(readOnly = true)
  public DiscussionPostDetailsResponse getPostDetails(Long postId) {
    DiscussionPost post = postRepository.findByIdAndActiveTrue(postId)
        .orElseThrow(() -> new CustomException("Discussion post not found", HttpStatus.NOT_FOUND));

    List<DiscussionReplyResponse> replies = replyRepository
        .findByPostIdAndActiveTrueOrderByCreatedAtAsc(postId).stream()
        .map(this::toReplyResponse)
        .toList();

    return toPostDetailsResponse(post, replies);
  }

  @Transactional
  public DiscussionPostResponse createPost(String authorEmail, CreateDiscussionPostRequest req) {
    User author = getUserByEmail(authorEmail);

    DiscussionPost post = new DiscussionPost();
    post.setAuthor(author);
    post.setCategory(req.category());
    post.setTitle(req.title());
    post.setContent(req.content());
    post.setTags(cleanTags(req.tags()));
    post.setFeatured(false);
    post.setClosed(false);
    post.setActive(true);

    DiscussionPost saved = postRepository.save(post);
    return toPostResponse(saved);
  }

  // Ownership Guard: Only the post author or an ADMIN can modify thread details.
  @Transactional
  public DiscussionPostResponse updatePost(String userEmail, Long postId, UpdateDiscussionPostRequest req) {
    User currentUser = getUserByEmail(userEmail);
    DiscussionPost post = getPostById(postId);

    verifyAuthorOrAdmin(post.getAuthor(), currentUser);

    post.setCategory(req.category());
    post.setTitle(req.title());
    post.setContent(req.content());
    post.setTags(cleanTags(req.tags()));

    DiscussionPost saved = postRepository.save(post);
    return toPostResponse(saved);
  }

  // Closed Post Reply Guard: Prevents new responses from being posted to closed/archived discussion threads.
  @Transactional
  public DiscussionReplyResponse addReply(String authorEmail, Long postId, CreateDiscussionReplyRequest req) {
    User author = getUserByEmail(authorEmail);
    DiscussionPost post = getPostById(postId);

    if (!post.getActive()) {
      throw new CustomException("Cannot reply to an inactive discussion post", HttpStatus.BAD_REQUEST);
    }

    if (post.getClosed()) {
      throw new CustomException("This discussion post is closed for new replies", HttpStatus.BAD_REQUEST);
    }

    DiscussionReply reply = new DiscussionReply();
    reply.setPost(post);
    reply.setAuthor(author);
    reply.setContent(req.content());
    reply.setAcceptedAnswer(false);
    reply.setActive(true);

    DiscussionReply saved = replyRepository.save(reply);
    return toReplyResponse(saved);
  }

  // Ownership Guard: Only the post author or an ADMIN can close a thread.
  @Transactional
  public DiscussionPostResponse closePost(String userEmail, Long postId) {
    User currentUser = getUserByEmail(userEmail);
    DiscussionPost post = getPostById(postId);

    verifyAuthorOrAdmin(post.getAuthor(), currentUser);

    post.setClosed(true);
    return toPostResponse(postRepository.save(post));
  }

  // Ownership Guard: Only the post author or an ADMIN can reopen a thread.
  @Transactional
  public DiscussionPostResponse reopenPost(String userEmail, Long postId) {
    User currentUser = getUserByEmail(userEmail);
    DiscussionPost post = getPostById(postId);

    verifyAuthorOrAdmin(post.getAuthor(), currentUser);

    post.setClosed(false);
    return toPostResponse(postRepository.save(post));
  }

  // Single Accepted Answer Rule: A post can have at most one accepted answer.
  // Setting a new reply as accepted automatically resets any previously accepted reply.
  @Transactional
  public DiscussionReplyResponse markReplyAsAccepted(String userEmail, Long replyId) {
    User currentUser = getUserByEmail(userEmail);

    DiscussionReply reply = replyRepository.findById(replyId)
        .orElseThrow(() -> new CustomException("Discussion reply not found", HttpStatus.NOT_FOUND));

    DiscussionPost post = reply.getPost();
    verifyAuthorOrAdmin(post.getAuthor(), currentUser);

    // Clear previously accepted reply on this post if present
    replyRepository.findByPostIdAndAcceptedAnswerTrue(post.getId())
        .ifPresent(prev -> {
          prev.setAcceptedAnswer(false);
          replyRepository.save(prev);
        });

    reply.setAcceptedAnswer(true);
    return toReplyResponse(replyRepository.save(reply));
  }

  // --- Admin Service Methods ---

  @Transactional(readOnly = true)
  public List<DiscussionPostResponse> getAllDiscussionsForAdmin(
      DiscussionCategory category,
      Boolean featured,
      Boolean active,
      String search) {
    String query = (search != null) ? search.trim().toLowerCase() : "";

    return postRepository.findAllByOrderByCreatedAtDesc().stream()
        .filter(post -> category == null || post.getCategory() == category)
        .filter(post -> featured == null || post.getFeatured().equals(featured))
        .filter(post -> active == null || post.getActive().equals(active))
        .filter(post -> query.isEmpty()
            || post.getTitle().toLowerCase().contains(query)
            || post.getContent().toLowerCase().contains(query)
            || (post.getTags() != null && post.getTags().toLowerCase().contains(query)))
        .map(this::toPostResponse)
        .toList();
  }

  @Transactional
  public DiscussionPostResponse featurePost(Long postId) {
    DiscussionPost post = getPostById(postId);
    post.setFeatured(true);
    return toPostResponse(postRepository.save(post));
  }

  @Transactional
  public DiscussionPostResponse unfeaturePost(Long postId) {
    DiscussionPost post = getPostById(postId);
    post.setFeatured(false);
    return toPostResponse(postRepository.save(post));
  }

  // Soft Delete Decision: Deactivating sets active = false, preserving post data for audit trails.
  @Transactional
  public DiscussionPostResponse deactivatePost(Long postId) {
    DiscussionPost post = getPostById(postId);
    post.setActive(false);
    return toPostResponse(postRepository.save(post));
  }

  @Transactional
  public DiscussionPostResponse activatePost(Long postId) {
    DiscussionPost post = getPostById(postId);
    post.setActive(true);
    return toPostResponse(postRepository.save(post));
  }

  @Transactional
  public DiscussionReplyResponse deactivateReply(Long replyId) {
    DiscussionReply reply = replyRepository.findById(replyId)
        .orElseThrow(() -> new CustomException("Discussion reply not found", HttpStatus.NOT_FOUND));
    reply.setActive(false);
    return toReplyResponse(replyRepository.save(reply));
  }

  @Transactional
  public DiscussionReplyResponse activateReply(Long replyId) {
    DiscussionReply reply = replyRepository.findById(replyId)
        .orElseThrow(() -> new CustomException("Discussion reply not found", HttpStatus.NOT_FOUND));
    reply.setActive(true);
    return toReplyResponse(replyRepository.save(reply));
  }

  // --- Helper Methods ---

  private User getUserByEmail(String email) {
    return userRepository.findByEmail(email)
        .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));
  }

  private DiscussionPost getPostById(Long postId) {
    return postRepository.findById(postId)
        .orElseThrow(() -> new CustomException("Discussion post not found", HttpStatus.NOT_FOUND));
  }

  private void verifyAuthorOrAdmin(User author, User currentUser) {
    boolean isAuthor = author.getId().equals(currentUser.getId());
    boolean isAdmin = currentUser.getRole() == Role.ADMIN;

    if (!isAuthor && !isAdmin) {
      throw new CustomException("You do not have permission to modify this discussion thread", HttpStatus.FORBIDDEN);
    }
  }

  private String cleanTags(String tags) {
    if (tags == null || tags.trim().isEmpty()) {
      return null;
    }
    return tags.trim().toLowerCase();
  }

  private DiscussionPostResponse toPostResponse(DiscussionPost post) {
    long repliesCount = replyRepository.countByPostIdAndActiveTrue(post.getId());
    boolean hasAcceptedAnswer = replyRepository.findByPostIdAndAcceptedAnswerTrue(post.getId()).isPresent();

    String preview = post.getContent();
    if (preview.length() > 150) {
      preview = preview.substring(0, 150) + "...";
    }

    return new DiscussionPostResponse(
        post.getId(),
        post.getAuthor().getId(),
        post.getAuthor().getFullName(),
        post.getAuthor().getAvatarUrl(),
        post.getCategory(),
        post.getTitle(),
        preview,
        post.getTags(),
        post.getFeatured(),
        post.getClosed(),
        post.getActive(),
        repliesCount,
        hasAcceptedAnswer,
        post.getCreatedAt(),
        post.getUpdatedAt());
  }

  private DiscussionPostDetailsResponse toPostDetailsResponse(DiscussionPost post, List<DiscussionReplyResponse> replies) {
    long repliesCount = replyRepository.countByPostIdAndActiveTrue(post.getId());

    return new DiscussionPostDetailsResponse(
        post.getId(),
        post.getAuthor().getId(),
        post.getAuthor().getFullName(),
        post.getAuthor().getAvatarUrl(),
        post.getCategory(),
        post.getTitle(),
        post.getContent(),
        post.getTags(),
        post.getFeatured(),
        post.getClosed(),
        post.getActive(),
        repliesCount,
        replies,
        post.getCreatedAt(),
        post.getUpdatedAt());
  }

  private DiscussionReplyResponse toReplyResponse(DiscussionReply reply) {
    return new DiscussionReplyResponse(
        reply.getId(),
        reply.getPost().getId(),
        reply.getAuthor().getId(),
        reply.getAuthor().getFullName(),
        reply.getAuthor().getAvatarUrl(),
        reply.getContent(),
        reply.getAcceptedAnswer(),
        reply.getActive(),
        reply.getCreatedAt(),
        reply.getUpdatedAt());
  }
}
