const fs = require("fs");
const path = require("path");

const BASE = "http://localhost:8080/api";
const catalog = JSON.parse(
  fs.readFileSync(path.join(__dirname, "seed-admin-catalog.json"), "utf8")
);

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

async function main() {
  const login = await request("POST", "/auth/login", null, {
    email: "admin@campus.com",
    password: "admin123",
  });
  const token = login.token;
  console.log(`Logged in as ${login.email} (${login.role})`);

  const paths = (await request("GET", "/admin/learning-paths", token)) || [];
  const topics = (await request("GET", "/admin/topics", token)) || [];
  const resources = (await request("GET", "/admin/resources", token)) || [];
  const pathsBySlug = Object.fromEntries(paths.map((p) => [p.slug, p]));
  const topicsByKey = Object.fromEntries(
    topics.map((t) => [`${t.learningPathId}:${t.slug}`, t])
  );
  const resourcesByKey = Object.fromEntries(
    resources.map((r) => [`${r.topicId}:${r.url}`, r])
  );
  const created = { paths: 0, topics: 0, resources: 0 };

  for (const entry of catalog) {
    const pathBody = entry.path;
    let course = pathsBySlug[pathBody.slug];
    if (!course) {
      course = await request("POST", "/admin/learning-paths", token, pathBody);
      pathsBySlug[course.slug] = course;
      created.paths += 1;
      console.log(`Created path ${course.slug} id=${course.id}`);
    } else {
      console.log(`Path exists ${course.slug} id=${course.id}`);
    }

    for (const topicDef of entry.topics) {
      const tKey = `${course.id}:${topicDef.slug}`;
      let topic = topicsByKey[tKey];
      if (!topic) {
        topic = await request("POST", "/admin/topics", token, {
          learningPathId: course.id,
          title: topicDef.title,
          slug: topicDef.slug,
          description: topicDef.description,
          estimatedMinutes: topicDef.estimatedMinutes,
          sortOrder: topicDef.sortOrder,
        });
        topicsByKey[tKey] = topic;
        created.topics += 1;
        console.log(`  Created topic ${topic.slug} id=${topic.id}`);
      } else {
        console.log(`  Topic exists ${topic.slug}`);
      }

      for (const res of topicDef.resources) {
        const rKey = `${topic.id}:${res.url}`;
        if (resourcesByKey[rKey]) {
          console.log(`    Resource exists ${res.title}`);
          continue;
        }
        const createdRes = await request("POST", "/admin/resources", token, {
          topicId: topic.id,
          title: res.title,
          description: res.description,
          type: res.type,
          difficulty: res.difficulty,
          url: res.url,
          provider: res.provider,
          estimatedMinutes: res.estimatedMinutes,
          sortOrder: res.sortOrder,
        });
        resourcesByKey[rKey] = createdRes;
        created.resources += 1;
        console.log(`    Created resource ${createdRes.title}`);
      }
    }
  }

  console.log(
    `Done. New this run: paths=${created.paths} topics=${created.topics} resources=${created.resources}`
  );
  console.log(
    `Totals: paths=${Object.keys(pathsBySlug).length} topics=${Object.keys(topicsByKey).length} resources=${Object.keys(resourcesByKey).length}`
  );
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
