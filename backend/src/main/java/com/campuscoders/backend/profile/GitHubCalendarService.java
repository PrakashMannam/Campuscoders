package com.campuscoders.backend.profile;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.campuscoders.backend.profile.dto.ActivityDayResponse;
import com.campuscoders.backend.profile.dto.LeetCodeCalendarResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class GitHubCalendarService {

  private static final Logger log = LoggerFactory.getLogger(GitHubCalendarService.class);
  private static final Duration CACHE_TTL = Duration.ofMinutes(15);
  private static final Set<String> RESERVED = Set.of(
      "settings", "notifications", "features", "topics", "trending",
      "collections", "events", "sponsors", "about", "pricing", "enterprise",
      "login", "signup", "orgs", "marketplace", "explore", "codespaces",
      "pulls", "issues", "new", "organizations");
  private static final Pattern HANDLE = Pattern.compile(
      "(?:https?://)?(?:www\\.)?github\\.com/([A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)/?",
      Pattern.CASE_INSENSITIVE);
  private static final String CALENDAR_QUERY = """
      query($login: String!, $from: DateTime!, $to: DateTime!) {
        user(login: $login) {
          contributionsCollection(from: $from, to: $to) {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  date
                  contributionCount
                }
              }
            }
          }
        }
      }
      """;

  private final RestClient restClient;
  private final ObjectMapper objectMapper;
  private final String token;
  private final ConcurrentHashMap<String, CacheEntry> cache = new ConcurrentHashMap<>();

  public GitHubCalendarService(
      ObjectMapper objectMapper,
      @Value("${campuscoders.github.token:}") String token) {
    SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
    factory.setConnectTimeout(Duration.ofSeconds(5));
    factory.setReadTimeout(Duration.ofSeconds(10));
    this.restClient = RestClient.builder()
        .requestFactory(factory)
        .baseUrl("https://api.github.com")
        .defaultHeader("User-Agent", "CampusCoders/1.0")
        .defaultHeader("Accept", "application/vnd.github+json")
        .build();
    this.objectMapper = objectMapper;
    this.token = token == null ? "" : token.trim();
  }

  public LeetCodeCalendarResponse forProfileUrl(String githubUrl, Integer year) {
    String username = parseUsername(githubUrl);
    if (username == null) {
      return LeetCodeCalendarResponse.empty("Add a GitHub profile URL to see your contribution calendar.");
    }
    if (token.isBlank()) {
      return LeetCodeCalendarResponse.empty("GitHub activity isn't available right now.");
    }

    int calendarYear = year != null ? year : LocalDate.now(ZoneOffset.UTC).getYear();
    String cacheKey = username.toLowerCase() + ":" + calendarYear;
    CacheEntry cached = cache.get(cacheKey);
    if (cached != null && cached.expiresAt().isAfter(Instant.now())) {
      return cached.response();
    }

    try {
      LeetCodeCalendarResponse fetched = fetchFromGitHub(username, calendarYear);
      cache.put(cacheKey, new CacheEntry(fetched, Instant.now().plus(CACHE_TTL)));
      return fetched;
    } catch (Exception ex) {
      log.warn("GitHub calendar fetch failed for {}: {}", username, ex.getMessage());
      return LeetCodeCalendarResponse.empty("Could not load the GitHub calendar right now. Try again later.");
    }
  }

  static String parseUsername(String url) {
    if (url == null || url.isBlank()) {
      return null;
    }
    Matcher matcher = HANDLE.matcher(url.trim());
    if (!matcher.find()) {
      return null;
    }
    String handle = matcher.group(1);
    if (RESERVED.contains(handle.toLowerCase())) {
      return null;
    }
    return handle;
  }

  private LeetCodeCalendarResponse fetchFromGitHub(String username, int year) throws Exception {
    String from = year + "-01-01T00:00:00Z";
    String to = year + "-12-31T23:59:59Z";
    Map<String, Object> body = Map.of(
        "query", CALENDAR_QUERY,
        "variables", Map.of("login", username, "from", from, "to", to));

    String raw = restClient.post()
        .uri("/graphql")
        .header("Authorization", "Bearer " + token)
        .contentType(MediaType.APPLICATION_JSON)
        .body(body)
        .retrieve()
        .body(String.class);

    JsonNode root = objectMapper.readTree(raw);
    if (root.has("errors")) {
      log.warn("GitHub GraphQL errors: {}", root.get("errors"));
      return LeetCodeCalendarResponse.empty("GitHub did not return a calendar for @" + username + ".");
    }

    JsonNode user = root.path("data").path("user");
    if (user.isMissingNode() || user.isNull()) {
      return LeetCodeCalendarResponse.empty("GitHub profile not found for @" + username + ".");
    }

    JsonNode calendar = user.path("contributionsCollection").path("contributionCalendar");
    List<ActivityDayResponse> days = new ArrayList<>();
    int activeDays = 0;
    for (JsonNode week : calendar.path("weeks")) {
      for (JsonNode day : week.path("contributionDays")) {
        int count = day.path("contributionCount").asInt(0);
        String date = day.path("date").asText();
        if (!date.isBlank()) {
          days.add(new ActivityDayResponse(date, count));
          if (count > 0) {
            activeDays++;
          }
        }
      }
    }

    int total = calendar.path("totalContributions").asInt(days.stream().mapToInt(ActivityDayResponse::count).sum());
    int streak = computeStreak(days, LocalDate.now(ZoneOffset.UTC));

    return new LeetCodeCalendarResponse(
        true,
        username,
        year,
        streak,
        activeDays,
        total,
        null,
        null,
        null,
        null,
        null,
        List.of(),
        days,
        null);
  }

  static int computeStreak(List<ActivityDayResponse> days, LocalDate today) {
    Map<String, Integer> byDate = new java.util.HashMap<>();
    for (ActivityDayResponse day : days) {
      byDate.put(day.date(), day.count());
    }
    LocalDate cursor = today;
    if (byDate.getOrDefault(cursor.toString(), 0) == 0) {
      cursor = today.minusDays(1);
    }
    int streak = 0;
    while (byDate.getOrDefault(cursor.toString(), 0) > 0) {
      streak++;
      cursor = cursor.minusDays(1);
    }
    return streak;
  }

  private record CacheEntry(LeetCodeCalendarResponse response, Instant expiresAt) {
  }
}
