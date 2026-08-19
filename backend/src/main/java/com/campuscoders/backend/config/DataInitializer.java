package com.campuscoders.backend.config;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.campuscoders.backend.announcement.Announcement;
import com.campuscoders.backend.announcement.AnnouncementCategory;
import com.campuscoders.backend.announcement.repository.AnnouncementRepository;
import com.campuscoders.backend.dailychallenge.CodingProblem;
import com.campuscoders.backend.dailychallenge.DailyChallenge;
import com.campuscoders.backend.dailychallenge.repository.CodingProblemRepository;
import com.campuscoders.backend.dailychallenge.repository.DailyChallengeRepository;
import com.campuscoders.backend.discussion.DiscussionCategory;
import com.campuscoders.backend.discussion.DiscussionPost;
import com.campuscoders.backend.discussion.DiscussionReply;
import com.campuscoders.backend.discussion.repository.DiscussionCategoryRepository;
import com.campuscoders.backend.discussion.repository.DiscussionPostRepository;
import com.campuscoders.backend.discussion.repository.DiscussionReplyRepository;
import com.campuscoders.backend.learningpath.DifficultyLevel;
import com.campuscoders.backend.learningpath.LearningPath;
import com.campuscoders.backend.learningpath.LearningResource;
import com.campuscoders.backend.learningpath.ResourceType;
import com.campuscoders.backend.learningpath.Topic;
import com.campuscoders.backend.learningpath.repository.LearningPathRepository;
import com.campuscoders.backend.learningpath.repository.LearningResourceRepository;
import com.campuscoders.backend.learningpath.repository.TopicRepository;
import com.campuscoders.backend.user.Role;
import com.campuscoders.backend.user.User;
import com.campuscoders.backend.user.repository.UserRepository;

@Component
@Profile({"dev", "default"})
public class DataInitializer implements CommandLineRunner {

  private final LearningPathRepository learningPathRepository;
  private final TopicRepository topicRepository;
  private final LearningResourceRepository learningResourceRepository;
  private final AnnouncementRepository announcementRepository;
  private final CodingProblemRepository codingProblemRepository;
  private final DailyChallengeRepository dailyChallengeRepository;
  private final DiscussionCategoryRepository discussionCategoryRepository;
  private final DiscussionPostRepository discussionPostRepository;
  private final DiscussionReplyRepository discussionReplyRepository;
  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;

  public DataInitializer(
      LearningPathRepository learningPathRepository,
      TopicRepository topicRepository,
      LearningResourceRepository learningResourceRepository,
      AnnouncementRepository announcementRepository,
      CodingProblemRepository codingProblemRepository,
      DailyChallengeRepository dailyChallengeRepository,
      DiscussionCategoryRepository discussionCategoryRepository,
      DiscussionPostRepository discussionPostRepository,
      DiscussionReplyRepository discussionReplyRepository,
      UserRepository userRepository,
      PasswordEncoder passwordEncoder) {
    this.learningPathRepository = learningPathRepository;
    this.topicRepository = topicRepository;
    this.learningResourceRepository = learningResourceRepository;
    this.announcementRepository = announcementRepository;
    this.codingProblemRepository = codingProblemRepository;
    this.dailyChallengeRepository = dailyChallengeRepository;
    this.discussionCategoryRepository = discussionCategoryRepository;
    this.discussionPostRepository = discussionPostRepository;
    this.discussionReplyRepository = discussionReplyRepository;
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
  }

  @Override
  @Transactional
  public void run(String... args) throws Exception {
    seedDefaultUsers();

    if (learningPathRepository.count() == 0) {
      seedCurriculum();
    }

    if (announcementRepository.count() == 0) {
      seedAnnouncement();
    }

    if (codingProblemRepository.count() == 0) {
      seedCodingProblemsAndDailyChallenge();
    }

    if (discussionCategoryRepository.count() == 0) {
      seedDiscussionCategoriesAndPosts();
    }
  }

  private void seedDefaultUsers() {
    User student = userRepository.findByEmail("student@campus.com").orElseGet(User::new);
    student.setFullName("Alex Rivera");
    student.setEmail("student@campus.com");
    student.setPassword(passwordEncoder.encode("student123"));
    student.setRole(Role.STUDENT);
    student.setEnabled(true);
    if (student.getTotalXp() == null) student.setTotalXp(120);
    if (student.getDailyStreak() == null) student.setDailyStreak(5);
    if (student.getProblemsSolved() == null) student.setProblemsSolved(15);
    userRepository.save(student);

    User admin = userRepository.findByEmail("admin@campus.com").orElseGet(User::new);
    admin.setFullName("Shaik Khaleed");
    admin.setEmail("admin@campus.com");
    admin.setPassword(passwordEncoder.encode("admin123"));
    admin.setRole(Role.ADMIN);
    admin.setEnabled(true);
    if (admin.getTotalXp() == null) admin.setTotalXp(500);
    if (admin.getDailyStreak() == null) admin.setDailyStreak(20);
    if (admin.getProblemsSolved() == null) admin.setProblemsSolved(50);
    userRepository.save(admin);
  }

