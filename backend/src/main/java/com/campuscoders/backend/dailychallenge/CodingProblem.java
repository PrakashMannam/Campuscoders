package com.campuscoders.backend.dailychallenge;

import java.time.Instant;

import com.campuscoders.backend.learningpath.DifficultyLevel;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// We store problem metadata (title, platform, problemUrl, tags) rather than full problem statements or test cases.
// This keeps database storage light and links out to external platforms like LeetCode or HackerRank.
@Entity
@Table(name = "coding_problems")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CodingProblem {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String title;

  @Column(nullable = false)
  private String platform;

  @Column(name = "problem_url", nullable = false)
  private String problemUrl;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private DifficultyLevel difficulty;

  private String tags;

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
