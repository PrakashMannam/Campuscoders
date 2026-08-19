package com.campuscoders.backend.admin;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.campuscoders.backend.admin.dto.AdminUserResponse;
import com.campuscoders.backend.exception.CustomException;
import com.campuscoders.backend.user.Role;
import com.campuscoders.backend.user.User;
import com.campuscoders.backend.user.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class AdminUserServiceTest {

  @Mock
  private UserRepository userRepository;

  @InjectMocks
  private AdminUserService adminUserService;

  @Test
  void activateUser_shouldSetEnabledTrue() {
    User user = new User();
    user.setId(2L);
    user.setEnabled(false);

    when(userRepository.findById(2L)).thenReturn(Optional.of(user));
    when(userRepository.save(any(User.class))).thenReturn(user);

    AdminUserResponse response = adminUserService.activateUser(2L);

    assertNotNull(response);
    assertTrue(response.enabled());
  }

  @Test
  void deactivateUser_otherUser_shouldSetEnabledFalse() {
    User targetUser = new User();
    targetUser.setId(2L);
    targetUser.setEmail("target@campus.com");
    targetUser.setEnabled(true);

    when(userRepository.findById(2L)).thenReturn(Optional.of(targetUser));
    when(userRepository.save(any(User.class))).thenReturn(targetUser);

    AdminUserResponse response = adminUserService.deactivateUser(2L, "admin@campus.com");

    assertNotNull(response);
    assertFalse(response.enabled());
  }

  @Test
  void deactivateUser_selfDeactivationGuard_shouldThrowCustomException() {
    User adminUser = new User();
    adminUser.setId(1L);
    adminUser.setEmail("admin@campus.com");
    adminUser.setEnabled(true);

    when(userRepository.findById(1L)).thenReturn(Optional.of(adminUser));

    assertThrows(CustomException.class, () -> adminUserService.deactivateUser(1L, "admin@campus.com"));
  }

  @Test
  void updateUserRole_validRole_shouldUpdateRole() {
    User user = new User();
    user.setId(2L);
    user.setRole(Role.STUDENT);

    when(userRepository.findById(2L)).thenReturn(Optional.of(user));
    when(userRepository.save(any(User.class))).thenReturn(user);

    AdminUserResponse response = adminUserService.updateUserRole(2L, Role.ADMIN);

    assertNotNull(response);
    assertEquals(Role.ADMIN, response.role());
  }
}
