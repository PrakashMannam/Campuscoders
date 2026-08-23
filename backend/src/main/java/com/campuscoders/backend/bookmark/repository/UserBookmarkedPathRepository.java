package com.campuscoders.backend.bookmark.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.campuscoders.backend.bookmark.UserBookmarkedPath;

public interface UserBookmarkedPathRepository extends JpaRepository<UserBookmarkedPath, Long> {
    Optional<UserBookmarkedPath> findByUserIdAndLearningPathId(Long userId, Long pathId);
    List<UserBookmarkedPath> findByUserId(Long userId);
}