  private void seedCurriculum() {
    LearningPath javaPath = new LearningPath();
    javaPath.setTitle("Java Backend Development");
    javaPath.setSlug("java-backend-development");
    javaPath.setShortDescription("Master Java 21, Spring Boot, JPA, and REST APIs.");
    javaPath.setDescription("Comprehensive backend path covering core Java OOP, Spring Boot, MySQL database persistence, Security, and JWT.");
    javaPath.setIconName("code");
    javaPath.setCategory("Backend");
    javaPath.setDifficulty(DifficultyLevel.BEGINNER);
    javaPath.setEstimatedHours(40);
    javaPath.setActive(true);
    LearningPath savedJavaPath = learningPathRepository.save(javaPath);

    Topic oopTopic = new Topic();
    oopTopic.setLearningPath(savedJavaPath);
    oopTopic.setTitle("Java Core & OOP Principles");
    oopTopic.setSlug("java-core-oop");
    oopTopic.setDescription("Classes, Objects, Inheritance, Polymorphism, and Interfaces in Java 21.");
    oopTopic.setEstimatedMinutes(180);
    oopTopic.setSortOrder(1);
    oopTopic.setActive(true);
    Topic savedOopTopic = topicRepository.save(oopTopic);

    LearningResource res1 = new LearningResource();
    res1.setTopic(savedOopTopic);
    res1.setTitle("Java Object-Oriented Programming (Video)");
    res1.setDescription("Learn classes, instances, inheritance, and encapsulation with real examples.");
    res1.setType(ResourceType.VIDEO);
    res1.setDifficulty(DifficultyLevel.BEGINNER);
    res1.setUrl("https://youtube.com");
    res1.setProvider("YouTube");
    res1.setEstimatedMinutes(45);
    res1.setSortOrder(1);
    res1.setActive(true);
    learningResourceRepository.save(res1);

    LearningResource res2 = new LearningResource();
    res2.setTopic(savedOopTopic);
    res2.setTitle("Java 21 Features Guide (Article)");
    res2.setDescription("Overview of modern Java 21 features including pattern matching and virtual threads.");
    res2.setType(ResourceType.ARTICLE);
    res2.setDifficulty(DifficultyLevel.INTERMEDIATE);
    res2.setUrl("https://dev.java");
    res2.setProvider("Oracle Dev");
    res2.setEstimatedMinutes(30);
    res2.setSortOrder(2);
    res2.setActive(true);
    learningResourceRepository.save(res2);

    Topic springTopic = new Topic();
    springTopic.setLearningPath(savedJavaPath);
    springTopic.setTitle("Spring Boot & REST APIs");
    springTopic.setSlug("spring-boot-rest-apis");
    springTopic.setDescription("Building RESTful Web Services with Spring Boot, Spring Security, and MySQL.");
    springTopic.setEstimatedMinutes(240);
    springTopic.setSortOrder(2);
    springTopic.setActive(true);
    Topic savedSpringTopic = topicRepository.save(springTopic);

    LearningResource res3 = new LearningResource();
    res3.setTopic(savedSpringTopic);
    res3.setTitle("Building REST Controllers (Tutorial)");
    res3.setDescription("Step-by-step guide to @RestController, @GetMapping, @PostMapping, and DTO mappings.");
    res3.setType(ResourceType.ARTICLE);
    res3.setDifficulty(DifficultyLevel.INTERMEDIATE);
    res3.setUrl("https://spring.io/guides");
    res3.setProvider("Spring.io");
    res3.setEstimatedMinutes(60);
    res3.setSortOrder(1);
    res3.setActive(true);
    learningResourceRepository.save(res3);
  }

  private void seedAnnouncement() {
    Announcement announcement = new Announcement();
    announcement.setTitle("Welcome to Campus Coders!");
    announcement.setMessage("Explore learning paths, track your daily check-in streak, and solve the Problem of the Day.");
    announcement.setCategory(AnnouncementCategory.PLATFORM_UPDATE);
    announcement.setActionLabel("Browse Paths");
    announcement.setActionUrl("/paths");
    announcement.setActive(true);
    announcementRepository.save(announcement);
  }

