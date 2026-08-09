package com.campuscoders.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.campuscoders.backend.announcement.Announcement;
import com.campuscoders.backend.announcement.AnnouncementCategory;
import com.campuscoders.backend.announcement.repository.AnnouncementRepository;
import com.campuscoders.backend.learningpath.DifficultyLevel;
import com.campuscoders.backend.learningpath.LearningPath;
import com.campuscoders.backend.learningpath.LearningResource;
import com.campuscoders.backend.learningpath.ResourceType;
import com.campuscoders.backend.learningpath.Topic;
import com.campuscoders.backend.learningpath.repository.LearningPathRepository;
import com.campuscoders.backend.learningpath.repository.LearningResourceRepository;
import com.campuscoders.backend.learningpath.repository.TopicRepository;
import com.campuscoders.backend.user.repository.UserRepository;

// @Component tells Spring Boot to instantiate this class automatically as a managed bean.
// Implementing CommandLineRunner causes Spring Boot to run the run() method automatically when Spring Boot boots up.
@Component
public class DataInitializer implements CommandLineRunner {

  private final UserRepository userRepository;
  private final LearningPathRepository learningPathRepository;
  private final TopicRepository topicRepository;
  private final LearningResourceRepository learningResourceRepository;
  private final AnnouncementRepository announcementRepository;

  public DataInitializer(
      UserRepository userRepository,
      LearningPathRepository learningPathRepository,
      TopicRepository topicRepository,
      LearningResourceRepository learningResourceRepository,
      AnnouncementRepository announcementRepository) {
    this.userRepository = userRepository;
    this.learningPathRepository = learningPathRepository;
    this.topicRepository = topicRepository;
    this.learningResourceRepository = learningResourceRepository;
    this.announcementRepository = announcementRepository;
  }

  // Executed automatically by Spring Boot right after application context startup.
  @Override
  @Transactional
  public void run(String... args) throws Exception {
    // 1️⃣ Idempotency Guard: Only seed sample catalog items if no learning paths exist in MySQL yet.
    if (learningPathRepository.count() > 0) {
      return;
    }

    // 2️⃣ Seed Sample Learning Path: Java Backend Development
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

    // 3️⃣ Seed Topic 1 under Java Path
    Topic oopTopic = new Topic();
    oopTopic.setLearningPath(savedJavaPath);
    oopTopic.setTitle("Java Core & OOP Principles");
    oopTopic.setSlug("java-core-oop");
    oopTopic.setDescription("Classes, Objects, Inheritance, Polymorphism, and Interfaces in Java 21.");
    oopTopic.setEstimatedMinutes(180);
    oopTopic.setSortOrder(1);
    oopTopic.setActive(true);
    Topic savedOopTopic = topicRepository.save(oopTopic);

    // Seed Resource 1 under Topic 1
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

    // Seed Resource 2 under Topic 1
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

    // 4️⃣ Seed Topic 2 under Java Path
    Topic springTopic = new Topic();
    springTopic.setLearningPath(savedJavaPath);
    springTopic.setTitle("Spring Boot & REST APIs");
    springTopic.setSlug("spring-boot-rest-apis");
    springTopic.setDescription("Building RESTful Web Services with Spring Boot, Spring Security, and MySQL.");
    springTopic.setEstimatedMinutes(240);
    springTopic.setSortOrder(2);
    springTopic.setActive(true);
    Topic savedSpringTopic = topicRepository.save(springTopic);

    // Seed Resource 3 under Topic 2
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

    // 5️⃣ Seed System Announcement if announcements table is empty
    if (announcementRepository.count() == 0) {
      Announcement announcement = new Announcement();
      announcement.setTitle("Welcome to Campus Coders!");
      announcement.setMessage("Explore learning paths, track your daily check-in streak, and mark resources as completed.");
      announcement.setCategory(AnnouncementCategory.PLATFORM_UPDATE);
      announcement.setActionLabel("Browse Paths");
      announcement.setActionUrl("/paths");
      announcement.setActive(true);
      announcementRepository.save(announcement);
    }
  }
}
