package com.campuscoders.backend.profile;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.campuscoders.backend.profile.dto.ChangePasswordRequest;
import com.campuscoders.backend.profile.dto.ProfileResponse;
import com.campuscoders.backend.profile.dto.ProfileSettingsResponse;
import com.campuscoders.backend.profile.dto.PublicProfileResponse;
import com.campuscoders.backend.profile.dto.UpdateProfileRequest;
import com.campuscoders.backend.profile.dto.UpdateProfileSettingsRequest;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

  private final ProfileService profileService;

  public ProfileController(ProfileService profileService) {
    this.profileService = profileService;
  }

  // Returns a public profile only when the user has enabled public visibility.
  @GetMapping("/public/{userId}")
  public PublicProfileResponse getPublicProfile(@PathVariable Long userId) {
    return profileService.getPublicProfile(userId);
  }

  // Returns the profile for the currently authenticated user.
  @GetMapping("/me")
  public ProfileResponse getCurrentProfile(Authentication authentication) {
    return profileService.getCurrentProfile(authentication.getName());
  }

  // Updates only profile-safe fields for the currently authenticated user.
  @PutMapping("/me")
  public ProfileResponse updateCurrentProfile(
      Authentication authentication,
      @Valid @RequestBody UpdateProfileRequest request) {
    return profileService.updateCurrentProfile(authentication.getName(), request);
  }

  // Returns account preference toggles for the settings page.
  @GetMapping("/me/settings")
  public ProfileSettingsResponse getCurrentSettings(Authentication authentication) {
    return profileService.getCurrentSettings(authentication.getName());
  }

  // Updates account preference toggles for the settings page.
  @PutMapping("/me/settings")
  public ProfileSettingsResponse updateCurrentSettings(
      Authentication authentication,
      @Valid @RequestBody UpdateProfileSettingsRequest request) {
    return profileService.updateCurrentSettings(authentication.getName(), request);
  }

  // Changes the current user's password after verifying the existing password.
  @PutMapping("/me/password")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void changePassword(
      Authentication authentication,
      @Valid @RequestBody ChangePasswordRequest request) {
    profileService.changePassword(authentication.getName(), request);
  }
}