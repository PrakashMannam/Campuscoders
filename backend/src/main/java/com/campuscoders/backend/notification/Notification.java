package com.campuscoders.backend.notification;

import java.time.LocalDateTime;

import com.campuscoders.backend.user.User;

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
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "notifications")
public class Notification {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NotNull
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "recipient_user_id", nullable = false)
  private User recipient;

  @NotBlank
  @Column(nullable = false)
  private String title;

  @NotBlank
  @Column(nullable = false, length = 1000)
  private String message;

  @NotNull
  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private NotificationType type;

  @Column(name = "target_url", length = 1000)
  private String targetUrl;

  @Column(name = "read_status", nullable = false)
  private Boolean readStatus = false;

  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @PrePersist
  void onCreate() {
    this.createdAt = LocalDateTime.now();
  }
}