package com.campuscoders.backend.auth;

import com.campuscoders.backend.user.Role;

import lombok.Data;

@Data
public class CurrentUserResponse {
  
  private Long id;
  private String fullName;
  private String email;
  private Role role;
}
