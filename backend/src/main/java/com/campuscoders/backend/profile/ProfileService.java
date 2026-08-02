package com.campuscoders.backend.profile;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.campuscoders.backend.profile.dto.ProfileResponse;
import com.campuscoders.backend.profile.dto.UpdateProfileRequest;
import com.campuscoders.backend.user.User;
import com.campuscoders.backend.user.repository.UserRepository;

@Service
public class ProfileService {

  private final UserRepository userRepository;

  public ProfileService(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  public ProfileResponse getCurrentProfile(String email) {
    User user = findUserByEmail(email);

    return toResponse(user);
  }

  public ProfileResponse updateCurrentProfile(String email, UpdateProfileRequest request) {
    User user = findUserByEmail(email);

    // Only profile-safe fields are editable here. Role, email, and password stay protected.
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

  private User findUserByEmail(String email) {
    return userRepository.findByEmail(email)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "User not found"));
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