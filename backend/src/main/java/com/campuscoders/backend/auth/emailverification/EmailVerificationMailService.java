package com.campuscoders.backend.auth.emailverification;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import jakarta.mail.internet.MimeMessage;

@Service
public class EmailVerificationMailService {

  private static final Logger log = LoggerFactory.getLogger(EmailVerificationMailService.class);

  private final JavaMailSender mailSender;
  private final String mailHost;
  private final String from;

  public EmailVerificationMailService(
      JavaMailSender mailSender,
      @Value("${spring.mail.host:}") String mailHost,
      @Value("${campuscoders.mail.from:}") String from) {
    this.mailSender = mailSender;
    this.mailHost = mailHost == null ? "" : mailHost.trim();
    this.from = from == null ? "" : from.trim();
  }

  public boolean isConfigured() {
    return StringUtils.hasText(mailHost) && StringUtils.hasText(from);
  }

  public void sendVerificationCode(String toEmail, String rawCode) {
    if (!isConfigured()) {
      log.warn("Verification email not sent: MAIL_HOST and MAIL_FROM are required.");
      return;
    }

    try {
      MimeMessage mimeMessage = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
      helper.setFrom(from);
      helper.setTo(toEmail);
      helper.setSubject("Your Campus Coders verification code");
      helper.setText(
          EmailVerificationMailTemplates.plainText(rawCode),
          EmailVerificationMailTemplates.html(rawCode));
      mailSender.send(mimeMessage);
    } catch (Exception ex) {
      log.error("Failed to send verification email: {}", ex.getMessage());
      throw new IllegalStateException("Could not send verification email");
    }
  }
}
