package com.campuscoders.backend.discussion;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import com.campuscoders.backend.user.User;

import jakarta.persistence.CascadeType;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Entity representing a discussion thread or question created by a user.
@Entity
@Table(name = "discussion_posts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DiscussionPost {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NotNull
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "author_user_id", nullable = false)
  private User author;

  @NotNull
  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private DiscussionCategory category;

  @NotBlank
  @Column(nullable = false)
  private String title;

  @NotBlank
  @Column(nullable = false, length = 5000)
  private String content;

  // Stored as comma-separated tags (e.g. "spring,json,backend").
  private String tags;

  @Column(nullable = false)
  private Boolean featured = false;

  @Column(nullable = false)
  private Boolean closed = false;

  // Soft-delete flag: Posts are soft-deleted using active = false instead of physical deletion.
  @Column(nullable = false)
  private Boolean active = true;

  @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<DiscussionReply> replies = new ArrayList<>();

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
