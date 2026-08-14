package com.campuscoders.backend.discussion;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.campuscoders.backend.common.dto.PageResponse;

import com.campuscoders.backend.discussion.dto.CreateDiscussionCategoryRequest;
import com.campuscoders.backend.discussion.dto.CreateDiscussionPostRequest;
import com.campuscoders.backend.discussion.dto.CreateDiscussionReplyRequest;
import com.campuscoders.backend.discussion.dto.DiscussionCategoryResponse;
import com.campuscoders.backend.discussion.dto.DiscussionPostDetailsResponse;
import com.campuscoders.backend.discussion.dto.DiscussionPostResponse;
import com.campuscoders.backend.discussion.dto.DiscussionReplyResponse;
import com.campuscoders.backend.discussion.dto.UpdateDiscussionCategoryRequest;
import com.campuscoders.backend.discussion.dto.UpdateDiscussionPostRequest;
import com.campuscoders.backend.discussion.repository.DiscussionCategoryRepository;
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
  private final DiscussionCategoryRepository categoryRepository;
  private final UserRepository userRepository;

  public DiscussionService(
      DiscussionPostRepository postRepository,
      DiscussionReplyRepository replyRepository,
      DiscussionCategoryRepository categoryRepository,
      UserRepository userRepository) {
    this.postRepository = postRepository;
    this.replyRepository = replyRepository;
    this.categoryRepository = categoryRepository;
    this.userRepository = userRepository;
  }

  // --- Discussion Category Management Methods ---

  @Transactional(readOnly = true)
  public List<DiscussionCategoryResponse> getActiveCategories() {
    return categoryRepository.findByActiveTrueOrderBySortOrderAscNameAsc().stream()
        .map(this::toCategoryResponse)
        .toList();
  }

  @Transactional(readOnly = true)
  public List<DiscussionCategoryResponse> getAllCategoriesForAdmin() {
    return categoryRepository.findAllByOrderBySortOrderAscNameAsc().stream()
        .map(this::toCategoryResponse)
        .toList();
  }

  @Transactional
  public DiscussionCategoryResponse createCategory(CreateDiscussionCategoryRequest req) {
    String slug = generateSlug(req.name(), req.slug());

    if (categoryRepository.existsBySlug(slug)) {
      throw new CustomException("Discussion category slug already exists: " + slug, HttpStatus.CONFLICT);
    }

    DiscussionCategory category = new DiscussionCategory();
    category.setName(req.name());
    category.setSlug(slug);
    category.setDescription(req.description());
    category.setColor(req.color() != null ? req.color() : "#3B82F6");
    category.setIconName(req.iconName() != null ? req.iconName() : "message-square");
    category.setSortOrder(req.sortOrder() != null ? req.sortOrder() : 0);
    category.setActive(true);

    return toCategoryResponse(categoryRepository.save(category));
  }

  @Transactional
  public DiscussionCategoryResponse updateCategory(Long categoryId, UpdateDiscussionCategoryRequest req) {
    DiscussionCategory category = getCategoryById(categoryId);
    String slug = generateSlug(req.name(), req.slug());

    if (categoryRepository.existsBySlugAndIdNot(slug, categoryId)) {
      throw new CustomException("Discussion category slug already exists: " + slug, HttpStatus.CONFLICT);
    }

    category.setName(req.name());
    category.setSlug(slug);
    category.setDescription(req.description());
    if (req.color() != null) {
      category.setColor(req.color());
    }
    if (req.iconName() != null) {
      category.setIconName(req.iconName());
    }
    if (req.sortOrder() != null) {
      category.setSortOrder(req.sortOrder());
    }

    return toCategoryResponse(categoryRepository.save(category));
  }

  @Transactional
  public DiscussionCategoryResponse activateCategory(Long categoryId) {
    DiscussionCategory category = getCategoryById(categoryId);
    category.setActive(true);
    return toCategoryResponse(categoryRepository.save(category));
  }

  // Soft Deactivation: Sets active = false, keeping category data in DB to preserve historical posts.
  @Transactional
  public DiscussionCategoryResponse deactivateCategory(Long categoryId) {
    DiscussionCategory category = getCategoryById(categoryId);
    category.setActive(false);
    return toCategoryResponse(categoryRepository.save(category));
  }

  // --- Student & Public Discussion Post Methods ---

  // Fetches active discussion threads supporting optional filters for categorySlug, featured status, and text search.
  @Transactional(readOnly = true)
  public PageResponse<DiscussionPostResponse> getDiscussions(
      String categorySlug,
      Boolean featured,
      String search,
      Pageable pageable) {
    Page<DiscussionPost> postsPage = postRepository.findActiveDiscussions(
        categorySlug, featured, search, pageable);
    List<DiscussionPostResponse> mapped = postsPage.getContent().stream()
        .map(this::toPostResponse)
        .toList();
    return PageResponse.from(postsPage, mapped);
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
    DiscussionCategory category = getCategoryById(req.categoryId());

    if (!category.getActive()) {
      throw new CustomException("Cannot create post in an inactive category", HttpStatus.BAD_REQUEST);
    }

    DiscussionPost post = new DiscussionPost();
    post.setAuthor(author);
    post.setCategory(category);
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

    DiscussionCategory category = getCategoryById(req.categoryId());
    if (!category.getActive()) {
      throw new CustomException("Cannot move post to an inactive category", HttpStatus.BAD_REQUEST);
    }

    post.setCategory(category);
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
  public PageResponse<DiscussionPostResponse> getAllDiscussionsForAdmin(
      String categorySlug,
      Boolean featured,
      Boolean active,
      String search,
      Pageable pageable) {
    Page<DiscussionPost> postsPage = postRepository.findAdminDiscussions(
        categorySlug, featured, active, search, pageable);
    List<DiscussionPostResponse> mapped = postsPage.getContent().stream()
        .map(this::toPostResponse)
        .toList();
    return PageResponse.from(postsPage, mapped);
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

  private DiscussionCategory getCategoryById(Long categoryId) {
    return categoryRepository.findById(categoryId)
        .orElseThrow(() -> new CustomException("Discussion category not found with ID: " + categoryId, HttpStatus.NOT_FOUND));
  }

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

  private String generateSlug(String name, String customSlug) {
    if (customSlug != null && !customSlug.trim().isEmpty()) {
      return customSlug.trim().toLowerCase().replaceAll("[^a-z0-9-]+", "-");
    }
    return name.trim().toLowerCase().replaceAll("[^a-z0-9-]+", "-");
  }

  private String cleanTags(String tags) {
    if (tags == null || tags.trim().isEmpty()) {
      return null;
    }
    return tags.trim().toLowerCase();
  }

  private DiscussionCategoryResponse toCategoryResponse(DiscussionCategory category) {
    return new DiscussionCategoryResponse(
        category.getId(),
        category.getName(),
        category.getSlug(),
        category.getDescription(),
        category.getColor(),
        category.getIconName(),
        category.getSortOrder(),
        category.getActive(),
        category.getCreatedAt(),
        category.getUpdatedAt());
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
        post.getCategory().getId(),
        post.getCategory().getName(),
        post.getCategory().getSlug(),
        post.getCategory().getColor(),
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
        post.getCategory().getId(),
        post.getCategory().getName(),
        post.getCategory().getSlug(),
        post.getCategory().getColor(),
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
