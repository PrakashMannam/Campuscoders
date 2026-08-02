package com.campuscoders.backend.user;

import java.time.LocalDateTime;

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
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@Entity
@Table(name = "users")
public class User {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NotBlank
  @Column(name = "full_name", nullable = false)
  private String fullName;

  // Email is the unique login identifier for each account.
  @Email
  @NotBlank
  @Column(nullable = false, unique = true)
  private String email;

  // Stored as a BCrypt hash, never as the raw password from the request.
  @NotBlank
  @Column(nullable = false)
  private String password;

  @NotNull
  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private Role role;

  @NotNull
  @Column(nullable = false)
  private Boolean enabled = true;

  @Column(name = "university")
  private String university;

  @Column(name = "bio", length = 1000)
  private String bio;

  @Column(name = "leetcode_url", length = 500)
  private String leetcodeUrl;

  @Column(name = "geeksforgeeks_url", length = 500)
  private String geeksforgeeksUrl;

  @Column(name = "github_url", length = 500)
  private String githubUrl;

  @Column(name = "linkedin_url", length = 500)
  private String linkedinUrl;

  @Column(name = "avatar_url", length = 1000)
  private String avatarUrl;

  @NotNull
  @Column(name = "public_profile_visible", nullable = false)
  private Boolean publicProfileVisible = true;

  @NotNull
  @Column(name = "email_digests", nullable = false)
  private Boolean emailDigests = true;

  @NotNull
  @Column(name = "push_notifications", nullable = false)
  private Boolean pushNotifications = true;

  @NotNull
  @Column(name = "discussion_mentions", nullable = false)
  private Boolean discussionMentions = true;

  @Column(name = "created_at")
  private LocalDateTime createdAt;

  @Column(name = "updated_at")
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