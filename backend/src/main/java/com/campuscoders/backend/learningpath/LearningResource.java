package com.campuscoders.backend.learningpath;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "learning_resources")
public class LearningResource {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NotBlank
  @Column(nullable = false)
  private String title;

  @Column(length = 1000)
  private String description;

  @NotNull
  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private ResourceType type;

  @NotNull
  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private DifficultyLevel difficulty;

  @NotBlank
  @Column(nullable = false, length = 1000)
  private String url;

  private String provider;

  @Column(name = "thumbnail_url", length = 1000)
  private String thumbnailUrl;

  @Column(name = "estimated_minutes")
  private Integer estimatedMinutes;

  // Controls the order resources appear inside a topic.
  @Column(name = "sort_order")
  private Integer sortOrder;

  @NotNull
  @Column(nullable = false)
  private Boolean active = true;

  // Many resources belong to one topic.
  @NotNull
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "topic_id", nullable = false)
  private Topic topic;

  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Column(name = "updated_at", nullable = false)
  private LocalDateTime updatedAt;

  @PrePersist
  void onCreate() {
    LocalDateTime now = LocalDateTime.now();
    this.createdAt = now;
    this.updatedAt = now;
  }

  @PreUpdate
  void onUpdate() {
    this.updatedAt = LocalDateTime.now();
  }
}