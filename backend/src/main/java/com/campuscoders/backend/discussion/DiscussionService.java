package com.campuscoders.backend.discussion;

import java.util.*;

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
import com.campuscoders.backend.discussion.dto.UpdateDiscussionReplyRequest;
import com.campuscoders.backend.discussion.repository.DiscussionCategoryRepository;
import com.campuscoders.backend.discussion.repository.DiscussionPostRepository;
import com.campuscoders.backend.discussion.repository.DiscussionReplyRepository;
import com.campuscoders.backend.discussion.repository.DiscussionVoteRepository;
import com.campuscoders.backend.exception.CustomException;
import com.campuscoders.backend.notification.NotificationService;
import com.campuscoders.backend.notification.NotificationType;
import com.campuscoders.backend.notification.dto.CreateNotificationRequest;
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
  private final NotificationService notificationService;

  public DiscussionService(
      DiscussionPostRepository postRepository,
      DiscussionReplyRepository replyRepository,
      DiscussionCategoryRepository categoryRepository,
      DiscussionVoteRepository voteRepository,
      UserRepository userRepository,
      NotificationService notificationService) {
    this.postRepository = postRepository;
    this.replyRepository = replyRepository;
    this.categoryRepository = categoryRepository;
    this.voteRepository = voteRepository;
    this.userRepository = userRepository;
    this.notificationService = notificationService;
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

  // Soft Deactivation: Sets active = false, keeping category data in DB to
  // preserve historical posts.
  @Transactional
  public DiscussionCategoryResponse deactivateCategory(Long categoryId) {
    DiscussionCategory category = getCategoryById(categoryId);
    category.setActive(false);
    return toCategoryResponse(categoryRepository.save(category));
  }

  // --- Student & Public Discussion Post Methods ---

  // Fetches active discussion threads supporting optional filters for
  // categorySlug, featured status, text search, and sorting.
  @Transactional(readOnly = true)
  public PageResponse<DiscussionPostResponse> getDiscussions(
      String userEmail,
      String categorySlug,
      Boolean featured,
      String filter,
      String search,
      Pageable pageable) {

    String sortFilter = filter == null ? "latest" : filter.toLowerCase();
    Boolean featuredFlag = featured;
    Boolean unansweredFlag = null;

    if ("featured".equals(sortFilter)) {
      featuredFlag = true;
    }
    if ("unanswered".equals(sortFilter)) {
      unansweredFlag = true;
    }

    org.springframework.data.domain.Sort.Direction desc = org.springframework.data.domain.Sort.Direction.DESC;
    org.springframework.data.domain.Sort sort = org.springframework.data.domain.Sort.by(desc, "createdAt");
    if ("top".equals(sortFilter) || "most_voted".equals(sortFilter)) {
      sort = org.springframework.data.domain.Sort.by(desc, "voteScore")
          .and(org.springframework.data.domain.Sort.by(desc, "createdAt"));
    } else if ("most_replied".equals(sortFilter)) {
      sort = org.springframework.data.domain.Sort.by(desc, "repliesCount")
          .and(org.springframework.data.domain.Sort.by(desc, "createdAt"));
    }

    pageable = org.springframework.data.domain.PageRequest.of(
        pageable.getPageNumber(), pageable.getPageSize(), sort);

    Page<DiscussionPost> postsPage = postRepository.findActiveDiscussions(
        categorySlug, featuredFlag, search, unansweredFlag, pageable);
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

  // Closed Post Reply Guard: Prevents new responses from being posted to
  // closed/archived discussion threads.
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
    reply.setActive(true);

    DiscussionReply saved = replyRepository.save(reply);

    // Update repliesCount on parent post
    post.setRepliesCount(post.getRepliesCount() + 1);
    postRepository.save(post);

    // Emit notification to post author when they opted into discussion alerts
    if (!post.getAuthor().getId().equals(author.getId())
        && !Boolean.FALSE.equals(post.getAuthor().getDiscussionMentions())) {
      notificationService.createNotification(new CreateNotificationRequest(
          post.getAuthor().getId(),
          "New Reply",
          author.getFullName() + " replied to your discussion: " + post.getTitle(),
          NotificationType.DISCUSSION,
          "/dashboard/discussions/" + post.getId()
      ));
    }

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

  // Ownership Guard: Only the post author or an ADMIN can delete a thread.
  @Transactional
  public void deletePost(String userEmail, Long postId) {
    User currentUser = getUserByEmail(userEmail);
    DiscussionPost post = getPostById(postId);

    verifyAuthorOrAdmin(post.getAuthor(), currentUser);

    post.setActive(false);
    postRepository.save(post);
  }

  // Soft Delete Decision: Deactivating sets active = false.
  @Transactional
  public void deleteReply(String userEmail, Long replyId) {
    User currentUser = getUserByEmail(userEmail);

    DiscussionReply reply = replyRepository.findById(replyId)
        .orElseThrow(() -> new CustomException("Discussion reply not found", HttpStatus.NOT_FOUND));

    verifyAuthorOrAdmin(reply.getAuthor(), currentUser);

    reply.setActive(false);
    replyRepository.save(reply);

    // Decrease replies count on parent post
    DiscussionPost post = reply.getPost();
    if (post.getRepliesCount() > 0) {
      post.setRepliesCount(post.getRepliesCount() - 1);
      postRepository.save(post);
    }
  }

  @Transactional
  public DiscussionReplyResponse updateReply(String userEmail, Long replyId, UpdateDiscussionReplyRequest req) {
    User currentUser = getUserByEmail(userEmail);

    DiscussionReply reply = replyRepository.findById(replyId)
        .orElseThrow(() -> new CustomException("Discussion reply not found", HttpStatus.NOT_FOUND));

    verifyAuthorOrAdmin(reply.getAuthor(), currentUser);

    reply.setContent(req.content());
    return toReplyResponse(replyRepository.save(reply));
  }

  @Transactional
  public DiscussionPostResponse votePost(String userEmail, Long postId, int voteValue) {
    User currentUser = getUserByEmail(userEmail);
    DiscussionPost post = getPostById(postId);

    if (!post.getActive()) {
      throw new CustomException("Cannot vote on an inactive discussion post", HttpStatus.BAD_REQUEST);
    }
    if (voteValue != 1 && voteValue != -1) {
      throw new CustomException("Vote value must be 1 or -1", HttpStatus.BAD_REQUEST);
    }

    int currentScore = post.getVoteScore() == null ? 0 : post.getVoteScore();
    java.util.Optional<DiscussionVote> existingVoteOpt = voteRepository.findByUserIdAndPostId(currentUser.getId(),
        post.getId());

    if (existingVoteOpt.isPresent()) {
      DiscussionVote existingVote = existingVoteOpt.get();
      // Same button undoes the vote. Opposite button returns to 0 instead of flipping
      // e.g. upvote then downvote would otherwise jump 0 → 1 → -1.
      post.setVoteScore(currentScore - existingVote.getVoteValue());
      voteRepository.delete(existingVote);
    } else if (voteValue == -1 && currentScore <= 0) {
      // Do not let a downvote push a 0-score thread into negatives.
      return toPostResponse(post, userEmail);
    } else {
      DiscussionVote newVote = new DiscussionVote();
      newVote.setUser(currentUser);
      newVote.setPost(post);
      newVote.setVoteValue(voteValue);
      voteRepository.save(newVote);
      post.setVoteScore(currentScore + voteValue);
    }

    if (post.getVoteScore() == null || post.getVoteScore() < 0) {
      post.setVoteScore(0);
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
    List<DiscussionPost> recentPosts = postRepository
        .findAll(org.springframework.data.domain.PageRequest.of(0, 100,
            org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt")))
        .getContent();
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

  // Soft Delete Decision: Deactivating sets active = false, preserving post data
  // for audit trails.
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
        .orElseThrow(
            () -> new CustomException("Discussion category not found with ID: " + categoryId, HttpStatus.NOT_FOUND));
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

  public static final List<String> ALLOWED_TAGS = List.of(
      "java", "python", "c++", "javascript", "typescript", "go", "rust", "sql", "html", "css",
      "react", "spring-boot", "nodejs", "django", "angular", "vue", "express", "mongodb", "postgresql", "docker", "aws",
      "git",
      "frontend", "backend", "full-stack", "mobile", "machine-learning", "data-science", "devops", "cloud",
      "cybersecurity",
      "dsa", "system-design", "object-oriented-programming", "database-design", "api", "testing",
      "interview-experience", "resume-review", "compensation", "tips", "off-campus", "internship", "hackathon",
      "competitive-programming", "contest",
      "array", "string", "dynamic-programming", "two-pointers", "graph", "tree", "greedy", "math");

  private String cleanTags(String tags) {
    if (tags == null || tags.trim().isEmpty()) {
      return null;
    }
    String[] tagArray = tags.toLowerCase().split(",");
    List<String> validTags = new ArrayList<>();
    for (String tag : tagArray) {
      String t = tag.trim();
      if (!t.isEmpty()) {
        if (!ALLOWED_TAGS.contains(t)) {
          throw new CustomException("Invalid tag provided: " + t, HttpStatus.BAD_REQUEST);
        }
        validTags.add(t);
      }
    }
    return String.join(",", validTags);
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

    final Integer[] userVote = { 0 };
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
        post.getCreatedAt(),
        post.getUpdatedAt());
  }

  private DiscussionPostDetailsResponse toPostDetailsResponse(DiscussionPost post,
      List<DiscussionReplyResponse> replies, String userEmail) {
    long repliesCount = replyRepository.countByPostIdAndActiveTrue(post.getId());

    final Integer[] userVote = { 0 };
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
        reply.getActive(),
        reply.getCreatedAt(),
        reply.getUpdatedAt());
  }
}
