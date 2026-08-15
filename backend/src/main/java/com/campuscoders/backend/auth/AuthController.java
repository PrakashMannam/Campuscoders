package com.campuscoders.backend.auth;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.campuscoders.backend.auth.dto.ForgotPasswordRequest;
import com.campuscoders.backend.auth.dto.MessageResponse;
import com.campuscoders.backend.auth.dto.ResetPasswordRequest;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

  private final AuthService authService;

  public AuthController(AuthService authService) {
    this.authService = authService;
  }

  // Public Endpoint: Creates a new student account and returns a signed JWT token so the user is immediately logged in.
  @PostMapping("/register")
  public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
    return authService.register(request);
  }

  // Public Endpoint: Validates email and BCrypt password hash before issuing a signed JWT token.
  @PostMapping("/login")
  public AuthResponse login(@Valid @RequestBody LoginRequest request) {
    return authService.login(request);
  }

  // Protected Endpoint: Extracts user email from JWT claims via Authentication context to fetch current profile summary.
  @GetMapping("/me")
  public CurrentUserResponse me(Authentication authentication) {
    return authService.getCurrentUser(authentication.getName());
  }

  @PostMapping("/forgot-password")
  public MessageResponse forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
    return authService.forgotPassword(request);
  }

  @PostMapping("/reset-password")
  public MessageResponse resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
    return authService.resetPassword(request);
  }
}
