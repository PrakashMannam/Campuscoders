package com.campuscoders.backend.auth.emailverification;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.campuscoders.backend.user.User;

/**
 * Persists hashed OTPs in their own transaction so the row commits before mail is sent
 * (and before a calling login method throws FORBIDDEN).
 */
@Service
public class EmailVerificationCodeService {

  private static final long OTP_EXPIRY_MINUTES = 10;
  private static final SecureRandom SECURE_RANDOM = new SecureRandom();

  private final EmailVerificationCodeRepository emailVerificationCodeRepository;
  private final PasswordEncoder passwordEncoder;

  public EmailVerificationCodeService(
      EmailVerificationCodeRepository emailVerificationCodeRepository,
      PasswordEncoder passwordEncoder) {
    this.emailVerificationCodeRepository = emailVerificationCodeRepository;
    this.passwordEncoder = passwordEncoder;
  }

  /**
   * Invalidates prior unused codes, stores a new hashed OTP, returns the raw code for emailing.
   */
  @Transactional(propagation = Propagation.REQUIRES_NEW)
  public String issueRawCode(User user) {
    emailVerificationCodeRepository.findByUserIdAndUsedFalse(user.getId())
        .forEach(code -> {
          code.setUsed(true);
          emailVerificationCodeRepository.save(code);
        });

    String rawCode = String.format("%06d", SECURE_RANDOM.nextInt(1_000_000));

    EmailVerificationCode entity = new EmailVerificationCode();
    entity.setUser(user);
    entity.setCodeHash(passwordEncoder.encode(rawCode));
    entity.setExpiresAt(Instant.now().plus(OTP_EXPIRY_MINUTES, ChronoUnit.MINUTES));
    entity.setUsed(false);
    entity.setAttemptCount(0);
    emailVerificationCodeRepository.save(entity);

    return rawCode;
  }
}
