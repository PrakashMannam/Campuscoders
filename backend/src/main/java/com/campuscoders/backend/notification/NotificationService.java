package com.campuscoders.backend.notification;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.campuscoders.backend.notification.dto.CreateNotificationRequest;
import com.campuscoders.backend.notification.dto.NotificationResponse;
import com.campuscoders.backend.notification.repository.NotificationRepository;
import com.campuscoders.backend.user.User;
import com.campuscoders.backend.user.repository.UserRepository;

@Service
public class NotificationService {

  private final NotificationRepository notificationRepository;
  private final UserRepository userRepository;

  public NotificationService(
      NotificationRepository notificationRepository,
      UserRepository userRepository) {
    this.notificationRepository = notificationRepository;
    this.userRepository = userRepository;
  }

  public List<NotificationResponse> getCurrentUserNotifications(String email) {
    User user = findUserByEmail(email);

    return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(user.getId())
        .stream()
        .map(this::toResponse)
        .toList();
  }

  public NotificationResponse createNotification(CreateNotificationRequest request) {
    User recipient = userRepository.findById(request.recipientUserId())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recipient not found"));

    Notification notification = new Notification();
    notification.setRecipient(recipient);
    notification.setTitle(request.title());
    notification.setMessage(request.message());
    notification.setType(request.type());
    notification.setTargetUrl(request.targetUrl());
    notification.setReadStatus(false);

    return toResponse(notificationRepository.save(notification));
  }

  public NotificationResponse markAsRead(String email, Long notificationId) {
    User user = findUserByEmail(email);
    Notification notification = notificationRepository.findById(notificationId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));

    if (!notification.getRecipient().getId().equals(user.getId())) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot update another user's notification");
    }

    notification.setReadStatus(true);
    return toResponse(notificationRepository.save(notification));
  }

  public void markAllAsRead(String email) {
    User user = findUserByEmail(email);
    List<Notification> notifications = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(user.getId());

    notifications.forEach(notification -> notification.setReadStatus(true));
    notificationRepository.saveAll(notifications);
  }

  public long countUnreadForUser(Long userId) {
    return notificationRepository.countByRecipientIdAndReadStatusFalse(userId);
  }

  private User findUserByEmail(String email) {
    return userRepository.findByEmail(email)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
  }

  private NotificationResponse toResponse(Notification notification) {
    return new NotificationResponse(
        notification.getId(),
        notification.getTitle(),
        notification.getMessage(),
        notification.getType(),
        notification.getTargetUrl(),
        notification.getReadStatus(),
        notification.getCreatedAt());
  }
}