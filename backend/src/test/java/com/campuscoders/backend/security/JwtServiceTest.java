package com.campuscoders.backend.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.campuscoders.backend.user.Role;
import com.campuscoders.backend.user.User;

class JwtServiceTest {

  private JwtService jwtService;

  @BeforeEach
  void setUp() {
    jwtService = new JwtService(
        "campus-coders-secret-key-campus-coders-secret-key",
        86400000L);
  }

  @Test
  void generateToken_and_extractEmail_shouldWorkCorrectly() {
    User user = new User();
    user.setEmail("prakash@campus.com");
    user.setRole(Role.STUDENT);

    String token = jwtService.generateToken(user);

    assertNotNull(token);
    String extractedEmail = jwtService.extractEmail(token);
    assertEquals("prakash@campus.com", extractedEmail);
  }

  @Test
  void validateToken_validTokenAndUser_shouldReturnTrue() {
    User user = new User();
    user.setEmail("prakash@campus.com");
    user.setRole(Role.STUDENT);

    String token = jwtService.generateToken(user);

    boolean isValid = jwtService.validateToken(token, user);
    assertTrue(isValid);
  }
}
