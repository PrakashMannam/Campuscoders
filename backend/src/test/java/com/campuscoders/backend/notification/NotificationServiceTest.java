package com.campuscoders.backend.notification;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import com.campuscoders.backend.notification.dto.CreateNotificationRequest;
import com.campuscoders.backend.notification.dto.NotificationResponse;
import com.campuscoders.backend.notification.repository.NotificationRepository;
import com.campuscoders.backend.user.User;
import com.campuscoders.backend.user.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

  @Mock
  private NotificationRepository notificationRepository;

  @Mock
  private UserRepository userRepository;

  @InjectMocks
  private NotificationService notificationService;

  @Test
  void createNotification_shouldSaveAndReturnResponse() {
    User recipient = new User();
    recipient.setId(1L);

    CreateNotificationRequest req = new CreateNotificationRequest(
        1L, "Welcome", "Welcome message", NotificationType.SYSTEM, "/dashboard");

    Notification notification = new Notification();
    notification.setRecipient(recipient);
    notification.setTitle("Welcome");

    when(userRepository.findById(1L)).thenReturn(Optional.of(recipient));
    when(notificationRepository.save(any(Notification.class))).thenReturn(notification);

    NotificationResponse res = notificationService.createNotification(req);

    assertNotNull(res);
    assertEquals("Welcome", res.title());
  }

  @Test
  void markAsRead_ownNotification_shouldSetReadStatusTrue() {
    User user = new User();
    user.setId(1L);

    Notification notification = new Notification();
    notification.setId(10L);
    notification.setRecipient(user);
    notification.setReadStatus(false);

    when(userRepository.findByEmail("student@campus.com")).thenReturn(Optional.of(user));
    when(notificationRepository.findById(10L)).thenReturn(Optional.of(notification));
    when(notificationRepository.save(any(Notification.class))).thenReturn(notification);

    NotificationResponse res = notificationService.markAsRead("student@campus.com", 10L);

    assertNotNull(res);
    assertTrue(notification.getReadStatus());
  }

  @Test
  void markAsRead_otherUserNotification_shouldThrowForbidden() {
    User user = new User();
    user.setId(1L);

    User otherUser = new User();
    otherUser.setId(2L);

    Notification notification = new Notification();
    notification.setId(10L);
    notification.setRecipient(otherUser);

    when(userRepository.findByEmail("student@campus.com")).thenReturn(Optional.of(user));
    when(notificationRepository.findById(10L)).thenReturn(Optional.of(notification));

    assertThrows(ResponseStatusException.class, () -> notificationService.markAsRead("student@campus.com", 10L));
  }

  @Test
  void markAllAsRead_shouldUpdateAllUserNotifications() {
    User user = new User();
    user.setId(1L);

    Notification n1 = new Notification();
    n1.setReadStatus(false);

    when(userRepository.findByEmail("student@campus.com")).thenReturn(Optional.of(user));
    when(notificationRepository.findByRecipientIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(n1));

    notificationService.markAllAsRead("student@campus.com");

    assertTrue(n1.getReadStatus());
    verify(notificationRepository).saveAll(List.of(n1));
  }
}
