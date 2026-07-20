package com.campuscoders.backend.auth;

import org.springframework.web.bind.annotation.RestController;

import com.campuscoders.backend.user.User;
import com.campuscoders.backend.user.repository.UserRepository;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;



@RestController
@RequestMapping("/api/auth")
public class AuthController {
  
  private AuthService authService;

  public AuthController(UserRepository userRepository, AuthService authService) {
    this.authService = authService;
  }

  @PostMapping("/register")
  public AuthResponse register(@Valid @RequestBody RegisterRequest request) {      
      return authService.register(request);
  }
  
}
