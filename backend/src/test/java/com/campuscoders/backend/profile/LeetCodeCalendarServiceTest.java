package com.campuscoders.backend.profile;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import org.junit.jupiter.api.Test;

import com.campuscoders.backend.profile.LeetCodeCalendarService.ParsedProfile;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

class LeetCodeCalendarServiceTest {

  @Test
  void parseUsername_supportsCommonProfileUrls() {
    assertEquals("neetcode", LeetCodeCalendarService.parseUsername("https://leetcode.com/u/neetcode/"));
    assertEquals("neetcode", LeetCodeCalendarService.parseUsername("https://leetcode.com/neetcode"));
    assertEquals("neetcode", LeetCodeCalendarService.parseUsername("leetcode.com/u/neetcode"));
    assertEquals("neetcode", LeetCodeCalendarService.parseUsername("https://leetcode.com/u/neetcode/?source=share"));
    assertEquals("neetcode", LeetCodeCalendarService.parseUsername("neetcode"));
    assertEquals("neetcode", LeetCodeCalendarService.parseUsername("https://leetcode.cn/u/neetcode/"));
    assertNull(LeetCodeCalendarService.parseUsername(""));
    assertNull(LeetCodeCalendarService.parseUsername("https://leetcode.com/problemset/"));
  }

  @Test
  void parseProfile_usesChinaHostForCnUrls() {
    ParsedProfile parsed = LeetCodeCalendarService.parseProfile("https://leetcode.cn/u/foo/");
    assertEquals("foo", parsed.username());
    assertEquals("https://leetcode.cn", parsed.host());
  }

  @Test
  void parseSolved_readsDifficultyCountsNotSubmissionAttempts() {
    ObjectMapper mapper = new ObjectMapper();
    ArrayNode stats = mapper.createArrayNode();
    stats.add(stat(mapper, "All", 205, 349));
    stats.add(stat(mapper, "Easy", 103, 171));
    stats.add(stat(mapper, "Medium", 98, 162));
    stats.add(stat(mapper, "Hard", 4, 16));

    LeetCodeCalendarService.DifficultyCounts counts = LeetCodeCalendarService.parseSolved(stats);
    assertEquals(205, counts.all());
    assertEquals(103, counts.easy());
    assertEquals(98, counts.medium());
    assertEquals(4, counts.hard());
  }

  private static ObjectNode stat(ObjectMapper mapper, String difficulty, int count, int submissions) {
    ObjectNode node = mapper.createObjectNode();
    node.put("difficulty", difficulty);
    node.put("count", count);
    node.put("submissions", submissions);
    return node;
  }
}
