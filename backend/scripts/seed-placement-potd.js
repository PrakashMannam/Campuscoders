/**
 * Seeds Placement path (if missing), today's POTD, and a couple of events.
 * Does NOT touch env/deploy secrets.
 */
const BASE = "http://localhost:8080/api";

async function request(method, path, token, body) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path} (${res.status}): ${text}`);
  return text ? JSON.parse(text) : null;
}

async function main() {
  const login = await request("POST", "/auth/login", null, {
    email: "admin@campus.com",
    password: "admin123",
  });
  const token = login.token;
  console.log("Logged in as", login.email);

  const paths = (await request("GET", "/admin/learning-paths", token)) || [];
  let placement = paths.find((p) => p.slug === "interview-prep" || p.category === "Placement");
  if (!placement) {
    placement = await request("POST", "/admin/learning-paths", token, {
      title: "Interview prep",
      slug: "interview-prep",
      shortDescription: "DSA patterns, resume basics, and how to talk through solutions.",
      description:
        "Placement track: arrays and hashing, interview communication, and a concise resume checklist.",
      iconName: "briefcase",
      category: "Placement",
      difficulty: "INTERMEDIATE",
      estimatedHours: 20,
    });
    console.log("Created placement path", placement.id);
    const topic = await request("POST", "/admin/topics", token, {
      learningPathId: placement.id,
      title: "Core DSA patterns",
      slug: "core-dsa-patterns",
      description: "Patterns that show up most in intern and new-grad screens.",
      estimatedMinutes: 240,
      sortOrder: 1,
    });
    await request("POST", "/admin/resources", token, {
      topicId: topic.id,
      title: "Two Sum (LeetCode)",
      description: "Hash map pattern — start here.",
      type: "PRACTICE",
      difficulty: "BEGINNER",
      url: "https://leetcode.com/problems/two-sum/",
      provider: "LeetCode",
      estimatedMinutes: 25,
      sortOrder: 1,
    });
    await request("POST", "/admin/resources", token, {
      topicId: topic.id,
      title: "NeetCode roadmap",
      description: "Ordered interview patterns.",
      type: "PRACTICE",
      difficulty: "INTERMEDIATE",
      url: "https://neetcode.io/roadmap",
      provider: "NeetCode",
      estimatedMinutes: 180,
      sortOrder: 2,
    });
  } else {
    console.log("Placement path exists:", placement.slug);
  }

  let problems = (await request("GET", "/admin/coding-problems", token)) || [];
  let problem = problems.find((p) => p.problemUrl && p.problemUrl.includes("two-sum"));
  if (!problem) {
    problem = await request("POST", "/admin/coding-problems", token, {
      title: "Two Sum",
      platform: "LeetCode",
      problemUrl: "https://leetcode.com/problems/two-sum/",
      difficulty: "BEGINNER",
      tags: "arrays,hashing",
    });
    console.log("Created coding problem", problem.id);
    problems = [problem, ...problems];
  }

  const today = new Date().toISOString().slice(0, 10);
  const challenges = (await request("GET", "/admin/daily-challenges", token)) || [];
  const hasToday = challenges.some((c) => c.challengeDate === today && c.active);
  if (!hasToday) {
    const created = await request("POST", "/admin/daily-challenges", token, {
      codingProblemId: problem.id,
      challengeDate: today,
    });
    console.log("Scheduled today's POTD", created.id, today);
  } else {
    console.log("Today's POTD already scheduled");
  }

  const events = (await request("GET", "/admin/events", token)) || [];
  if (events.length < 2) {
    const start = new Date();
    start.setDate(start.getDate() + 5);
    start.setHours(20, 0, 0, 0);
    const end = new Date(start);
    end.setHours(22, 0, 0, 0);
    await request("POST", "/admin/events", token, {
      title: "Campus mock contest",
      description: "Timed practice set — open on LeetCode contest page.",
      type: "CONTEST",
      platform: "LeetCode",
      startsAt: start.toISOString(),
      endsAt: end.toISOString(),
      actionLabel: "Open contest",
      actionUrl: "https://leetcode.com/contest/",
    });
    console.log("Created campus mock contest event");
  } else {
    console.log("Events already present:", events.length);
  }

  console.log("Done (no env changes).");
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
