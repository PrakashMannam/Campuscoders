package com.campuscoders.backend.profile;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.campuscoders.backend.profile.dto.ChangePasswordRequest;
import com.campuscoders.backend.profile.dto.ProfileResponse;
import com.campuscoders.backend.profile.dto.ProfileSettingsResponse;
import com.campuscoders.backend.profile.dto.PublicProfileResponse;
import com.campuscoders.backend.profile.dto.UpdateProfileRequest;
import com.campuscoders.backend.profile.dto.UpdateProfileSettingsRequest;
import com.campuscoders.backend.user.User;
import com.campuscoders.backend.user.repository.UserRepository;

@Service
public class ProfileService {

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;

  public ProfileService(
      UserRepository userRepository,
      PasswordEncoder passwordEncoder) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
  }

  @Transactional(readOnly = true)
  public ProfileResponse getCurrentProfile(String email) {
    User user = findUserByEmail(email);

    return toResponse(user);
  }

  // Privacy Rule: If a user has disabled public profile visibility, return NOT_FOUND to hide their information.
  @Transactional(readOnly = true)
  public PublicProfileResponse getPublicProfile(Long userId) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "User not found"));

    if (!Boolean.TRUE.equals(user.getPublicProfileVisible())) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found");
    }

    return toPublicResponse(user);
  }

  // Security Rule: Only profile-safe fields are editable here. Role, email, and password stay protected.
  @Transactional
  public ProfileResponse updateCurrentProfile(String email, UpdateProfileRequest request) {
    User user = findUserByEmail(email);

    user.setFullName(request.fullName());
    user.setUniversity(request.university());
    user.setBio(request.bio());
    user.setLeetcodeUrl(request.leetcodeUrl());
    user.setGeeksforgeeksUrl(request.geeksforgeeksUrl());
    user.setGithubUrl(request.githubUrl());
    user.setLinkedinUrl(request.linkedinUrl());
    user.setAvatarUrl(request.avatarUrl());

    User savedUser = userRepository.save(user);

    return toResponse(savedUser);
  }

  @Transactional(readOnly = true)
  public ProfileSettingsResponse getCurrentSettings(String email) {
    User user = findUserByEmail(email);

    return toSettingsResponse(user);
  }

  @Transactional
  public ProfileSettingsResponse updateCurrentSettings(
      String email,
      UpdateProfileSettingsRequest request) {
    User user = findUserByEmail(email);

    user.setPublicProfileVisible(request.publicProfileVisible());
    user.setEmailDigests(request.emailDigests());
    user.setPushNotifications(request.pushNotifications());
    user.setDiscussionMentions(request.discussionMentions());

    User savedUser = userRepository.save(user);

    return toSettingsResponse(savedUser);
  }

  // Security Check: Verify existing password with BCrypt before persisting the newly encoded password hash.
  @Transactional
  public void changePassword(String email, ChangePasswordRequest request) {
    User user = findUserByEmail(email);

    if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST,
          "Current password is incorrect");
    }

    user.setPassword(passwordEncoder.encode(request.newPassword()));
    userRepository.save(user);
  }

  private User findUserByEmail(String email) {
    return userRepository.findByEmail(email)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "User not found"));
  }

  private PublicProfileResponse toPublicResponse(User user) {
    return new PublicProfileResponse(
        user.getId(),
        user.getFullName(),
        user.getUniversity(),
        user.getBio(),
        user.getLeetcodeUrl(),
        user.getGeeksforgeeksUrl(),
        user.getGithubUrl(),
        user.getLinkedinUrl(),
        user.getAvatarUrl(),
        user.getTotalXp(),
        user.getDailyStreak(),
        user.getProblemsSolved());
  }

  private ProfileSettingsResponse toSettingsResponse(User user) {
    return new ProfileSettingsResponse(
        user.getPublicProfileVisible(),
        user.getEmailDigests(),
        user.getPushNotifications(),
        user.getDiscussionMentions());
  }

  private ProfileResponse toResponse(User user) {
    return new ProfileResponse(
        user.getId(),
        user.getFullName(),
        user.getEmail(),
        user.getRole(),
        user.getUniversity(),
        user.getBio(),
        user.getLeetcodeUrl(),
        user.getGeeksforgeeksUrl(),
        user.getGithubUrl(),
        user.getLinkedinUrl(),
        user.getAvatarUrl());
  }
}