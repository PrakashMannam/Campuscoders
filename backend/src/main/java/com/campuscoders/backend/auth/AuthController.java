package com.campuscoders.backend.auth;

import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

//Auth Controller
@RestController
@RequestMapping("/api/auth")
public class AuthController {
  
  private final AuthService authService;

  public AuthController(AuthService authService) {
    this.authService = authService;
  }

  //Register Endpoint
  @PostMapping("/register")
  public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
    return authService.register(request);
  }
  
  //Login Endpoint
  @PostMapping("/login")
  public AuthResponse login(@Valid @RequestBody LoginRequest request) {
    return authService.login(request);
  }
  
}
