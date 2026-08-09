package com.campuscoders.backend.admin;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.campuscoders.backend.admin.dto.AdminUserResponse;
import com.campuscoders.backend.admin.dto.UpdateUserRoleRequest;
import com.campuscoders.backend.user.Role;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

  private final AdminUserService adminUserService;

  public AdminUserController(AdminUserService adminUserService) {
    this.adminUserService = adminUserService;
  }

  // Lists users with optional filters for role, enabled state, and search query string.
  @GetMapping
  public List<AdminUserResponse> getUsers(
      @RequestParam(required = false) Role role,
      @RequestParam(required = false) Boolean enabled,
      @RequestParam(required = false) String search) {
    return adminUserService.getUsers(role, enabled, search);
  }

  // Fetches detailed information for a single user by ID.
  @GetMapping("/{userId}")
  public AdminUserResponse getUserById(@PathVariable Long userId) {
    return adminUserService.getUserById(userId);
  }

  // Enables a user account.
  @PatchMapping("/{userId}/activate")
  public AdminUserResponse activateUser(@PathVariable Long userId) {
    return adminUserService.activateUser(userId);
  }

  // Disables a user account, preventing further authentication until re-activated.
  @PatchMapping("/{userId}/deactivate")
  public AdminUserResponse deactivateUser(
      Authentication authentication,
      @PathVariable Long userId) {
    return adminUserService.deactivateUser(userId, authentication.getName());
  }

  // Updates a user's security role (e.g. STUDENT -> ADMIN or ADMIN -> STUDENT).
  @PatchMapping("/{userId}/role")
  public AdminUserResponse updateUserRole(
      @PathVariable Long userId,
      @Valid @RequestBody UpdateUserRoleRequest request) {
    return adminUserService.updateUserRole(userId, request.role());
  }
}
