package com.campuscoders.backend.auth;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.campuscoders.backend.auth.dto.ForgotPasswordRequest;
import com.campuscoders.backend.auth.dto.MessageResponse;
import com.campuscoders.backend.auth.dto.ResendVerificationRequest;
import com.campuscoders.backend.auth.dto.ResetPasswordRequest;
import com.campuscoders.backend.auth.dto.VerifyEmailRequest;
import com.campuscoders.backend.auth.emailverification.DisposableEmailGuard;
import com.campuscoders.backend.auth.emailverification.EmailVerificationCode;
import com.campuscoders.backend.auth.emailverification.EmailVerificationCodeRepository;
import com.campuscoders.backend.auth.emailverification.EmailVerificationCodeService;
import com.campuscoders.backend.auth.emailverification.EmailVerificationMailService;
import com.campuscoders.backend.auth.passwordreset.PasswordResetMailService;
import com.campuscoders.backend.auth.passwordreset.PasswordResetToken;
import com.campuscoders.backend.auth.passwordreset.PasswordResetTokenRepository;
import com.campuscoders.backend.security.JwtService;
import com.campuscoders.backend.user.Role;
import com.campuscoders.backend.user.User;
import com.campuscoders.backend.user.repository.UserRepository;

@Service
public class AuthService {

  private static final Logger log = LoggerFactory.getLogger(AuthService.class);
  private static final long RESET_TOKEN_EXPIRY_MINUTES = 15;
  private static final int OTP_MAX_ATTEMPTS = 5;

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;
  private final PasswordResetTokenRepository passwordResetTokenRepository;
  private final PasswordResetMailService passwordResetMailService;
  private final EmailVerificationCodeRepository emailVerificationCodeRepository;
  private final EmailVerificationCodeService emailVerificationCodeService;
  private final EmailVerificationMailService emailVerificationMailService;
  private final DisposableEmailGuard disposableEmailGuard;

