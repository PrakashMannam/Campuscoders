package com.campuscoders.backend.notification.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.campuscoders.backend.notification.Notification;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

  List<Notification> findByRecipientIdOrderByCreatedAtDesc(Long recipientId);

  Page<Notification> findByRecipientId(Long recipientId, Pageable pageable);

  long countByRecipientIdAndReadStatusFalse(Long recipientId);
}