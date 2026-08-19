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
import com.campuscoders.backend.discussion.dto.PopularTagResponse;
import com.campuscoders.backend.discussion.dto.TopContributorResponse;
import com.campuscoders.backend.discussion.dto.UpdateDiscussionCategoryRequest;
import com.campuscoders.backend.discussion.dto.UpdateDiscussionPostRequest;
import com.campuscoders.backend.discussion.repository.DiscussionCategoryRepository;
import com.campuscoders.backend.discussion.repository.DiscussionPostRepository;
import com.campuscoders.backend.discussion.repository.DiscussionReplyRepository;
import com.campuscoders.backend.discussion.repository.DiscussionVoteRepository;
import com.campuscoders.backend.exception.CustomException;
import com.campuscoders.backend.user.Role;
import com.campuscoders.backend.user.User;
import com.campuscoders.backend.user.repository.UserRepository;

@Service
public class DiscussionService {

  private final DiscussionPostRepository postRepository;
  private final DiscussionReplyRepository replyRepository;
  private final DiscussionCategoryRepository categoryRepository;
  private final DiscussionVoteRepository voteRepository;
  private final UserRepository userRepository;

  public DiscussionService(
      DiscussionPostRepository postRepository,
      DiscussionReplyRepository replyRepository,
      DiscussionCategoryRepository categoryRepository,
      DiscussionVoteRepository voteRepository,
      UserRepository userRepository) {
    this.postRepository = postRepository;
    this.replyRepository = replyRepository;
    this.categoryRepository = categoryRepository;
    this.voteRepository = voteRepository;
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

  // Fetches active discussion threads supporting optional filters for categorySlug, featured status, text search, and sorting.
  @Transactional(readOnly = true)
  public PageResponse<DiscussionPostResponse> getDiscussions(
      String userEmail,
      String categorySlug,
      Boolean featured,
      String filter,
      String search,
      Pageable pageable) {

    // Override sort based on filter if provided
    if (filter != null) {
      if ("most_replied".equals(filter)) {
        pageable = org.springframework.data.domain.PageRequest.of(
            pageable.getPageNumber(), pageable.getPageSize(), org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "repliesCount"));
      } else if ("latest".equals(filter)) {
        pageable = org.springframework.data.domain.PageRequest.of(
            pageable.getPageNumber(), pageable.getPageSize(), org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"));
      } else if ("unanswered".equals(filter)) {
        // Handled by custom repository query or we can just stick to default sort and let repository filter
        // Actually, we need to pass unanswered to the repository if we want it paginated properly.
        // For now, let's keep it simple and just fetch and filter, or update repository to accept unanswered flag.
      }
    }

    // Since we need to support 'unanswered', we should update the repository method or add a new one.
    // For now we will use the existing findActiveDiscussions. If unanswered is needed, we will modify the repo next.

    Page<DiscussionPost> postsPage = postRepository.findActiveDiscussions(
        categorySlug, featured, search, pageable);
    List<DiscussionPostResponse> mapped = postsPage.getContent().stream()
        .map(post -> toPostResponse(post, userEmail))
        .toList();
    return PageResponse.from(postsPage, mapped);
  }

  // Fetches detailed thread view including author details and active replies.
  @Transactional(readOnly = true)
  public DiscussionPostDetailsResponse getPostDetails(String userEmail, Long postId) {
    DiscussionPost post = postRepository.findByIdAndActiveTrue(postId)
        .orElseThrow(() -> new CustomException("Discussion post not found", HttpStatus.NOT_FOUND));

    List<DiscussionReplyResponse> replies = replyRepository
        .findByPostIdAndActiveTrueOrderByCreatedAtAsc(postId).stream()
        .map(this::toReplyResponse)
        .toList();

    return toPostDetailsResponse(post, replies, userEmail);
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
    post.setVoteScore(0);
    post.setRepliesCount(0);

    DiscussionPost saved = postRepository.save(post);
    return toPostResponse(saved, authorEmail);
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
    return toPostResponse(saved, userEmail);
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
    
    // Update repliesCount on parent post
    post.setRepliesCount(post.getRepliesCount() + 1);
    postRepository.save(post);

    return toReplyResponse(saved);
  }

  // Ownership Guard: Only the post author or an ADMIN can close a thread.
  @Transactional
  public DiscussionPostResponse closePost(String userEmail, Long postId) {
    User currentUser = getUserByEmail(userEmail);
    DiscussionPost post = getPostById(postId);

    verifyAuthorOrAdmin(post.getAuthor(), currentUser);

    post.setClosed(true);
    return toPostResponse(postRepository.save(post), userEmail);
  }

  // Ownership Guard: Only the post author or an ADMIN can reopen a thread.
  @Transactional
  public DiscussionPostResponse reopenPost(String userEmail, Long postId) {
    User currentUser = getUserByEmail(userEmail);
    DiscussionPost post = getPostById(postId);

    verifyAuthorOrAdmin(post.getAuthor(), currentUser);

    post.setClosed(false);
    return toPostResponse(postRepository.save(post), userEmail);
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

  @Transactional
  public DiscussionPostResponse votePost(String userEmail, Long postId, int voteValue) {
    User currentUser = getUserByEmail(userEmail);
    DiscussionPost post = getPostById(postId);

    if (!post.getActive()) {
      throw new CustomException("Cannot vote on an inactive discussion post", HttpStatus.BAD_REQUEST);
    }

    java.util.Optional<DiscussionVote> existingVoteOpt = voteRepository.findByUserIdAndPostId(currentUser.getId(), post.getId());

    if (existingVoteOpt.isPresent()) {
      DiscussionVote existingVote = existingVoteOpt.get();
      if (existingVote.getVoteValue() == voteValue) {
        // User clicked same vote again, meaning remove vote
        post.setVoteScore(post.getVoteScore() - existingVote.getVoteValue());
        voteRepository.delete(existingVote);
      } else {
        // User changed vote (e.g. from 1 to -1)
        post.setVoteScore(post.getVoteScore() - existingVote.getVoteValue() + voteValue);
        existingVote.setVoteValue(voteValue);
        voteRepository.save(existingVote);
      }
    } else {
      // New vote
      DiscussionVote newVote = new DiscussionVote();
      newVote.setUser(currentUser);
      newVote.setPost(post);
      newVote.setVoteValue(voteValue);
      voteRepository.save(newVote);
      post.setVoteScore(post.getVoteScore() + voteValue);
    }

    return toPostResponse(postRepository.save(post), userEmail);
  }

  @Transactional(readOnly = true)
  public List<TopContributorResponse> getTopContributors() {
    return replyRepository.findTopContributors(org.springframework.data.domain.PageRequest.of(0, 5))
        .stream()
        .map(obj -> TopContributorResponse.builder()
            .userId((Long) obj[0])
            .fullName((String) obj[1])
            .avatarUrl((String) obj[2])
            .repliesCount((Long) obj[3])
            .build())
        .toList();
  }

  @Transactional(readOnly = true)
  public List<PopularTagResponse> getPopularTags() {
    List<DiscussionPost> recentPosts = postRepository.findAll(org.springframework.data.domain.PageRequest.of(0, 100, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"))).getContent();
    java.util.Map<String, Long> tagCounts = new java.util.HashMap<>();

    for (DiscussionPost post : recentPosts) {
      if (post.getTags() != null && !post.getTags().isBlank()) {
        String[] splitTags = post.getTags().split(",");
        for (String tag : splitTags) {
          String cleanTag = tag.trim().toLowerCase();
          if (!cleanTag.isEmpty()) {
            tagCounts.put(cleanTag, tagCounts.getOrDefault(cleanTag, 0L) + 1);
          }
        }
      }
    }

    return tagCounts.entrySet().stream()
        .sorted(java.util.Map.Entry.<String, Long>comparingByValue().reversed())
        .limit(10)
        .map(entry -> PopularTagResponse.builder()
            .tag(entry.getKey())
            .count(entry.getValue())
            .build())
        .toList();
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
        .map(post -> toPostResponse(post, null))
        .toList();
    return PageResponse.from(postsPage, mapped);
  }

  @Transactional
  public DiscussionPostResponse featurePost(Long postId) {
    DiscussionPost post = getPostById(postId);
    post.setFeatured(true);
    return toPostResponse(postRepository.save(post), null);
  }

  @Transactional
  public DiscussionPostResponse unfeaturePost(Long postId) {
    DiscussionPost post = getPostById(postId);
    post.setFeatured(false);
    return toPostResponse(postRepository.save(post), null);
  }

  // Soft Delete Decision: Deactivating sets active = false, preserving post data for audit trails.
  @Transactional
  public DiscussionPostResponse deactivatePost(Long postId) {
    DiscussionPost post = getPostById(postId);
    post.setActive(false);
    return toPostResponse(postRepository.save(post), null);
  }

  @Transactional
  public DiscussionPostResponse activatePost(Long postId) {
    DiscussionPost post = getPostById(postId);
    post.setActive(true);
    return toPostResponse(postRepository.save(post), null);
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

  private DiscussionPostResponse toPostResponse(DiscussionPost post, String userEmail) {
    long repliesCount = replyRepository.countByPostIdAndActiveTrue(post.getId());
    boolean hasAcceptedAnswer = replyRepository.findByPostIdAndAcceptedAnswerTrue(post.getId()).isPresent();

    final Integer[] userVote = {0};
    if (userEmail != null) {
      userRepository.findByEmail(userEmail).ifPresent(user -> {
        voteRepository.findByUserIdAndPostId(user.getId(), post.getId())
            .ifPresent(vote -> userVote[0] = vote.getVoteValue());
      });
    }

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
        post.getVoteScore(),
        userVote[0],
        repliesCount,
        hasAcceptedAnswer,
        post.getCreatedAt(),
        post.getUpdatedAt());
  }

  private DiscussionPostDetailsResponse toPostDetailsResponse(DiscussionPost post, List<DiscussionReplyResponse> replies, String userEmail) {
    long repliesCount = replyRepository.countByPostIdAndActiveTrue(post.getId());

    final Integer[] userVote = {0};
    if (userEmail != null) {
      userRepository.findByEmail(userEmail).ifPresent(user -> {
        voteRepository.findByUserIdAndPostId(user.getId(), post.getId())
            .ifPresent(vote -> userVote[0] = vote.getVoteValue());
      });
    }

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
        post.getVoteScore(),
        userVote[0],
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
