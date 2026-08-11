package com.campuscoders.backend.discussion.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.campuscoders.backend.discussion.DiscussionPost;

public interface DiscussionPostRepository extends JpaRepository<DiscussionPost, Long> {

  List<DiscussionPost> findByActiveTrueOrderByCreatedAtDesc();

  Optional<DiscussionPost> findByIdAndActiveTrue(Long id);

  List<DiscussionPost> findAllByOrderByCreatedAtDesc();
}
