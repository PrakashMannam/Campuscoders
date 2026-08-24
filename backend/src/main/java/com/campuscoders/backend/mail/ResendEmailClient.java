package com.campuscoders.backend.mail;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;

/**
 * Sends transactional email via Resend HTTPS API (works on Railway Hobby; SMTP does not).
 */
@Service
public class ResendEmailClient {

  private static final Logger log = LoggerFactory.getLogger(ResendEmailClient.class);
  private static final String RESEND_URL = "https://api.resend.com/emails";

  private final String apiKey;
  private final String from;
  private final RestClient restClient;

  public ResendEmailClient(
      @Value("${campuscoders.resend.api-key:}") String apiKey,
      @Value("${campuscoders.mail.from:}") String from) {
    this.apiKey = apiKey == null ? "" : apiKey.trim();
    this.from = from == null ? "" : from.trim();
    this.restClient = RestClient.create();
  }

  public boolean isConfigured() {
    return StringUtils.hasText(apiKey) && StringUtils.hasText(from);
  }

  public void send(String toEmail, String subject, String plainText, String html) {
    if (!isConfigured()) {
      throw new IllegalStateException("Resend is not configured (RESEND_API_KEY and MAIL_FROM required).");
    }

    Map<String, Object> body = Map.of(
        "from", from,
        "to", List.of(toEmail),
        "subject", subject,
        "text", plainText,
        "html", html);

    try {
      restClient.post()
          .uri(RESEND_URL)
          .contentType(MediaType.APPLICATION_JSON)
          .header("Authorization", "Bearer " + apiKey)
          .body(body)
          .retrieve()
          .toBodilessEntity();
      log.info("Resend accepted email to {}", toEmail);
    } catch (Exception ex) {
      log.error("Resend send failed: {}", ex.getMessage());
      throw new IllegalStateException("Could not send email via Resend: " + ex.getMessage(), ex);
    }
  }
}
