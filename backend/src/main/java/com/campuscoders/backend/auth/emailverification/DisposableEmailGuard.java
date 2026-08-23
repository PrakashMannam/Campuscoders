package com.campuscoders.backend.auth.emailverification;

import java.util.Locale;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

/**
 * Rejects common disposable / temporary inbox domains.
 * Real providers (Gmail, Outlook, Yahoo, college domains, etc.) are allowed.
 */
@Component
public class DisposableEmailGuard {

  private static final Set<String> BLOCKED = Set.of(
      "mailinator.com",
      "guerrillamail.com",
      "guerrillamailblock.com",
      "sharklasers.com",
      "grr.la",
      "guerrillamail.info",
      "guerrillamail.net",
      "guerrillamail.org",
      "10minutemail.com",
      "10minutemail.net",
      "tempmail.com",
      "temp-mail.org",
      "temp-mail.io",
      "tmpmail.org",
      "tmpmail.net",
      "throwawaymail.com",
      "yopmail.com",
      "yopmail.fr",
      "fakeinbox.com",
      "trashmail.com",
      "trashmail.me",
      "getnada.com",
      "emailondeck.com",
      "maildrop.cc",
      "dispostable.com",
      "mailnesia.com",
      "mintemail.com",
      "mytemp.email",
      "tempail.com",
      "tempr.email",
      "discard.email",
      "mailcatch.com",
      "moakt.com",
      "inboxkitten.com",
      "tempinbox.com",
      "mail-temp.com",
      "burnermail.io",
      "mailnull.com",
      "spamgourmet.com",
      "getairmail.com",
      "mailforspam.com");

  public void rejectIfDisposable(String email) {
    if (email == null || !email.contains("@")) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid email address");
    }
    String domain = email.substring(email.lastIndexOf('@') + 1).toLowerCase(Locale.ROOT).trim();
    if (domain.isEmpty()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid email address");
    }
    if (BLOCKED.contains(domain)) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST,
          "Temporary or disposable email addresses are not allowed. Use a real inbox.");
    }
  }
}
