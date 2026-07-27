package com.campuscoders.backend.auth;

import com.campuscoders.backend.user.Role;

import lombok.Data;

@Data
public class CurrentUserResponse {

  // Returned by /api/auth/me to rebuild frontend user state from a valid token.
  private Long id;
  private String fullName;
  private String email;
  private Role role;
}