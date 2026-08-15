package com.campuscoders.backend.notification.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.campuscoders.backend.notification.Notification;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

  List<Notification> findByRecipientIdOrderByCreatedAtDesc(Long recipientId);

  Page<Notification> findByRecipientId(Long recipientId, Pageable pageable);

  // Database-side filtering JPQL query for optional readStatus filter.
  @Query("SELECT n FROM Notification n " +
         "WHERE n.recipient.id = :recipientId " +
         "AND (:readStatus IS NULL OR n.readStatus = :readStatus)")
  Page<Notification> findUserNotifications(
      @Param("recipientId") Long recipientId,
      @Param("readStatus") Boolean readStatus,
      Pageable pageable);

  long countByRecipientIdAndReadStatusFalse(Long recipientId);
}