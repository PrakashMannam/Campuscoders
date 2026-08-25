package com.campuscoders.backend.mail;

import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;

/**
 * Sends transactional email via Brevo HTTPS API (works on Railway Hobby; SMTP does not).
 * No custom domain required — verify a single sender email (e.g. Gmail) in the Brevo dashboard.
 */
@Service
public class BrevoEmailClient {

  private static final Logger log = LoggerFactory.getLogger(BrevoEmailClient.class);
  private static final String BREVO_URL = "https://api.brevo.com/v3/smtp/email";
  private static final Pattern FROM_PATTERN =
      Pattern.compile("^(?:(.+?)\\s*)?<([^>]+)>$|^([^<>\\s]+@[^<>\\s]+)$");

  private final String apiKey;
  private final String fromRaw;
  private final RestClient restClient;

  public BrevoEmailClient(
      @Value("${campuscoders.brevo.api-key:}") String apiKey,
      @Value("${campuscoders.mail.from:}") String from) {
    this.apiKey = apiKey == null ? "" : apiKey.trim();
    this.fromRaw = from == null ? "" : from.trim();
    this.restClient = RestClient.create();
  }

  public boolean isConfigured() {
    return StringUtils.hasText(apiKey) && StringUtils.hasText(parseSenderEmail(fromRaw));
  }

  public void send(String toEmail, String subject, String plainText, String html) {
    if (!isConfigured()) {
      throw new IllegalStateException("Brevo is not configured (BREVO_API_KEY and MAIL_FROM required).");
    }

    Map<String, String> sender = parseSender(fromRaw);
    Map<String, Object> body = Map.of(
        "sender", sender,
        "to", List.of(Map.of("email", toEmail)),
        "subject", subject,
        "textContent", plainText,
        "htmlContent", html);

    try {
      restClient.post()
          .uri(BREVO_URL)
          .contentType(MediaType.APPLICATION_JSON)
          .header("api-key", apiKey)
          .body(body)
          .retrieve()
          .toBodilessEntity();
      log.info("Brevo accepted email to {}", toEmail);
    } catch (Exception ex) {
      log.error("Brevo send failed: {}", ex.getMessage());
      throw new IllegalStateException("Could not send email via Brevo: " + ex.getMessage(), ex);
    }
  }

  static Map<String, String> parseSender(String from) {
    String email = parseSenderEmail(from);
    String name = parseSenderName(from);
    if (StringUtils.hasText(name)) {
      return Map.of("name", name, "email", email);
    }
    return Map.of("email", email);
  }

  static String parseSenderEmail(String from) {
    if (!StringUtils.hasText(from)) {
      return "";
    }
    Matcher m = FROM_PATTERN.matcher(from.trim());
    if (!m.matches()) {
      return "";
    }
    if (m.group(2) != null) {
      return m.group(2).trim();
    }
    return m.group(3) == null ? "" : m.group(3).trim();
  }

  static String parseSenderName(String from) {
    if (!StringUtils.hasText(from)) {
      return "";
    }
    Matcher m = FROM_PATTERN.matcher(from.trim());
    if (!m.matches() || m.group(1) == null) {
      return "";
    }
    return m.group(1).trim().replaceAll("^\"|\"$", "");
  }
}
