package com.campuscoders.backend.auth.emailverification;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface EmailVerificationCodeRepository extends JpaRepository<EmailVerificationCode, Long> {

  List<EmailVerificationCode> findByUserIdAndUsedFalse(Long userId);

  Optional<EmailVerificationCode> findFirstByUserIdAndUsedFalseOrderByCreatedAtDesc(Long userId);
}
