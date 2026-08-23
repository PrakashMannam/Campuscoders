/**
 * Upserts curated catalog (docs + video + practice) and deactivates
 * old Antigravity-style single "600 minute" masterclass videos on those paths.
 *
 *   node backend/scripts/seed-curated-catalog.js
 */
const catalog = require("./curated-learning-catalog");

const BASE = process.env.API_BASE || "http://localhost:8080/api";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@campus.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

async function request(method, pathname, token, body) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(BASE + pathname, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${method} ${pathname} failed (${res.status}): ${text}`);
  }
  return text ? JSON.parse(text) : null;
}

async function oembedOk(url) {
  if (!url.includes("youtube.com") && !url.includes("youtu.be")) return true;
  try {
    const r = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
    );
    return r.ok;
  } catch {
    return false;
  }
}

async function main() {
  const login = await request("POST", "/auth/login", null, {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });
  if (!login.token) throw new Error("Admin login failed (no token)");
  const token = login.token;
  console.log(`Logged in as ${login.email}`);

  let paths = (await request("GET", "/admin/learning-paths", token)) || [];
  let topics = (await request("GET", "/admin/topics", token)) || [];
  let resources = (await request("GET", "/admin/resources", token)) || [];

  const stats = {
    pathsCreated: 0,
    pathsUpdated: 0,
    topicsCreated: 0,
    resourcesCreated: 0,
    deactivated: 0,
    videoFailedOembed: [],
  };

  for (const entry of catalog) {
    const p = entry.path;
    let course = paths.find((x) => x.slug === p.slug);
    if (!course) {
      course = await request("POST", "/admin/learning-paths", token, {
        title: p.title,
        slug: p.slug,
        shortDescription: p.shortDescription,
        description: p.description,
        iconName: p.iconName,
        category: p.category,
        difficulty: p.difficulty,
        estimatedHours: p.estimatedHours,
      });
      paths.push(course);
      stats.pathsCreated += 1;
      console.log(`+ path ${p.slug}`);
    } else {
      await request("PUT", `/admin/learning-paths/${course.id}`, token, {
        title: p.title,
        slug: p.slug,
        shortDescription: p.shortDescription,
        description: p.description,
        iconName: p.iconName,
        category: p.category,
        difficulty: p.difficulty,
        estimatedHours: p.estimatedHours,
        active: true,
      });
      stats.pathsUpdated += 1;
      console.log(`~ path ${p.slug}`);
    }

    // Deactivate old "Complete Masterclass" resources on this path (fake 600-min era)
    const pathTopics = topics.filter((t) => t.learningPathId === course.id);
    for (const t of pathTopics) {
      const oldies = resources.filter(
        (r) =>
          r.topicId === t.id &&
          (String(t.slug).includes("complete-masterclass") ||
            String(r.title).toLowerCase().includes("full course") ||
            r.estimatedMinutes === 600)
      );
      for (const r of oldies) {
        if (r.active === false) continue;
        try {
          await request("PATCH", `/admin/resources/${r.id}/deactivate`, token);
          stats.deactivated += 1;
          r.active = false;
        } catch (e) {
          console.warn(`  could not deactivate resource ${r.id}: ${e.message}`);
        }
      }
    }

    const topicDef = entry.topic;
    let topic = topics.find(
      (t) => t.learningPathId === course.id && t.slug === topicDef.slug
    );
    if (!topic) {
      topic = await request("POST", "/admin/topics", token, {
        learningPathId: course.id,
        title: topicDef.title,
        slug: topicDef.slug,
        description: topicDef.description,
        estimatedMinutes: topicDef.estimatedMinutes,
        sortOrder: topicDef.sortOrder,
      });
      topics.push(topic);
      stats.topicsCreated += 1;
      console.log(`  + topic ${topicDef.slug}`);
    } else {
      console.log(`  = topic ${topicDef.slug}`);
    }

    for (const res of entry.resources) {
      if (res.type === "VIDEO") {
        const ok = await oembedOk(res.url);
        if (!ok) {
          stats.videoFailedOembed.push({ path: p.slug, url: res.url, title: res.title });
          console.warn(`  ! oEmbed failed for ${res.url} — still inserting`);
        }
      }
      const exists = resources.find(
        (r) => r.topicId === topic.id && r.url === res.url
      );
      if (exists) {
        if (exists.active === false) {
          try {
            await request("PATCH", `/admin/resources/${exists.id}/activate`, token);
            exists.active = true;
          } catch (_) {
            /* ignore */
          }
        }
        console.log(`    = ${res.type} ${res.title}`);
        continue;
      }
      const created = await request("POST", "/admin/resources", token, {
        topicId: topic.id,
        title: res.title,
        description: res.description,
        type: res.type,
        difficulty: p.difficulty,
        url: res.url,
        provider: res.provider,
        estimatedMinutes: res.estimatedMinutes,
        sortOrder: res.sortOrder,
      });
      resources.push(created);
      stats.resourcesCreated += 1;
      console.log(
        `    + ${res.type} ${res.title} (${res.estimatedMinutes} min)`
      );
    }
  }

  console.log("\n=== DONE ===");
  console.log(JSON.stringify(stats, null, 2));
  if (stats.videoFailedOembed.length) {
    console.log("\nVideos that failed oEmbed (review manually):");
    for (const v of stats.videoFailedOembed) {
      console.log(` - ${v.path}: ${v.title} ${v.url}`);
    }
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
