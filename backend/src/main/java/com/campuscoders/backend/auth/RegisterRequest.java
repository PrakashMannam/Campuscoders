package com.campuscoders.backend.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

  @NotBlank
  private String fullName;

  @Email
  @NotBlank
  private String email;

  @NotBlank
  @Size(min = 6)
  private String password;
}