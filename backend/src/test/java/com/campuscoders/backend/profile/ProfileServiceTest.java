package com.campuscoders.backend.profile;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import com.campuscoders.backend.profile.dto.ChangePasswordRequest;
import com.campuscoders.backend.profile.dto.ProfileResponse;
import com.campuscoders.backend.profile.dto.PublicProfileResponse;
import com.campuscoders.backend.profile.dto.UpdateProfileRequest;
import com.campuscoders.backend.user.User;
import com.campuscoders.backend.user.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class ProfileServiceTest {

  @Mock
  private UserRepository userRepository;

  @Mock
  private PasswordEncoder passwordEncoder;

  @Mock
  private LeetCodeCalendarService leetCodeCalendarService;

  @Mock
  private GitHubCalendarService gitHubCalendarService;

  @InjectMocks
  private ProfileService profileService;

  @Test
  void getCurrentProfile_userExists_shouldReturnProfile() {
    User user = new User();
    user.setId(1L);
    user.setFullName("Prakash");
    user.setEmail("prakash@campus.com");

    when(userRepository.findByEmail("prakash@campus.com")).thenReturn(Optional.of(user));

    ProfileResponse response = profileService.getCurrentProfile("prakash@campus.com");

    assertNotNull(response);
    assertEquals("Prakash", response.fullName());
    assertEquals("prakash@campus.com", response.email());
  }

  @Test
  void getPublicProfile_profileVisible_shouldReturnPublicProfile() {
    User user = new User();
    user.setId(1L);
    user.setFullName("Prakash");
    user.setPublicProfileVisible(true);

    when(userRepository.findById(1L)).thenReturn(Optional.of(user));

    PublicProfileResponse response = profileService.getPublicProfile(1L);

    assertNotNull(response);
    assertEquals("Prakash", response.fullName());
  }

  @Test
  void getPublicProfile_profileHidden_shouldThrowNotFoundException() {
    User user = new User();
    user.setId(1L);
    user.setPublicProfileVisible(false);

    when(userRepository.findById(1L)).thenReturn(Optional.of(user));

    assertThrows(ResponseStatusException.class, () -> profileService.getPublicProfile(1L));
  }

  @Test
  void updateCurrentProfile_shouldUpdateFields() {
    User user = new User();
    user.setEmail("prakash@campus.com");

    UpdateProfileRequest req = new UpdateProfileRequest(
        "Prakash M",
        "Stanford",
        "Bio",
        "https://leetcode.com/u/prakash",
        "https://geeksforgeeks.org/user/prakash",
        "https://github.com/prakash",
        "https://linkedin.com/in/prakash",
        "https://prakash.dev",
        "https://cdn.example.com/avatar.jpg");

    when(userRepository.findByEmail("prakash@campus.com")).thenReturn(Optional.of(user));
    when(userRepository.save(any(User.class))).thenReturn(user);

    ProfileResponse response = profileService.updateCurrentProfile("prakash@campus.com", req);

    assertNotNull(response);
    assertEquals("Prakash M", response.fullName());
    assertEquals("Stanford", response.university());
  }

  @Test
  void changePassword_correctCurrentPassword_shouldUpdatePassword() {
    User user = new User();
    user.setEmail("prakash@campus.com");
    user.setPassword("old-hash");

    ChangePasswordRequest req = new ChangePasswordRequest("oldSecret", "newSecret123");

    when(userRepository.findByEmail("prakash@campus.com")).thenReturn(Optional.of(user));
    when(passwordEncoder.matches("oldSecret", "old-hash")).thenReturn(true);
    when(passwordEncoder.encode("newSecret123")).thenReturn("new-hash");

    profileService.changePassword("prakash@campus.com", req);

    assertEquals("new-hash", user.getPassword());
    verify(userRepository).save(user);
  }

  @Test
  void changePassword_wrongCurrentPassword_shouldThrowException() {
    User user = new User();
    user.setEmail("prakash@campus.com");
    user.setPassword("old-hash");

    ChangePasswordRequest req = new ChangePasswordRequest("wrongSecret", "newSecret123");

    when(userRepository.findByEmail("prakash@campus.com")).thenReturn(Optional.of(user));
    when(passwordEncoder.matches("wrongSecret", "old-hash")).thenReturn(false);

    assertThrows(ResponseStatusException.class, () -> profileService.changePassword("prakash@campus.com", req));
  }
}
