package com.campuscoders.backend.discussion;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Dynamic, admin-manageable entity representing a discussion topic or category.
@Entity
@Table(name = "discussion_categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DiscussionCategory {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NotBlank
  @Column(nullable = false)
  private String name;

  // URL-friendly slug used for frontend route filtering (e.g. ?categorySlug=java-21).
  @NotBlank
  @Column(nullable = false, unique = true)
  private String slug;

  @Column(length = 1000)
  private String description;

  // Hex color code (e.g. #F59E0B) for frontend badge rendering.
  private String color;

  @Column(name = "icon_name")
  private String iconName;

  // Controls display ordering in frontend sidebar views.
  @Column(name = "sort_order")
  private Integer sortOrder = 0;

  // Soft-deactivation flag: Categories are soft-deleted with active = false to preserve post historical integrity.
  @Column(nullable = false)
  private Boolean active = true;

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt;

  @Column(name = "updated_at")
  private Instant updatedAt;

  @PrePersist
  protected void onCreate() {
    Instant now = Instant.now();
    this.createdAt = now;
    this.updatedAt = now;
  }

  @PreUpdate
  protected void onUpdate() {
    this.updatedAt = Instant.now();
  }
}
