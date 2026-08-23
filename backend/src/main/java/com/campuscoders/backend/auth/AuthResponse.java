package com.campuscoders.backend.auth;

import com.campuscoders.backend.user.Role;

import lombok.Data;

@Data
public class AuthResponse {

  // JWT used by the frontend in Authorization: Bearer <token>.
  private String token;

  // Safe user summary returned after login/register.
  private String email;
  private String fullName;
  private Role role;
  private Boolean emailVerified;
  private Boolean requiresEmailVerification;
}