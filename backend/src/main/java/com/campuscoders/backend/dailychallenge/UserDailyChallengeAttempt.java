package com.campuscoders.backend.dailychallenge;

import java.time.Instant;

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
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Join table recording a student's completion of a specific daily challenge.
// Database unique constraint protects against duplicate XP awards even if concurrent requests arrive.
@Entity
@Table(
    name = "user_daily_challenge_attempts",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "daily_challenge_id"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserDailyChallengeAttempt {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "daily_challenge_id", nullable = false)
  private DailyChallenge dailyChallenge;

  @Column(name = "completed_at", nullable = false, updatable = false)
  private Instant completedAt;

  @Column(name = "xp_awarded", nullable = false)
  private Integer xpAwarded;

  @PrePersist
  protected void onCreate() {
    if (completedAt == null) {
      completedAt = Instant.now();
    }
  }
}
