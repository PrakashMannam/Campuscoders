package com.campuscoders.backend.auth.emailverification;

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
public class EmailVerificationMailService {

  private static final Logger log = LoggerFactory.getLogger(EmailVerificationMailService.class);

  private final JavaMailSender mailSender;
  private final ResendEmailClient resendEmailClient;
  private final String mailHost;
  private final String from;

  public EmailVerificationMailService(
      JavaMailSender mailSender,
      ResendEmailClient resendEmailClient,
      @Value("${spring.mail.host:}") String mailHost,
      @Value("${campuscoders.mail.from:}") String from) {
    this.mailSender = mailSender;
    this.resendEmailClient = resendEmailClient;
    this.mailHost = mailHost == null ? "" : mailHost.trim();
    this.from = from == null ? "" : from.trim();
  }

  public boolean isConfigured() {
    return resendEmailClient.isConfigured()
        || (StringUtils.hasText(mailHost) && StringUtils.hasText(from));
  }

  public void sendVerificationCode(String toEmail, String rawCode) {
    if (!isConfigured()) {
      log.warn("Verification email not sent: configure RESEND_API_KEY+MAIL_FROM or MAIL_HOST+MAIL_FROM.");
      return;
    }

    String subject = "Your Campus Coders verification code";
    String plain = EmailVerificationMailTemplates.plainText(rawCode);
    String html = EmailVerificationMailTemplates.html(rawCode);

    if (resendEmailClient.isConfigured()) {
      resendEmailClient.send(toEmail, subject, plain, html);
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
      log.error("Failed to send verification email via SMTP: {}", ex.getMessage());
      throw new IllegalStateException(
          "Email delivery is unavailable on this host (SMTP blocked). "
              + "Use RESEND_API_KEY or clear MAIL_HOST for auto-verify.",
          ex);
    }
  }
}
