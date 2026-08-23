package com.campuscoders.backend.bookmark;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.campuscoders.backend.dashboard.dto.UserBookmarksResponse;

@RestController
@RequestMapping("/api/bookmarks")
public class BookmarkController {

    private final BookmarkService bookmarkService;

    public BookmarkController(BookmarkService bookmarkService) {
        this.bookmarkService = bookmarkService;
    }

    // Fetches all bookmarks (Paths, Topics, Resources) for the authenticated user
    @GetMapping
    public UserBookmarksResponse getUserBookmarks(Authentication authentication) {
        return bookmarkService.getUserBookmarks(authentication.getName());
    }
}
