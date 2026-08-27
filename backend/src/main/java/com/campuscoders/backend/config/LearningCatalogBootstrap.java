package com.campuscoders.backend.config;

import java.io.InputStream;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import com.campuscoders.backend.learningpath.DifficultyLevel;
import com.campuscoders.backend.learningpath.LearningPath;
import com.campuscoders.backend.learningpath.LearningResource;
import com.campuscoders.backend.learningpath.ResourceType;
import com.campuscoders.backend.learningpath.Topic;
import com.campuscoders.backend.learningpath.repository.LearningPathRepository;
import com.campuscoders.backend.learningpath.repository.LearningResourceRepository;
import com.campuscoders.backend.learningpath.repository.TopicRepository;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Idempotent seed of the curated learning catalog into any environment (incl. Railway prod).
 * Skips existing path/topic/resource rows; fills gaps on each boot when enabled.
 */
@Component
@Order(2)
public class LearningCatalogBootstrap implements CommandLineRunner {

  private static final Logger log = LoggerFactory.getLogger(LearningCatalogBootstrap.class);
  private static final String CATALOG_PATH = "catalog/curated-learning-catalog.json";

  private final LearningPathRepository learningPathRepository;
  private final TopicRepository topicRepository;
  private final LearningResourceRepository learningResourceRepository;
  private final ObjectMapper objectMapper;
  private final boolean seedEnabled;

  public LearningCatalogBootstrap(
      LearningPathRepository learningPathRepository,
      TopicRepository topicRepository,
      LearningResourceRepository learningResourceRepository,
      ObjectMapper objectMapper,
      @Value("${campuscoders.catalog.seed:true}") boolean seedEnabled) {
    this.learningPathRepository = learningPathRepository;
    this.topicRepository = topicRepository;
    this.learningResourceRepository = learningResourceRepository;
    this.objectMapper = objectMapper;
    this.seedEnabled = seedEnabled;
  }

  @Override
  public void run(String... args) throws Exception {
    if (!seedEnabled) {
      return;
    }

    List<CatalogEntry> catalog;
    try (InputStream in = new ClassPathResource(CATALOG_PATH).getInputStream()) {
      catalog = objectMapper.readValue(in, new TypeReference<List<CatalogEntry>>() {});
    }

    int pathsCreated = 0;
    int pathsUpdated = 0;
    int topicsCreated = 0;
    int resourcesCreated = 0;
    int deactivated = 0;

    for (CatalogEntry entry : catalog) {
      CatalogPath p = entry.path();
      if (p == null || p.slug() == null || p.slug().isBlank()) {
        continue;
      }

      LearningPath path =
          learningPathRepository
              .findBySlug(p.slug())
              .orElseGet(LearningPath::new);
      boolean createdPath = path.getId() == null;

      path.setTitle(p.title());
      path.setSlug(p.slug());
      path.setShortDescription(p.shortDescription());
      path.setDescription(p.description());
      path.setIconName(p.iconName());
      path.setCategory(p.category());
      path.setDifficulty(parseDifficulty(p.difficulty()));
      path.setEstimatedHours(p.estimatedHours());
      path.setActive(true);
      path = learningPathRepository.save(path);
      if (createdPath) {
        pathsCreated++;
      } else {
        pathsUpdated++;
      }

      deactivated += deactivateLegacyJunk(path.getId());

      CatalogTopic topicDef = entry.topic();
      if (topicDef == null || topicDef.slug() == null || topicDef.slug().isBlank()) {
        continue;
      }

      Topic topic =
          topicRepository
              .findBySlug(topicDef.slug())
              .orElseGet(Topic::new);
      boolean createdTopic = topic.getId() == null;
      topic.setTitle(topicDef.title());
      topic.setSlug(topicDef.slug());
      topic.setDescription(topicDef.description());
      topic.setEstimatedMinutes(topicDef.estimatedMinutes());
      topic.setSortOrder(topicDef.sortOrder() == null ? 1 : topicDef.sortOrder());
      topic.setActive(true);
      topic.setLearningPath(path);
      topic = topicRepository.save(topic);
      if (createdTopic) {
        topicsCreated++;
      }

      if (entry.resources() == null) {
        continue;
      }
      for (CatalogResource res : entry.resources()) {
        if (res == null || res.url() == null || res.url().isBlank()) {
          continue;
        }
        var existing = learningResourceRepository.findByTopicIdAndUrl(topic.getId(), res.url());
        if (existing.isPresent()) {
          LearningResource r = existing.get();
          if (Boolean.FALSE.equals(r.getActive())) {
            r.setActive(true);
            learningResourceRepository.save(r);
          }
          continue;
        }

        LearningResource resource = new LearningResource();
        resource.setTopic(topic);
        resource.setTitle(res.title());
        resource.setDescription(res.description());
        resource.setType(parseResourceType(res.type()));
        resource.setDifficulty(path.getDifficulty());
        resource.setUrl(res.url());
        resource.setProvider(res.provider());
        resource.setEstimatedMinutes(res.estimatedMinutes());
        resource.setSortOrder(res.sortOrder() == null ? 1 : res.sortOrder());
        resource.setActive(true);
        learningResourceRepository.save(resource);
        resourcesCreated++;
      }
    }

    log.info(
        "Curated catalog seed done: paths +{} ~{}, topics +{}, resources +{}, deactivated {}",
        pathsCreated,
        pathsUpdated,
        topicsCreated,
        resourcesCreated,
        deactivated);
  }

  private int deactivateLegacyJunk(Long pathId) {
    int count = 0;
    for (Topic t : topicRepository.findByLearningPathId(pathId)) {
      boolean junkTopic =
          t.getSlug() != null && t.getSlug().toLowerCase().contains("complete-masterclass");
      for (LearningResource r : learningResourceRepository.findByTopicId(t.getId())) {
        if (Boolean.FALSE.equals(r.getActive())) {
          continue;
        }
        String title = r.getTitle() == null ? "" : r.getTitle().toLowerCase();
        // Only Antigravity-era masterclass stubs — never curated "Full Course" YouTube titles.
        boolean junk =
            junkTopic || (Integer.valueOf(600).equals(r.getEstimatedMinutes()) && title.contains("masterclass"));
        if (junk) {
          r.setActive(false);
          learningResourceRepository.save(r);
          count++;
        }
      }
    }
    return count;
  }

  private static DifficultyLevel parseDifficulty(String raw) {
    if (raw == null || raw.isBlank()) {
      return DifficultyLevel.BEGINNER;
    }
    return DifficultyLevel.valueOf(raw.trim().toUpperCase());
  }

  private static ResourceType parseResourceType(String raw) {
    if (raw == null || raw.isBlank()) {
      return ResourceType.ARTICLE;
    }
    return ResourceType.valueOf(raw.trim().toUpperCase());
  }

  @JsonIgnoreProperties(ignoreUnknown = true)
  public record CatalogEntry(CatalogPath path, CatalogTopic topic, List<CatalogResource> resources) {}

  @JsonIgnoreProperties(ignoreUnknown = true)
  public record CatalogPath(
      String title,
      String slug,
      String category,
      String difficulty,
      Integer estimatedHours,
      String iconName,
      String shortDescription,
      String description) {}

  @JsonIgnoreProperties(ignoreUnknown = true)
  public record CatalogTopic(
      String title,
      String slug,
      String description,
      Integer estimatedMinutes,
      Integer sortOrder) {}

  @JsonIgnoreProperties(ignoreUnknown = true)
  public record CatalogResource(
      String title,
      String type,
      String url,
      String provider,
      Integer estimatedMinutes,
      Integer sortOrder,
      String description) {}
}