  private void seedCodingProblemsAndDailyChallenge() {
    List<CodingProblem> problems = List.of(
        createProblem("Two Sum", "LeetCode", "https://leetcode.com/problems/two-sum/", DifficultyLevel.BEGINNER, "Array, Hash Table"),
        createProblem("Valid Anagram", "LeetCode", "https://leetcode.com/problems/valid-anagram/", DifficultyLevel.BEGINNER, "String, Hash Table"),
        createProblem("Reverse Linked List", "LeetCode", "https://leetcode.com/problems/reverse-linked-list/", DifficultyLevel.BEGINNER, "Linked List, Recursion"),
        createProblem("Binary Search", "LeetCode", "https://leetcode.com/problems/binary-search/", DifficultyLevel.BEGINNER, "Array, Binary Search"),
        createProblem("Contains Duplicate", "LeetCode", "https://leetcode.com/problems/contains-duplicate/", DifficultyLevel.BEGINNER, "Array, Hash Table"),
        createProblem("Best Time to Buy and Sell Stock", "LeetCode", "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/", DifficultyLevel.BEGINNER, "Array, Dynamic Programming"),
        createProblem("Valid Parentheses", "LeetCode", "https://leetcode.com/problems/valid-parentheses/", DifficultyLevel.BEGINNER, "String, Stack"),
        createProblem("Merge Two Sorted Lists", "LeetCode", "https://leetcode.com/problems/merge-two-sorted-lists/", DifficultyLevel.BEGINNER, "Linked List, Recursion"),
        createProblem("Maximum Subarray", "LeetCode", "https://leetcode.com/problems/maximum-subarray/", DifficultyLevel.INTERMEDIATE, "Array, Divide and Conquer"),
        createProblem("Reverse String", "LeetCode", "https://leetcode.com/problems/reverse-string/", DifficultyLevel.BEGINNER, "Two Pointers, String")
    );

    List<CodingProblem> savedProblems = codingProblemRepository.saveAll(problems);

    LocalDate today = LocalDate.now(ZoneOffset.UTC);
    if (!dailyChallengeRepository.existsByChallengeDateAndActiveTrue(today) && !savedProblems.isEmpty()) {
      DailyChallenge todayChallenge = new DailyChallenge();
      todayChallenge.setCodingProblem(savedProblems.get(0));
      todayChallenge.setChallengeDate(today);
      todayChallenge.setXpReward(15);
      todayChallenge.setActive(true);
      dailyChallengeRepository.save(todayChallenge);
    }
  }

  private void seedDiscussionCategoriesAndPosts() {
    DiscussionCategory catJava = createCategory("Java", "java", "Core Java 21, OOP, Collections, and JVM topics", "#F59E0B", "coffee", 1);
    DiscussionCategory catPython = createCategory("Python", "python", "Python 3 syntax, Django, FastAPI, and data scripting", "#3B82F6", "terminal", 2);
    DiscussionCategory catDsa = createCategory("Data Structures & Algorithms", "dsa", "LeetCode problems, dynamic programming, trees, and sorting algorithms", "#10B981", "cpu", 3);
    DiscussionCategory catWeb = createCategory("Web Development", "web-development", "HTML, CSS, React, RESTful APIs, and full-stack architecture", "#8B5CF6", "globe", 4);
    DiscussionCategory catCareer = createCategory("Career Advice", "career-advice", "Resume reviews, internship preparation, and placement tips", "#EC4899", "briefcase", 5);
    DiscussionCategory catGeneral = createCategory("General", "general", "General tech discussions, platform feedback, and community chat", "#6B7280", "message-square", 6);

    discussionCategoryRepository.saveAll(List.of(catJava, catPython, catDsa, catWeb, catCareer, catGeneral));

    if (discussionPostRepository.count() == 0) {
      User firstUser = userRepository.findAll().stream().findFirst().orElse(null);
      if (firstUser == null) {
        return;
      }

      DiscussionPost post1 = new DiscussionPost();
      post1.setAuthor(firstUser);
      post1.setCategory(catJava);
      post1.setTitle("What is the difference between Comparable and Comparator in Java?");
      post1.setContent("I'm confused about when to use Comparable vs Comparator in Java 21 collections. Could someone explain with clear code examples?");
      post1.setTags("java,collections,sorting");
      post1.setFeatured(true);
      post1.setClosed(false);
      post1.setActive(true);
      DiscussionPost savedPost1 = discussionPostRepository.save(post1);

      DiscussionReply reply1 = new DiscussionReply();
      reply1.setPost(savedPost1);
      reply1.setAuthor(firstUser);
      reply1.setContent("Comparable is implemented by the class itself via compareTo(). Comparator is external via compare() and useful for multiple custom sorting orders.");
      reply1.setAcceptedAnswer(true);
      reply1.setActive(true);
      discussionReplyRepository.save(reply1);

      DiscussionPost post2 = new DiscussionPost();
      post2.setAuthor(firstUser);
      post2.setCategory(catCareer);
      post2.setTitle("How to prepare for Java Backend Developer Internship interviews?");
      post2.setContent("Share your best tips on preparing core Java, Spring Boot REST APIs, SQL indexing, and Data Structures for campus placements.");
      post2.setTags("interview,backend,career");
      post2.setFeatured(false);
      post2.setClosed(false);
      post2.setActive(true);
      discussionPostRepository.save(post2);
    }
  }

  private DiscussionCategory createCategory(String name, String slug, String description, String color, String iconName, Integer sortOrder) {
    DiscussionCategory category = new DiscussionCategory();
    category.setName(name);
    category.setSlug(slug);
    category.setDescription(description);
    category.setColor(color);
    category.setIconName(iconName);
    category.setSortOrder(sortOrder);
    category.setActive(true);
    return category;
  }

  private CodingProblem createProblem(String title, String platform, String url, DifficultyLevel diff, String tags) {
    CodingProblem problem = new CodingProblem();
    problem.setTitle(title);
    problem.setPlatform(platform);
    problem.setProblemUrl(url);
    problem.setDifficulty(diff);
    problem.setTags(tags);
    problem.setActive(true);
    return problem;
  }
}
