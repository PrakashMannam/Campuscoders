package com.campuscoders.backend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import com.campuscoders.backend.user.Role;
import com.campuscoders.backend.user.User;
import com.campuscoders.backend.user.repository.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Creates or promotes a single ADMIN from env vars (safe for prod).
 * Set ADMIN_EMAIL + ADMIN_PASSWORD on Railway, redeploy once, then remove ADMIN_PASSWORD.
 */
@Component
@Order(1)
public class AdminBootstrap implements CommandLineRunner {

  private static final Logger log = LoggerFactory.getLogger(AdminBootstrap.class);

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final String adminEmail;
  private final String adminPassword;
  private final String adminFullName;

  public AdminBootstrap(
      UserRepository userRepository,
      PasswordEncoder passwordEncoder,
      @Value("${campuscoders.admin.email:}") String adminEmail,
      @Value("${campuscoders.admin.password:}") String adminPassword,
      @Value("${campuscoders.admin.full-name:Campus Admin}") String adminFullName) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.adminEmail = adminEmail == null ? "" : adminEmail.trim().toLowerCase();
    this.adminPassword = adminPassword == null ? "" : adminPassword;
    this.adminFullName = StringUtils.hasText(adminFullName) ? adminFullName.trim() : "Campus Admin";
  }

  @Override
  public void run(String... args) {
    if (!StringUtils.hasText(adminEmail) || !StringUtils.hasText(adminPassword)) {
      return;
    }

    User user = userRepository.findByEmail(adminEmail).orElseGet(User::new);
    boolean created = user.getId() == null;

    user.setEmail(adminEmail);
    user.setFullName(adminFullName);
    user.setPassword(passwordEncoder.encode(adminPassword));
    user.setRole(Role.ADMIN);
    user.setEnabled(true);
    user.setEmailVerified(true);

    userRepository.save(user);
    log.info(
        "Admin bootstrap {}: {} (role=ADMIN). Remove ADMIN_PASSWORD from Railway after first login.",
        created ? "created" : "updated",
        adminEmail);
  }
}
