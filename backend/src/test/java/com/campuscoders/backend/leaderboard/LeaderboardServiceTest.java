package com.campuscoders.backend.leaderboard;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;

import com.campuscoders.backend.common.dto.PageResponse;
import com.campuscoders.backend.leaderboard.dto.LeaderboardEntryResponse;
import com.campuscoders.backend.leaderboard.dto.MyLeaderboardResponse;
import com.campuscoders.backend.user.User;
import com.campuscoders.backend.user.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class LeaderboardServiceTest {

  @Mock
  private UserRepository userRepository;

  @InjectMocks
  private LeaderboardService leaderboardService;

  @Test
  void getLeaderboard_shouldReturnRankedList() {
    User u1 = new User();
    u1.setId(1L);
    u1.setFullName("User One");
    u1.setTotalXp(100);

    User u2 = new User();
    u2.setId(2L);
    u2.setFullName("User Two");
    u2.setTotalXp(50);

    when(userRepository.findLeaderboardUsers()).thenReturn(List.of(u1, u2));

    PageResponse<LeaderboardEntryResponse> response = leaderboardService.getLeaderboard(PageRequest.of(0, 10));

    assertNotNull(response);
    assertEquals(2, response.content().size());
    assertEquals(1, response.content().get(0).rank());
    assertEquals("User One", response.content().get(0).fullName());
    assertEquals(2, response.content().get(1).rank());
  }

  @Test
  void getTopLeaderboard_limitApplied_shouldReturnTopN() {
    User u1 = new User();
    u1.setId(1L);
    u1.setTotalXp(100);

    User u2 = new User();
    u2.setId(2L);
    u2.setTotalXp(50);

    when(userRepository.findLeaderboardUsers()).thenReturn(List.of(u1, u2));

    List<LeaderboardEntryResponse> top1 = leaderboardService.getTopLeaderboard(1);

    assertNotNull(top1);
    assertEquals(1, top1.size());
    assertEquals(1L, top1.get(0).userId());
  }

  @Test
  void getMyLeaderboardRank_userInRankedList_shouldReturnMyRank() {
    User u1 = new User();
    u1.setId(1L);
    u1.setEmail("user1@campus.com");
    u1.setFullName("User One");

    when(userRepository.findLeaderboardUsers()).thenReturn(List.of(u1));
    when(userRepository.findByEmail("user1@campus.com")).thenReturn(Optional.of(u1));

    MyLeaderboardResponse myRank = leaderboardService.getMyLeaderboardRank("user1@campus.com");

    assertNotNull(myRank);
    assertEquals(1, myRank.rank());
    assertEquals(1L, myRank.userId());
  }
}
