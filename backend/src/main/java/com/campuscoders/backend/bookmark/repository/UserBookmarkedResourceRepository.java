package com.campuscoders.backend.bookmark.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.campuscoders.backend.bookmark.UserBookmarkedResource;

public interface UserBookmarkedResourceRepository extends JpaRepository<UserBookmarkedResource, Long> {
    Optional<UserBookmarkedResource> findByUserIdAndResourceId(Long userId, Long resourceId);
    List<UserBookmarkedResource> findByUserId(Long userId);
}
