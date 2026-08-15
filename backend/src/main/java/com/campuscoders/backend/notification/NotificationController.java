package com.campuscoders.backend.notification;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.campuscoders.backend.common.dto.PageResponse;
import com.campuscoders.backend.notification.dto.CreateNotificationRequest;
import com.campuscoders.backend.notification.dto.NotificationResponse;

import jakarta.validation.Valid;

@RestController
public class NotificationController {

  private final NotificationService notificationService;

  public NotificationController(NotificationService notificationService) {
    this.notificationService = notificationService;
  }

  @GetMapping("/api/notifications")
  public PageResponse<NotificationResponse> getCurrentUserNotifications(
      Authentication authentication,
      @RequestParam(required = false) Boolean readStatus,
      @PageableDefault(page = 0, size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
    return notificationService.getCurrentUserNotifications(authentication.getName(), readStatus, pageable);
  }

  @PatchMapping("/api/notifications/{notificationId}/read")
  public NotificationResponse markAsRead(
      Authentication authentication,
      @PathVariable Long notificationId) {
    return notificationService.markAsRead(authentication.getName(), notificationId);
  }

  @PatchMapping("/api/notifications/read-all")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void markAllAsRead(Authentication authentication) {
    notificationService.markAllAsRead(authentication.getName());
  }

  @PreAuthorize("hasRole('ADMIN')")
  @PostMapping("/api/admin/notifications")
  public NotificationResponse createNotification(@Valid @RequestBody CreateNotificationRequest request) {
    return notificationService.createNotification(request);
  }
}