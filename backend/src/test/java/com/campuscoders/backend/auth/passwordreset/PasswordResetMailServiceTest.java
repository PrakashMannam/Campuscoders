package com.campuscoders.backend.auth.passwordreset;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import org.junit.jupiter.api.Test;
import org.springframework.mail.javamail.JavaMailSender;

import jakarta.mail.internet.MimeMessage;

class PasswordResetMailServiceTest {

  @Test
  void trimSlash_removesTrailingSlash() {
    assertEquals("http://localhost:3000", PasswordResetMailService.trimSlash("http://localhost:3000/"));
    assertEquals("http://localhost:3000", PasswordResetMailService.trimSlash("http://localhost:3000"));
  }

  @Test
  void html_includesButtonAndEscapedLink() {
    String html = PasswordResetMailTemplates.html("http://localhost:3000/reset-password?token=abc");
    assertTrue(html.contains("Set new password"));
    assertTrue(html.contains("Campus Coders"));
    assertTrue(html.contains("http://localhost:3000/reset-password?token=abc"));
  }

  @Test
  void sendResetLink_skipsWhenHostOrFromMissing() {
    JavaMailSender sender = mock(JavaMailSender.class);
    PasswordResetMailService service = new PasswordResetMailService(sender, "", "", "http://localhost:3000");

    assertFalse(service.isConfigured());
    service.sendResetLink("a@b.com", "token-1");
    verify(sender, never()).send(any(MimeMessage.class));
  }
}
