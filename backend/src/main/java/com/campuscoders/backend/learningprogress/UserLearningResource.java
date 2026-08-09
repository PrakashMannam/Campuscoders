package com.campuscoders.backend.learningprogress;

import java.time.Instant;

import com.campuscoders.backend.learningpath.LearningResource;
import com.campuscoders.backend.user.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
// Unique constraint prevents a user from marking the exact same resource as completed multiple times, 
// protecting database integrity even during concurrent API requests.
@Table(name = "user_learning_resources", uniqueConstraints = @UniqueConstraint(columnNames = { "user_id", "resource_id" }))
public class UserLearningResource {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  // Lazy loading avoids fetching full User details on every progress lookup.
  @NotNull
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  // Lazy loading ensures we don't bring heavy resource content into memory unless requested.
  @NotNull
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "resource_id", nullable = false)
  private LearningResource resource;

  @Column(name = "completed_at", nullable = false, updatable = false)
  private Instant completedAt;

  // Automatically record UTC completion timestamp at entity creation time so callers don't need to pass dates manually.
  @PrePersist
  void onCreate() {
    this.completedAt = Instant.now();
  }
}
