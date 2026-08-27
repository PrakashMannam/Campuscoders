package com.campuscoders.backend.bookmark.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.campuscoders.backend.bookmark.UserBookmarkedTopic;

public interface UserBookmarkedTopicRepository extends JpaRepository<UserBookmarkedTopic, Long> {
    Optional<UserBookmarkedTopic> findByUserIdAndTopicId(Long userId, Long topicId);
    List<UserBookmarkedTopic> findByUserId(Long userId);

    void deleteByTopicId(Long topicId);

    void deleteByTopicLearningPathId(Long learningPathId);
}
