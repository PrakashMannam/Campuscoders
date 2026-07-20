package com.campuscoders.backend.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegisterRequest {
  
  @NotBlank
  private String fullName;

  @NotBlank
  @Email
  private String email;

  @NotBlank
  private String password;
}
