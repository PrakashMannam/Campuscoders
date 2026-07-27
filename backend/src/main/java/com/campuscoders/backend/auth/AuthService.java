package com.campuscoders.backend.auth;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.campuscoders.backend.security.JwtService;
import com.campuscoders.backend.user.Role;
import com.campuscoders.backend.user.User;
import com.campuscoders.backend.user.repository.UserRepository;

@Service
public class AuthService {

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;

  public AuthService(
      UserRepository userRepository,
      PasswordEncoder passwordEncoder,
      JwtService jwtService) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
  }

  public AuthResponse register(RegisterRequest registerRequest) {
    // Email is the login identity, so duplicate accounts are blocked early.
    if (userRepository.existsByEmail(registerRequest.getEmail())) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
    }

    // Store only encoded passwords. Never save raw passwords in the database.
    User user = new User();
    user.setFullName(registerRequest.getFullName());
    user.setEmail(registerRequest.getEmail());
    user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
    user.setRole(Role.STUDENT);
    user.setEnabled(true);

    User savedUser = userRepository.save(user);

    return buildAuthResponse(savedUser);
  }

  public AuthResponse login(LoginRequest request) {
    User user = userRepository.findByEmail(request.getEmail())
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.UNAUTHORIZED,
            "Invalid email or password"));

    if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
      throw new ResponseStatusException(
          HttpStatus.UNAUTHORIZED,
          "Invalid email or password");
    }

    return buildAuthResponse(user);
  }

  public CurrentUserResponse getCurrentUser(String email) {
    User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "User not found"));

    CurrentUserResponse response = new CurrentUserResponse();
    response.setId(user.getId());
    response.setFullName(user.getFullName());
    response.setEmail(user.getEmail());
    response.setRole(user.getRole());

    return response;
  }

  // Auth responses include the JWT and safe user fields needed by the frontend.
  private AuthResponse buildAuthResponse(User user) {
    AuthResponse response = new AuthResponse();
    response.setToken(jwtService.generateToken(user));
    response.setEmail(user.getEmail());
    response.setFullName(user.getFullName());
    response.setRole(user.getRole());
    return response;
  }
}