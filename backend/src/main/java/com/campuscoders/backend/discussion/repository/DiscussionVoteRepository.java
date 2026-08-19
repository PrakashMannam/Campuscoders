package com.campuscoders.backend.discussion.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.campuscoders.backend.discussion.DiscussionVote;

public interface DiscussionVoteRepository extends JpaRepository<DiscussionVote, Long> {

  Optional<DiscussionVote> findByUserIdAndPostId(Long userId, Long postId);

}
