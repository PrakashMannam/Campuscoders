package com.campuscoders.backend.checkin;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.campuscoders.backend.user.User;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "check_ins", uniqueConstraints = @UniqueConstraint(columnNames = { "user_id", "check_in_date" }))
public class CheckIn {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NotNull
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @NotNull
  @Column(name = "check_in_date", nullable = false)
  private LocalDate checkInDate;

  @NotNull
  @Column(name = "xp_awarded", nullable = false)
  private Integer xpAwarded;

  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @PrePersist
  void onCreate() {
    this.createdAt = LocalDateTime.now();
  }
}