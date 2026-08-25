package com.campuscoders.backend.config;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import com.campuscoders.backend.discussion.DiscussionCategory;
import com.campuscoders.backend.discussion.repository.DiscussionCategoryRepository;

/**
 * Ensures discussion categories exist in every environment (prod has no @Profile("dev") seed).
 */
@Component
@Order(2)
public class DiscussionCategoryBootstrap implements CommandLineRunner {

  private static final Logger log = LoggerFactory.getLogger(DiscussionCategoryBootstrap.class);

  private final DiscussionCategoryRepository discussionCategoryRepository;

  public DiscussionCategoryBootstrap(DiscussionCategoryRepository discussionCategoryRepository) {
    this.discussionCategoryRepository = discussionCategoryRepository;
  }

  @Override
  public void run(String... args) {
    if (discussionCategoryRepository.count() > 0) {
      return;
    }

    discussionCategoryRepository.saveAll(List.of(
        category("Interview Questions", "interview-questions",
            "Technical interview coding questions and logic puzzles", "#EF4444", "help-circle", 1),
        category("Interview Experience", "interview-experience",
            "Share your full interview journey and process", "#10B981", "briefcase", 2),
        category("Career & Compensation", "career-compensation",
            "Salary negotiations, resume reviews, and career advice", "#F59E0B", "trending-up", 3),
        category("Study Guides & Resources", "study-guides",
            "Roadmaps, cheat sheets, and course recommendations", "#3B82F6", "book-open", 4),
        category("Projects & Hackathons", "projects-hackathons",
            "Find teammates and showcase your work", "#8B5CF6", "star", 5),
        category("General Discussion", "general",
            "Casual tech talk and community chat", "#6B7280", "message-square", 6)));

    log.info("Seeded {} default discussion categories.", discussionCategoryRepository.count());
  }

  private static DiscussionCategory category(
      String name, String slug, String description, String color, String iconName, int sortOrder) {
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
}