  public AuthService(
      UserRepository userRepository,
      PasswordEncoder passwordEncoder,
      JwtService jwtService,
      PasswordResetTokenRepository passwordResetTokenRepository,
      PasswordResetMailService passwordResetMailService,
      EmailVerificationCodeRepository emailVerificationCodeRepository,
      EmailVerificationCodeService emailVerificationCodeService,
      EmailVerificationMailService emailVerificationMailService,
      DisposableEmailGuard disposableEmailGuard) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
    this.passwordResetTokenRepository = passwordResetTokenRepository;
    this.passwordResetMailService = passwordResetMailService;
    this.emailVerificationCodeRepository = emailVerificationCodeRepository;
    this.emailVerificationCodeService = emailVerificationCodeService;
    this.emailVerificationMailService = emailVerificationMailService;
    this.disposableEmailGuard = disposableEmailGuard;
  }

  /**
   * Not class-transactional: user must be committed before OTP insert (REQUIRES_NEW),
   * or MySQL deadlocks on the users FK (lock wait timeout).
   */
  public AuthResponse register(RegisterRequest registerRequest) {
    String email = normalizeEmail(registerRequest.getEmail());
    disposableEmailGuard.rejectIfDisposable(email);

    if (userRepository.existsByEmail(email)) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
    }

    User user = new User();
    user.setFullName(registerRequest.getFullName().trim());
    user.setEmail(email);
    user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
    user.setRole(Role.STUDENT);
    user.setEnabled(true);

    boolean mailReady = emailVerificationMailService.isConfigured();
    user.setEmailVerified(!mailReady);

    User savedUser = userRepository.saveAndFlush(user);

    if (mailReady) {
      boolean mailSent = issueAndSendVerificationCode(savedUser);
      if (!mailSent && Boolean.TRUE.equals(savedUser.getEmailVerified())) {
        // SMTP unavailable — account was auto-verified as a fallback.
        return buildAuthResponse(savedUser);
      }
      AuthResponse pending = new AuthResponse();
      pending.setEmail(savedUser.getEmail());
      pending.setFullName(savedUser.getFullName());
      pending.setRole(savedUser.getRole());
      pending.setEmailVerified(false);
      pending.setRequiresEmailVerification(true);
      pending.setToken(null);
      return pending;
    }

    return buildAuthResponse(savedUser);
  }

  public AuthResponse login(LoginRequest request) {
    String email = normalizeEmail(request.getEmail());
    User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.UNAUTHORIZED,
            "Invalid email or password"));

    if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
      throw new ResponseStatusException(
          HttpStatus.UNAUTHORIZED,
          "Invalid email or password");
    }

    if (!Boolean.TRUE.equals(user.getEmailVerified()) && emailVerificationMailService.isConfigured()) {
      boolean mailSent = issueAndSendVerificationCode(user);
      if (mailSent) {
        throw new ResponseStatusException(
            HttpStatus.FORBIDDEN,
            "Please verify your email before signing in. Check your inbox for the code.");
      }
      // SMTP unavailable — account was auto-verified; continue to token issuance.
    }

    return buildAuthResponse(user);
  }

  @Transactional
  public AuthResponse verifyEmail(VerifyEmailRequest request) {
    String email = normalizeEmail(request.email());
    User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid verification request"));

    if (Boolean.TRUE.equals(user.getEmailVerified())) {
      return buildAuthResponse(user);
    }

    EmailVerificationCode latest = emailVerificationCodeRepository
        .findFirstByUserIdAndUsedFalseOrderByCreatedAtDesc(user.getId())
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.BAD_REQUEST,
            "No active verification code. Request a new one."));

    if (latest.getExpiresAt().isBefore(Instant.now())) {
      latest.setUsed(true);
      emailVerificationCodeRepository.save(latest);
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Verification code has expired");
    }

    if (latest.getAttemptCount() >= OTP_MAX_ATTEMPTS) {
      latest.setUsed(true);
      emailVerificationCodeRepository.save(latest);
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Too many attempts. Request a new code.");
    }

    String code = request.code() == null ? "" : request.code().trim();
    latest.setAttemptCount(latest.getAttemptCount() + 1);
    if (!passwordEncoder.matches(code, latest.getCodeHash())) {
      emailVerificationCodeRepository.save(latest);
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid verification code");
    }

    latest.setUsed(true);
    emailVerificationCodeRepository.save(latest);

    user.setEmailVerified(true);
    userRepository.save(user);

    return buildAuthResponse(user);
  }

  public MessageResponse resendVerification(ResendVerificationRequest request) {
    String email = normalizeEmail(request.email());
    User user = userRepository.findByEmail(email).orElse(null);

    String ok = "If an account needs verification, a new code has been sent.";

    if (user == null || Boolean.TRUE.equals(user.getEmailVerified())) {
      return new MessageResponse(ok);
    }

    if (!emailVerificationMailService.isConfigured()) {
      user.setEmailVerified(true);
      userRepository.save(user);
      return new MessageResponse("Email delivery is not configured locally. Your account was marked verified.");
    }

    issueAndSendVerificationCode(user);
    return new MessageResponse(ok);
  }

  public CurrentUserResponse getCurrentUser(String email) {
    User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "User not found"));

    CurrentUserResponse response = new CurrentUserResponse();
    response.setId(user.getId());
    response.setFullName(user.getFullName());
    response.setEmail(user.getEmail());
    response.setRole(user.getRole());

    return response;
  }

  @Transactional
  public MessageResponse forgotPassword(ForgotPasswordRequest request) {
    User user = userRepository.findByEmail(normalizeEmail(request.email())).orElse(null);

    if (user == null) {
      return new MessageResponse("If an account exists for this email, password reset instructions have been generated.");
    }

    passwordResetTokenRepository.findByUserIdAndUsedFalse(user.getId())
        .forEach(token -> token.setUsed(true));

    String rawToken = UUID.randomUUID().toString();

    PasswordResetToken passwordResetToken = new PasswordResetToken();
    passwordResetToken.setUser(user);
    passwordResetToken.setToken(rawToken);
    passwordResetToken.setExpiresAt(Instant.now().plus(RESET_TOKEN_EXPIRY_MINUTES, ChronoUnit.MINUTES));
    passwordResetToken.setUsed(false);

    passwordResetTokenRepository.save(passwordResetToken);
    passwordResetMailService.sendResetLink(user.getEmail(), rawToken);

    return new MessageResponse("If an account exists for this email, password reset instructions have been generated.");
  }

  @Transactional
  public MessageResponse resetPassword(ResetPasswordRequest request) {
    PasswordResetToken passwordResetToken = passwordResetTokenRepository.findByToken(request.token())
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.BAD_REQUEST,
            "Invalid password reset token"));

    if (Boolean.TRUE.equals(passwordResetToken.getUsed())) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST,
          "Password reset token has already been used");
    }

    if (passwordResetToken.getExpiresAt().isBefore(Instant.now())) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST,
          "Password reset token has expired");
    }

    User user = passwordResetToken.getUser();
    user.setPassword(passwordEncoder.encode(request.newPassword()));
    userRepository.save(user);

    passwordResetToken.setUsed(true);
    passwordResetTokenRepository.save(passwordResetToken);

    return new MessageResponse("Password reset successful");
  }

  /** @return true if the email was sent; false if delivery failed and the account was auto-verified */
  private boolean issueAndSendVerificationCode(User user) {
    String rawCode = emailVerificationCodeService.issueRawCode(user);
    try {
      emailVerificationMailService.sendVerificationCode(user.getEmail(), rawCode);
      return true;
    } catch (IllegalStateException ex) {
      // SMTP often blocked on Railway Hobby — fall back so signup still works.
      log.warn("Verification email failed for {}: {}. Auto-verifying account.", user.getEmail(), ex.getMessage());
      user.setEmailVerified(true);
      userRepository.save(user);
      return false;
    }
  }

  private AuthResponse buildAuthResponse(User user) {
    AuthResponse response = new AuthResponse();
    response.setToken(jwtService.generateToken(user));
    response.setEmail(user.getEmail());
    response.setFullName(user.getFullName());
    response.setRole(user.getRole());
    response.setEmailVerified(Boolean.TRUE.equals(user.getEmailVerified()));
    response.setRequiresEmailVerification(false);
    return response;
  }

  private static String normalizeEmail(String email) {
    return email == null ? "" : email.trim().toLowerCase();
  }
}
