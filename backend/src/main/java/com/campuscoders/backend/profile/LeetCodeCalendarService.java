package com.campuscoders.backend.profile;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.campuscoders.backend.profile.dto.ActivityDayResponse;
import com.campuscoders.backend.profile.dto.LeetCodeCalendarResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class LeetCodeCalendarService {

  private static final Logger log = LoggerFactory.getLogger(LeetCodeCalendarService.class);
  private static final Duration CACHE_TTL = Duration.ofMinutes(15);
  private static final Set<String> RESERVED = Set.of(
      "u", "contest", "problemset", "problems", "profile", "discuss", "explore",
      "interview", "accounts", "login", "signup", "premium", "store", "playground",
      "assessment", "support", "jobs", "graphql", "points", "settings", "session",
      "subscribe", "contestlist", "studyplan");
  private static final Pattern HANDLE = Pattern.compile(
      "(?:https?://)?(?:www\\.)?leetcode\\.(com|cn)/(?:u/)?([A-Za-z0-9_-]+)",
      Pattern.CASE_INSENSITIVE);
  private static final Pattern BARE_HANDLE = Pattern.compile("^[A-Za-z0-9_-]{1,30}$");
  private static final String CALENDAR_QUERY = """
      query userProfileCalendar($username: String!, $year: Int) {
        matchedUser(username: $username) {
          username
          profile {
            ranking
          }
          submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
            }
          }
          userCalendar(year: $year) {
            activeYears
            streak
            totalActiveDays
            submissionCalendar
          }
        }
      }
      """;

  private final RestClient restClient;
  private final ObjectMapper objectMapper;
  private final ConcurrentHashMap<String, CacheEntry> cache = new ConcurrentHashMap<>();

  public LeetCodeCalendarService(ObjectMapper objectMapper) {
    SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
    factory.setConnectTimeout(Duration.ofSeconds(5));
    factory.setReadTimeout(Duration.ofSeconds(10));
    this.restClient = RestClient.builder()
        .requestFactory(factory)
        .defaultHeader("User-Agent", "Mozilla/5.0")
        .defaultHeader("Accept", "application/json")
        .build();
    this.objectMapper = objectMapper;
  }

  public LeetCodeCalendarResponse forProfileUrl(String leetcodeUrl, Integer year) {
    ParsedProfile parsed = parseProfile(leetcodeUrl);
    if (parsed == null) {
      return LeetCodeCalendarResponse.empty("Add a LeetCode profile URL to see your submission calendar.");
    }

    int calendarYear = year != null ? year : LocalDate.now(ZoneOffset.UTC).getYear();
    String cacheKey = parsed.host() + ":" + parsed.username().toLowerCase() + ":" + calendarYear;
    CacheEntry cached = cache.get(cacheKey);
    if (cached != null && cached.expiresAt().isAfter(Instant.now())) {
      return cached.response();
    }

    try {
      LeetCodeCalendarResponse fetched = fetchFromLeetCode(parsed, calendarYear);
      cache.put(cacheKey, new CacheEntry(fetched, Instant.now().plus(CACHE_TTL)));
      return fetched;
    } catch (Exception ex) {
      log.warn("LeetCode calendar fetch failed for {}: {}", parsed.username(), ex.getMessage());
      return LeetCodeCalendarResponse.empty("Could not load the LeetCode calendar right now. Try again later.");
    }
  }

  static String parseUsername(String url) {
    ParsedProfile parsed = parseProfile(url);
    return parsed == null ? null : parsed.username();
  }

  static ParsedProfile parseProfile(String url) {
    if (url == null || url.isBlank()) {
      return null;
    }
    String trimmed = url.trim().split("[?#]")[0];
    if (BARE_HANDLE.matcher(trimmed).matches()) {
      if (RESERVED.contains(trimmed.toLowerCase())) {
        return null;
      }
      return new ParsedProfile(trimmed, "https://leetcode.com");
    }

    Matcher matcher = HANDLE.matcher(trimmed);
    if (!matcher.find()) {
      return null;
    }
    String tld = matcher.group(1);
    String handle = matcher.group(2);
    if (RESERVED.contains(handle.toLowerCase())) {
      return null;
    }
    String host = "cn".equalsIgnoreCase(tld) ? "https://leetcode.cn" : "https://leetcode.com";
    return new ParsedProfile(handle, host);
  }

  private LeetCodeCalendarResponse fetchFromLeetCode(ParsedProfile parsed, int year) throws Exception {
    Map<String, Object> body = Map.of(
        "query", CALENDAR_QUERY,
        "variables", Map.of("username", parsed.username(), "year", year),
        "operationName", "userProfileCalendar");

    String raw = restClient.post()
        .uri(parsed.host() + "/graphql")
        .header("Origin", parsed.host())
        .header("Referer", parsed.host() + "/")
        .contentType(MediaType.APPLICATION_JSON)
        .body(body)
        .retrieve()
        .body(String.class);

    JsonNode root = objectMapper.readTree(raw);
    JsonNode matched = root.path("data").path("matchedUser");
    if (matched.isMissingNode() || matched.isNull()) {
      if (root.has("errors")) {
        log.warn("LeetCode GraphQL errors for {}: {}", parsed.username(), root.get("errors"));
      }
      return LeetCodeCalendarResponse.empty("LeetCode profile not found for @" + parsed.username() + ".");
    }

    JsonNode calendar = matched.path("userCalendar");
    String calendarJson = calendar.path("submissionCalendar").asText("{}");
    List<ActivityDayResponse> days = parseSubmissionCalendar(calendarJson);

    int yearlySubmissions = days.stream().mapToInt(ActivityDayResponse::count).sum();
    DifficultyCounts solved = parseSolved(matched.path("submitStatsGlobal").path("acSubmissionNum"));
    List<Integer> activeYears = new ArrayList<>();
    for (JsonNode yearNode : calendar.path("activeYears")) {
      activeYears.add(yearNode.asInt());
    }
    activeYears.sort(Comparator.reverseOrder());

    String canonical = matched.path("username").asText(parsed.username());
    int ranking = matched.path("profile").path("ranking").asInt(0);

    return new LeetCodeCalendarResponse(
        true,
        canonical,
        year,
        calendar.path("streak").asInt(0),
        calendar.path("totalActiveDays").asInt(days.size()),
        yearlySubmissions,
        solved.all(),
        solved.easy(),
        solved.medium(),
        solved.hard(),
        ranking > 0 ? ranking : null,
        activeYears,
        days,
        null);
  }

  private List<ActivityDayResponse> parseSubmissionCalendar(String calendarJson) throws Exception {
    JsonNode daysNode = objectMapper.readTree(calendarJson == null || calendarJson.isBlank() ? "{}" : calendarJson);
    List<ActivityDayResponse> days = new ArrayList<>();
    daysNode.fields().forEachRemaining(entry -> {
      long epochSeconds = Long.parseLong(entry.getKey());
      int count = entry.getValue().asInt(0);
      LocalDate date = Instant.ofEpochSecond(epochSeconds).atZone(ZoneOffset.UTC).toLocalDate();
      days.add(new ActivityDayResponse(date.toString(), count));
    });
    days.sort(Comparator.comparing(ActivityDayResponse::date));
    return days;
  }

  static DifficultyCounts parseSolved(JsonNode acSubmissions) {
    int all = 0;
    int easy = 0;
    int medium = 0;
    int hard = 0;
    if (acSubmissions != null && acSubmissions.isArray()) {
      for (JsonNode stat : acSubmissions) {
        String difficulty = stat.path("difficulty").asText();
        int count = stat.path("count").asInt(0);
        if ("All".equalsIgnoreCase(difficulty)) {
          all = count;
        } else if ("Easy".equalsIgnoreCase(difficulty)) {
          easy = count;
        } else if ("Medium".equalsIgnoreCase(difficulty)) {
          medium = count;
        } else if ("Hard".equalsIgnoreCase(difficulty)) {
          hard = count;
        }
      }
    }
    return new DifficultyCounts(all, easy, medium, hard);
  }

  record ParsedProfile(String username, String host) {
  }

  record DifficultyCounts(int all, int easy, int medium, int hard) {
  }

  private record CacheEntry(LeetCodeCalendarResponse response, Instant expiresAt) {
  }
}
