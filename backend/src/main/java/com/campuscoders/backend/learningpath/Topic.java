package com.campuscoders.backend.learningpath;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
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
@Table(name = "topics")
public class Topic {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NotBlank
  @Column(nullable = false)
  private String title;

  // URL-friendly unique name, for example: oop or spring-security.
  @NotBlank
  @Column(nullable = false, unique = true)
  private String slug;

  @Column(length = 1000)
  private String description;

  @Column(name = "estimated_minutes")
  private Integer estimatedMinutes;

  // Controls the order topics appear inside a learning path.
  @Column(name = "sort_order")
  private Integer sortOrder;

  @NotNull
  @Column(nullable = false)
  private Boolean active = true;

  // Many topics belong to one learning path.
  @NotNull
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "learning_path_id", nullable = false)
  private LearningPath learningPath;

  // A topic owns many resources, such as videos, PDFs, articles, and practice links.
  @OneToMany(mappedBy = "topic", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<LearningResource> resources = new ArrayList<>();

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