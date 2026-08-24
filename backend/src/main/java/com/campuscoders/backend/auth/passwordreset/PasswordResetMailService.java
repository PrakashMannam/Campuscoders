package com.campuscoders.backend.auth.passwordreset;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.campuscoders.backend.mail.ResendEmailClient;

import jakarta.mail.internet.MimeMessage;

@Service
public class PasswordResetMailService {

  private static final Logger log = LoggerFactory.getLogger(PasswordResetMailService.class);

  private final JavaMailSender mailSender;
  private final ResendEmailClient resendEmailClient;
  private final String mailHost;
  private final String from;
  private final String frontendBaseUrl;

  public PasswordResetMailService(
      JavaMailSender mailSender,
      ResendEmailClient resendEmailClient,
      @Value("${spring.mail.host:}") String mailHost,
      @Value("${campuscoders.mail.from:}") String from,
      @Value("${campuscoders.frontend-base-url:http://localhost:3000}") String frontendBaseUrl) {
    this.mailSender = mailSender;
    this.resendEmailClient = resendEmailClient;
    this.mailHost = mailHost == null ? "" : mailHost.trim();
    this.from = from == null ? "" : from.trim();
    this.frontendBaseUrl = trimSlash(frontendBaseUrl);
  }

  public boolean isConfigured() {
    return resendEmailClient.isConfigured()
        || (StringUtils.hasText(mailHost) && StringUtils.hasText(from));
  }

  public void sendResetLink(String toEmail, String rawToken) {
    if (!isConfigured()) {
      log.warn("Password reset email not sent: configure RESEND_API_KEY+MAIL_FROM or MAIL_HOST+MAIL_FROM.");
      return;
    }

    String link = frontendBaseUrl + "/reset-password?token=" + rawToken;
    String subject = "Reset your Campus Coders password";
    String plain = PasswordResetMailTemplates.plainText(link);
    String html = PasswordResetMailTemplates.html(link);

    if (resendEmailClient.isConfigured()) {
      try {
        resendEmailClient.send(toEmail, subject, plain, html);
      } catch (Exception ex) {
        log.error("Failed to send password reset email via Resend: {}", ex.getMessage());
      }
      return;
    }

    try {
      MimeMessage mimeMessage = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
      helper.setFrom(from);
      helper.setTo(toEmail);
      helper.setSubject(subject);
      helper.setText(plain, html);
      mailSender.send(mimeMessage);
    } catch (Exception ex) {
      log.error("Failed to send password reset email: {}", ex.getMessage());
    }
  }

  static String trimSlash(String url) {
    if (url == null || url.isBlank()) {
      return "http://localhost:3000";
    }
    return url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
  }
}
