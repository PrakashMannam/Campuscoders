package com.campuscoders.backend.checkin;

import java.time.Instant;
import java.time.LocalDate;

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
// The database unique constraint guarantees a user can only have one check-in entry per day, 
// even if simultaneous requests hit the server.
@Table(name = "check_ins", uniqueConstraints = @UniqueConstraint(columnNames = { "user_id", "check_in_date" }))
public class CheckIn {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  // Lazy loading avoids retrieving the full user entity when querying check-in records.
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
  private Instant createdAt;

  // Automatically stamp UTC creation timestamp before saving to database.
  @PrePersist
  void onCreate() {
    this.createdAt = Instant.now();
  }
}