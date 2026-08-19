package com.campuscoders.backend.discussion.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.campuscoders.backend.discussion.DiscussionReply;

public interface DiscussionReplyRepository extends JpaRepository<DiscussionReply, Long> {

  List<DiscussionReply> findByPostIdAndActiveTrueOrderByCreatedAtAsc(Long postId);

  List<DiscussionReply> findByPostIdOrderByCreatedAtAsc(Long postId);

  long countByPostIdAndActiveTrue(Long postId);

  Optional<DiscussionReply> findByPostIdAndAcceptedAnswerTrue(Long postId);

  @org.springframework.data.jpa.repository.Query("SELECT r.author.id, r.author.fullName, r.author.avatarUrl, COUNT(r) as repliesCount FROM DiscussionReply r WHERE r.active = true GROUP BY r.author.id, r.author.fullName, r.author.avatarUrl ORDER BY repliesCount DESC")
  List<Object[]> findTopContributors(org.springframework.data.domain.Pageable pageable);
}
