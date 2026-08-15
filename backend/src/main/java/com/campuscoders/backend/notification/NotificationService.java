package com.campuscoders.backend.notification;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.campuscoders.backend.common.dto.PageResponse;
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

  // Fetch paginated notifications for current user with optional readStatus filtering at DB level.
  @Transactional(readOnly = true)
  public PageResponse<NotificationResponse> getCurrentUserNotifications(String email, Boolean readStatus, Pageable pageable) {
    User user = findUserByEmail(email);

    Page<Notification> page = notificationRepository.findUserNotifications(user.getId(), readStatus, pageable);
    List<NotificationResponse> mapped = page.getContent().stream()
        .map(this::toResponse)
        .toList();
    return PageResponse.from(page, mapped);
  }

  @Transactional
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

  // Security check: Verify the notification recipient matches the authenticated user before allowing read status update.
  @Transactional
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

  // Bulk update all unread notifications for a user in a single transactional batch.
  @Transactional
  public void markAllAsRead(String email) {
    User user = findUserByEmail(email);
    List<Notification> notifications = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(user.getId());

    notifications.forEach(notification -> notification.setReadStatus(true));
    notificationRepository.saveAll(notifications);
  }

  // Used by DashboardService to display unread badge count on the user UI.
  @Transactional(readOnly = true)
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