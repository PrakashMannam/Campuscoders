package com.campuscoders.backend.auth;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;

class RegisterRequestValidationTest {

  private Validator validator;

  @BeforeEach
  void setUp() {
    validator = Validation.buildDefaultValidatorFactory().getValidator();
  }

  @Test
  void passwordShorterThanSixCharacters_shouldFailValidation() {
    RegisterRequest request = validRequest();
    request.setPassword("12345");

    Set<ConstraintViolation<RegisterRequest>> violations = validator.validate(request);

    assertFalse(violations.isEmpty());
    assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("password")));
  }

  @Test
  void passwordOfSixCharacters_shouldPassValidation() {
    RegisterRequest request = validRequest();
    request.setPassword("123456");

    Set<ConstraintViolation<RegisterRequest>> violations = validator.validate(request);

    assertTrue(violations.isEmpty());
  }

  private RegisterRequest validRequest() {
    RegisterRequest request = new RegisterRequest();
    request.setFullName("Prakash");
    request.setEmail("prakash@campus.com");
    request.setPassword("secret123");
    return request;
  }
}
