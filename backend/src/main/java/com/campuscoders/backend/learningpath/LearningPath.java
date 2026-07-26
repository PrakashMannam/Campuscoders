package com.campuscoders.backend.learningpath;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
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
@Table(name = "learning_paths")
public class LearningPath {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NotBlank
  @Column(nullable = false)
  private String title;

  @NotBlank
  @Column(nullable = false, unique = true)
  private String slug;

  @Column(length = 1000)
  private String description;

  @Column(name = "short_description", length = 500)
  private String shortDescription;

  @Column(name = "icon_name")
  private String iconName;

  private String category;

  @NotNull
  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private DifficultyLevel difficulty;

  @Column(name = "estimated_hours")
  private Integer estimatedHours;

  @NotNull
  @Column(nullable = false)
  private Boolean active = true;

  @OneToMany(mappedBy = "learningPath", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<Topic> topics = new ArrayList<>();

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
