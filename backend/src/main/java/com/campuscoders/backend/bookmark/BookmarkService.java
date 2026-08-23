package com.campuscoders.backend.bookmark;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.campuscoders.backend.bookmark.repository.UserBookmarkedPathRepository;
import com.campuscoders.backend.bookmark.repository.UserBookmarkedResourceRepository;
import com.campuscoders.backend.bookmark.repository.UserBookmarkedTopicRepository;
import com.campuscoders.backend.dashboard.dto.UserBookmarksResponse;
import com.campuscoders.backend.user.User;
import com.campuscoders.backend.user.repository.UserRepository;

@Service
public class BookmarkService {

    private final UserBookmarkedPathRepository pathRepository;
    private final UserBookmarkedTopicRepository topicRepository;
    private final UserBookmarkedResourceRepository resourceRepository;
    private final UserRepository userRepository;

    public BookmarkService(
            UserBookmarkedPathRepository pathRepository,
            UserBookmarkedTopicRepository topicRepository,
            UserBookmarkedResourceRepository resourceRepository,
            UserRepository userRepository) {
        this.pathRepository = pathRepository;
        this.topicRepository = topicRepository;
        this.resourceRepository = resourceRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public UserBookmarksResponse getUserBookmarks(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        List<Long> pathIds = pathRepository.findByUserId(user.getId()).stream()
                .map(bookmark -> bookmark.getLearningPath().getId())
                .toList();

        List<Long> topicIds = topicRepository.findByUserId(user.getId()).stream()
                .map(bookmark -> bookmark.getTopic().getId())
                .toList();

        List<Long> resourceIds = resourceRepository.findByUserId(user.getId()).stream()
                .map(bookmark -> bookmark.getResource().getId())
                .toList();

        return UserBookmarksResponse.builder()
                .bookmarkedPathIds(pathIds)
                .bookmarkedTopicIds(topicIds)
                .bookmarkedResourceIds(resourceIds)
                .build();
    }
}
