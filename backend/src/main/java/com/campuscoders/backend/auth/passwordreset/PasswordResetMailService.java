package com.campuscoders.backend.auth.passwordreset;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import jakarta.mail.internet.MimeMessage;

@Service
public class PasswordResetMailService {

  private static final Logger log = LoggerFactory.getLogger(PasswordResetMailService.class);

  private final JavaMailSender mailSender;
  private final String mailHost;
  private final String from;
  private final String frontendBaseUrl;

  public PasswordResetMailService(
      JavaMailSender mailSender,
      @Value("${spring.mail.host:}") String mailHost,
      @Value("${campuscoders.mail.from:}") String from,
      @Value("${campuscoders.frontend-base-url:http://localhost:3000}") String frontendBaseUrl) {
    this.mailSender = mailSender;
    this.mailHost = mailHost == null ? "" : mailHost.trim();
    this.from = from == null ? "" : from.trim();
    this.frontendBaseUrl = trimSlash(frontendBaseUrl);
  }

  public boolean isConfigured() {
    return StringUtils.hasText(mailHost) && StringUtils.hasText(from);
  }

  public void sendResetLink(String toEmail, String rawToken) {
    if (!isConfigured()) {
      log.warn("Password reset email not sent: MAIL_HOST and MAIL_FROM are required.");
      return;
    }

    String link = frontendBaseUrl + "/reset-password?token=" + rawToken;
    try {
      // MimeMessage enables sending rich emails (HTML, colors, links) instead of just plain text.
      MimeMessage mimeMessage = mailSender.createMimeMessage();
      
      // MimeMessageHelper is a Spring utility that simplifies setting email properties (to, from, subject) 
      // without needing to write complex low-level MIME protocol headers manually.
      MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
      helper.setFrom(from);
      helper.setTo(toEmail);
      helper.setSubject("Reset your Campus Coders password");
      
      // We pass both plain text and HTML. If the user's email client blocks HTML, 
      // they will automatically see the fallback plain text version.
      helper.setText(PasswordResetMailTemplates.plainText(link), PasswordResetMailTemplates.html(link));
      
      mailSender.send(mimeMessage);
    } catch (Exception ex) {
      // We catch the exception locally instead of throwing it to a Global Handler.
      // This prevents the entire transaction from rolling back (which would delete the reset token),
      // and silently fails so the user doesn't see a massive 500 error if the mail server is down.
      log.error("Failed to send password reset email: {}", ex.getMessage());
    }
  }

  // Removes the trailing slash from the frontend URL config (e.g., "http://localhost:3000/") 
  // to prevent double slashes when concatenating the reset token route (e.g., "//reset-password").
  static String trimSlash(String url) {
    if (url == null || url.isBlank()) {
      return "http://localhost:3000";
    }
    return url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
  }
}
