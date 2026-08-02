package com.campuscoders.backend.profile;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.campuscoders.backend.profile.dto.ProfileResponse;
import com.campuscoders.backend.profile.dto.UpdateProfileRequest;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

  private final ProfileService profileService;

  public ProfileController(ProfileService profileService) {
    this.profileService = profileService;
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
}