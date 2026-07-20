package com.campuscoders.backend.auth;

import com.campuscoders.backend.user.Role;

import lombok.Data;

@Data
public class AuthResponse {
  
  private String token;

  private String email;

  private String fullName;

  private Role role;


}
