package com.campuscoders.backend.admin;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.campuscoders.backend.admin.dto.AdminUserResponse;
import com.campuscoders.backend.exception.CustomException;
import com.campuscoders.backend.user.Role;
import com.campuscoders.backend.user.User;
import com.campuscoders.backend.user.repository.UserRepository;

@Service
public class AdminUserService {

  private final UserRepository userRepository;

  public AdminUserService(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  // Stream-based user listing supporting optional filters by Role, Enabled state, and partial search string.
  @Transactional(readOnly = true)
  public List<AdminUserResponse> getUsers(Role role, Boolean enabled, String search) {
    String query = (search != null) ? search.trim().toLowerCase() : "";

    return userRepository.findAll().stream()
        .filter(user -> role == null || user.getRole() == role)
        .filter(user -> enabled == null || user.getEnabled().equals(enabled))
        .filter(user -> query.isEmpty()
            || (user.getFullName() != null && user.getFullName().toLowerCase().contains(query))
            || (user.getEmail() != null && user.getEmail().toLowerCase().contains(query)))
        .map(this::toAdminUserResponse)
        .toList();
  }

  // Fetches single user detail for administrative review.
  @Transactional(readOnly = true)
  public AdminUserResponse getUserById(Long userId) {
    User user = findUserById(userId);
    return toAdminUserResponse(user);
  }

  // Activates a disabled user account.
  @Transactional
  public AdminUserResponse activateUser(Long userId) {
    User user = findUserById(userId);
    user.setEnabled(true);
    return toAdminUserResponse(userRepository.save(user));
  }

  // Deactivates a user account.
  // Self-Deactivation Guard: Prevents an admin from accidentally deactivating their own logged-in account.
  @Transactional
  public AdminUserResponse deactivateUser(Long userId, String currentAdminEmail) {
    User user = findUserById(userId);

    if (user.getEmail().equalsIgnoreCase(currentAdminEmail)) {
      throw new CustomException("Administrators cannot deactivate their own active account", HttpStatus.BAD_REQUEST);
    }

    user.setEnabled(false);
    return toAdminUserResponse(userRepository.save(user));
  }

  // Updates user role (STUDENT <-> ADMIN).
  @Transactional
  public AdminUserResponse updateUserRole(Long userId, Role newRole) {
    if (newRole == null) {
      throw new CustomException("User role must not be null", HttpStatus.BAD_REQUEST);
    }

    User user = findUserById(userId);
    user.setRole(newRole);
    return toAdminUserResponse(userRepository.save(user));
  }

  // Helper method finding user by ID or throwing 404 NOT_FOUND.
  private User findUserById(Long userId) {
    return userRepository.findById(userId)
        .orElseThrow(() -> new CustomException("User not found with ID: " + userId, HttpStatus.NOT_FOUND));
  }

  // Maps User entity to AdminUserResponse DTO, intentionally omitting password hashes.
  private AdminUserResponse toAdminUserResponse(User user) {
    return new AdminUserResponse(
        user.getId(),
        user.getFullName(),
        user.getEmail(),
        user.getRole(),
        user.getEnabled(),
        user.getUniversity(),
        user.getBio(),
        user.getTotalXp(),
        user.getDailyStreak(),
        user.getProblemsSolved(),
        user.getCreatedAt(),
        user.getUpdatedAt());
  }
}
