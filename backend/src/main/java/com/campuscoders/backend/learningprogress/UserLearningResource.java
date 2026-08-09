package com.campuscoders.backend.learningprogress;

import java.time.LocalDateTime;

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
@Table(name = "user_learning_resources", uniqueConstraints = @UniqueConstraint(columnNames = { "user_id", "resource_id" }))
public class UserLearningResource {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NotNull
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @NotNull
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "resource_id", nullable = false)
  private LearningResource resource;

  @Column(name = "completed_at", nullable = false, updatable = false)
  private LocalDateTime completedAt;

  @PrePersist
  void onCreate() {
    this.completedAt = LocalDateTime.now();
  }
}
