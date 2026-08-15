package com.campuscoders.backend.auth.passwordreset;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
  Optional<PasswordResetToken> findByToken(String token);

  Optional<PasswordResetToken> findByTokenAndUsedFalse(String token);

  List<PasswordResetToken> findByUserIdAndUsedFalse(Long userId);
}
