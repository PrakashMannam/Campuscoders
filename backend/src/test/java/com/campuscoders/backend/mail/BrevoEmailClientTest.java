package com.campuscoders.backend.mail;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Map;

import org.junit.jupiter.api.Test;

class BrevoEmailClientTest {

  @Test
  void parseSender_supportsNameAndEmail() {
    Map<String, String> sender = BrevoEmailClient.parseSender("Campus Coders <team@gmail.com>");
    assertEquals("Campus Coders", sender.get("name"));
    assertEquals("team@gmail.com", sender.get("email"));
  }

  @Test
  void parseSender_supportsBareEmail() {
    Map<String, String> sender = BrevoEmailClient.parseSender("team@gmail.com");
    assertEquals("team@gmail.com", sender.get("email"));
    assertFalse(sender.containsKey("name"));
  }

  @Test
  void isConfigured_requiresKeyAndFrom() {
    assertFalse(new BrevoEmailClient("", "a@b.com").isConfigured());
    assertFalse(new BrevoEmailClient("key", "").isConfigured());
    assertTrue(new BrevoEmailClient("key", "a@b.com").isConfigured());
  }
}
