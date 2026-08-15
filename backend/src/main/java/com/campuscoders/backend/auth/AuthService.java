package com.campuscoders.backend.auth;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.campuscoders.backend.auth.dto.ForgotPasswordRequest;
import com.campuscoders.backend.auth.dto.MessageResponse;
import com.campuscoders.backend.auth.dto.ResetPasswordRequest;
import com.campuscoders.backend.auth.passwordreset.PasswordResetToken;
import com.campuscoders.backend.auth.passwordreset.PasswordResetTokenRepository;
import com.campuscoders.backend.security.JwtService;
import com.campuscoders.backend.user.Role;
import com.campuscoders.backend.user.User;
import com.campuscoders.backend.user.repository.UserRepository;

@Service
public class AuthService {

  private static final long RESET_TOKEN_EXPIRY_MINUTES = 15;

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;
  private final PasswordResetTokenRepository passwordResetTokenRepository;

  public AuthService(
      UserRepository userRepository,
      PasswordEncoder passwordEncoder,
      JwtService jwtService,
      PasswordResetTokenRepository passwordResetTokenRepository) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
    this.passwordResetTokenRepository = passwordResetTokenRepository;
  }

  public AuthResponse register(RegisterRequest registerRequest) {
    // Email is the login identity, so duplicate accounts are blocked early.
    if (userRepository.existsByEmail(registerRequest.getEmail())) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
    }

    // Store only encoded passwords. Never save raw passwords in the database.
    User user = new User();
    user.setFullName(registerRequest.getFullName());
    user.setEmail(registerRequest.getEmail());
    user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
    user.setRole(Role.STUDENT);
    user.setEnabled(true);

    User savedUser = userRepository.save(user);

    return buildAuthResponse(savedUser);
  }

  public AuthResponse login(LoginRequest request) {
    User user = userRepository.findByEmail(request.getEmail())
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.UNAUTHORIZED,
            "Invalid email or password"));

    if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
      throw new ResponseStatusException(
          HttpStatus.UNAUTHORIZED,
          "Invalid email or password");
    }

    return buildAuthResponse(user);
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

  // We return the same message whether the email exists or not, so attackers
  // cannot use this endpoint to discover registered accounts.
  @Transactional
  public MessageResponse forgotPassword(ForgotPasswordRequest request) {
    User user = userRepository.findByEmail(request.email()).orElse(null);

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

  // Auth responses include the JWT and safe user fields needed by the frontend.
  private AuthResponse buildAuthResponse(User user) {
    AuthResponse response = new AuthResponse();
    response.setToken(jwtService.generateToken(user));
    response.setEmail(user.getEmail());
    response.setFullName(user.getFullName());
    response.setRole(user.getRole());
    return response;
  }
}
