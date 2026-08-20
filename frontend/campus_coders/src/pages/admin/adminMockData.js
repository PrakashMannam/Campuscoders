const KEY = (name) => `cc_admin_${name}`;

export function loadStore(name, fallback) {
  try {
    const raw = sessionStorage.getItem(KEY(name));
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function saveStore(name, value) {
  sessionStorage.setItem(KEY(name), JSON.stringify(value));
}

export const MOCK_PATHS = [
  { id: 1, name: 'Java Full Stack', slug: 'java-fullstack', difficulty: 'INTERMEDIATE', enrolled: 842, topics: 12, published: true, color: '#d97706' },
  { id: 2, name: 'Python Full Stack', slug: 'python-fullstack', difficulty: 'BEGINNER', enrolled: 1204, topics: 14, published: true, color: '#059669' },
  { id: 3, name: 'DSA Intensive', slug: 'dsa-intensive', difficulty: 'ADVANCED', enrolled: 631, topics: 18, published: true, color: '#4f46e5' },
  { id: 4, name: 'Spring Boot', slug: 'spring-boot', difficulty: 'INTERMEDIATE', enrolled: 390, topics: 9, published: false, color: '#0ea5e9' },
];

export const MOCK_TOPICS = [
  { id: 10, name: 'Python Basics', pathId: 2, icon: '🐍', color: '#059669', resources: 8, description: 'Syntax, types, control flow' },
  { id: 11, name: 'Python OOP', pathId: 2, icon: '🧩', color: '#0d9488', resources: 6, description: 'Classes, inheritance, dunder methods' },
  { id: 12, name: 'Django Basics', pathId: 2, icon: '🌿', color: '#16a34a', resources: 7, description: 'Views, models, templates' },
  { id: 13, name: 'REST APIs with Django', pathId: 2, icon: '🔗', color: '#2563eb', resources: 5, description: 'DRF, serializers, auth' },
  { id: 20, name: 'Java Core', pathId: 1, icon: '☕', color: '#d97706', resources: 9, description: 'JVM, collections, streams' },
  { id: 21, name: 'Spring MVC', pathId: 1, icon: '🍃', color: '#65a30d', resources: 6, description: 'Controllers, DI, interceptors' },
  { id: 30, name: 'Arrays & Hashing', pathId: 3, icon: '#️⃣', color: '#4f46e5', resources: 11, description: 'Two pointers, maps, sliding window' },
  { id: 31, name: 'Graphs', pathId: 3, icon: '🕸', color: '#7c3aed', resources: 8, description: 'BFS, DFS, Dijkstra, Union-Find' },
];

export const MOCK_RESOURCES = [
  { id: 101, title: 'Python Crash Course', description: 'A practical walkthrough of Python 3 for campus beginners.', type: 'VIDEO', difficulty: 'BEGINNER', learningPathId: 2, learningPathName: 'Python Full Stack', topicId: 10, topicName: 'Python Basics', resourceLink: 'https://youtube.com/watch?v=python', tags: ['python', 'beginner'], active: true, isPremium: false },
  { id: 102, title: 'Django REST Framework Guide', description: 'Build production APIs with serializers and viewsets.', type: 'ARTICLE', difficulty: 'INTERMEDIATE', learningPathId: 2, learningPathName: 'Python Full Stack', topicId: 13, topicName: 'REST APIs with Django', resourceLink: 'https://www.django-rest-framework.org/', tags: ['django', 'api'], active: true, isPremium: true },
  { id: 103, title: 'Java Collections Cheatsheet', description: 'Lists, maps, sets and when to use each.', type: 'PDF', difficulty: 'BEGINNER', learningPathId: 1, learningPathName: 'Java Full Stack', topicId: 20, topicName: 'Java Core', resourceLink: 'https://example.com/java-collections.pdf', tags: ['java', 'collections'], active: true, isPremium: false },
  { id: 104, title: 'Graph Algorithms Visualized', description: 'BFS, DFS and shortest paths with diagrams.', type: 'COURSE', difficulty: 'ADVANCED', learningPathId: 3, learningPathName: 'DSA Intensive', topicId: 31, topicName: 'Graphs', resourceLink: 'https://visualgo.net/en/graphds', tags: ['dsa', 'graphs'], active: false, isPremium: true },
  { id: 105, title: 'Spring Boot Official Docs', description: 'Canonical reference for starters, actuators and config.', type: 'DOCUMENTATION', difficulty: 'INTERMEDIATE', learningPathId: 4, learningPathName: 'Spring Boot', topicId: 21, topicName: 'Spring MVC', resourceLink: 'https://docs.spring.io/spring-boot', tags: ['spring', 'docs'], active: true, isPremium: false },
];

export const MOCK_PATH_CURRICULUM = {
  1: [20, 21],
  2: [10, 11, 12, 13],
  3: [30, 31],
  4: [21],
};

export const MOCK_USERS = [
  { id: 1, fullName: 'Aisha Rahman', email: 'aisha@college.edu', role: 'STUDENT', enabled: true, banned: false, totalXp: 4280, dailyStreak: 21, problemsSolved: 94, lastActive: '2026-08-20', cohort: 'Beginners' },
  { id: 2, fullName: 'Rohan Mehta', email: 'rohan@college.edu', role: 'STUDENT', enabled: true, banned: false, totalXp: 6120, dailyStreak: 44, problemsSolved: 131, lastActive: '2026-08-20', cohort: 'Active this week' },
  { id: 3, fullName: 'Priya Nair', email: 'priya@college.edu', role: 'ADMIN', enabled: true, banned: false, totalXp: 980, dailyStreak: 4, problemsSolved: 12, lastActive: '2026-08-19', cohort: 'All Users' },
  { id: 4, fullName: 'Dev Patel', email: 'dev@college.edu', role: 'STUDENT', enabled: false, banned: false, totalXp: 740, dailyStreak: 0, problemsSolved: 18, lastActive: '2026-07-11', cohort: 'Beginners' },
  { id: 5, fullName: 'Sara Khan', email: 'sara@college.edu', role: 'STUDENT', enabled: true, banned: false, totalXp: 3550, dailyStreak: 12, problemsSolved: 77, lastActive: '2026-08-18', cohort: 'Active this week' },
  { id: 6, fullName: 'Arjun Iyer', email: 'arjun@college.edu', role: 'STUDENT', enabled: true, banned: true, totalXp: 210, dailyStreak: 0, problemsSolved: 3, lastActive: '2026-06-02', cohort: 'All Users' },
  { id: 7, fullName: 'Meera Joshi', email: 'meera@college.edu', role: 'STUDENT', enabled: true, banned: false, totalXp: 8010, dailyStreak: 63, problemsSolved: 188, lastActive: '2026-08-20', cohort: 'Active this week' },
  { id: 8, fullName: 'Kabir Singh', email: 'kabir@college.edu', role: 'STUDENT', enabled: true, banned: false, totalXp: 1540, dailyStreak: 6, problemsSolved: 29, lastActive: '2026-08-17', cohort: 'Beginners' },
];

export const MOCK_ANNOUNCEMENTS = [
  { id: 1, title: 'Campus Hackathon 2026', message: 'Registrations open for the 36-hour campus hackathon. Teams of 2–4.', category: 'HACKATHON', audience: 'All Users', channel: 'banner', published: true, createdAt: '2026-08-12T10:00:00' },
  { id: 2, title: 'Maintenance window', message: 'Platform will pause submissions Sunday 02:00–04:00 IST.', category: 'SYSTEM', audience: 'All Users', channel: 'banner', published: true, createdAt: '2026-08-16T18:30:00' },
  { id: 3, title: 'Beginner DSA week', message: 'New Arrays & Hashing track drops Monday. Warm up with Easy POTD.', category: 'ACADEMIC', audience: 'Beginners', channel: 'push', published: true, createdAt: '2026-08-18T09:00:00' },
];

export const MOCK_CHALLENGES = [
  {
    id: 1,
    title: 'Two Sum Campus Edition',
    difficulty: 'EASY',
    description: 'Given an array of integers `nums` and a target, return indices of the two numbers that add up to target.',
    constraints: '2 ≤ n ≤ 10^4\n-10^9 ≤ nums[i], target ≤ 10^9\nExactly one valid answer.',
    scheduledDate: '2026-08-20',
    live: true,
    tests: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', hidden: false },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]', hidden: false },
      { input: 'nums = [1,5,3,8], target = 9', output: '[0,3]', hidden: true },
    ],
  },
  {
    id: 2,
    title: 'Course Schedule DAG',
    difficulty: 'MEDIUM',
    description: 'Detect if you can finish all courses given prerequisite pairs. Return true if the graph is a DAG.',
    constraints: '1 ≤ numCourses ≤ 2000\n0 ≤ prerequisites.length ≤ 5000',
    scheduledDate: '2026-08-21',
    live: false,
    tests: [
      { input: '2, [[1,0]]', output: 'true', hidden: false },
      { input: '2, [[1,0],[0,1]]', output: 'false', hidden: true },
    ],
  },
  {
    id: 3,
    title: 'Median of Two Sorted Arrays',
    difficulty: 'HARD',
    description: 'Find the median of two sorted arrays in O(log (m+n)).',
    constraints: '0 ≤ m, n ≤ 1000\nm + n ≥ 1',
    scheduledDate: '2026-08-24',
    live: false,
    tests: [
      { input: '[1,3], [2]', output: '2.0', hidden: false },
      { input: '[1,2], [3,4]', output: '2.5', hidden: true },
    ],
  },
];

export const MOCK_FLAGS = [
  { id: 1, type: 'POST', title: 'Is DSA even useful in 2026?', excerpt: 'Hot take: grinding leetcode is a waste if you already intern at FAANG…', author: 'Arjun Iyer', reportedBy: 'Rohan Mehta', reason: 'Harassment / flame', createdAt: '2026-08-19T16:22:00', status: 'pending' },
  { id: 2, type: 'COMMENT', title: 'Re: Two Sum Campus Edition', excerpt: 'Paste-bin of a full paid solution dump with no explanation.', author: 'Dev Patel', reportedBy: 'Aisha Rahman', reason: 'Cheating / leaked solution', createdAt: '2026-08-20T08:11:00', status: 'pending' },
  { id: 3, type: 'SOLUTION', title: 'Graph coloring — Java', excerpt: 'Solution contains offensive variable names and spam links.', author: 'Kabir Singh', reportedBy: 'Priya Nair', reason: 'Spam / abuse', createdAt: '2026-08-20T11:40:00', status: 'pending' },
];

export const MOCK_BADGES = [
  { id: 'gold-streak', name: 'Gold Streak', emoji: '🥇', description: '60-day coding streak' },
  { id: 'campus-hero', name: 'Campus Hero', emoji: '🏆', description: 'Top 3 on monthly board' },
  { id: 'mentor', name: 'Mentor', emoji: '🌟', description: 'Helped 25+ discussions' },
  { id: 'night-owl', name: 'Night Owl', emoji: '🦉', description: 'Solved 10 POTD after midnight' },
];

export const DEFAULT_POINT_RULES = { easy: 10, medium: 25, hard: 50, streakBonus: 5, firstBlood: 15 };

export const DEFAULT_SETTINGS = {
  platformName: 'CampusCoders',
  contactEmail: 'hello@campuscoders.edu',
  supportEmail: 'support@campuscoders.edu',
  twitter: 'https://x.com/campuscoders',
  github: 'https://github.com/campuscoders',
  linkedin: 'https://linkedin.com/company/campuscoders',
  allowRegistrations: true,
  maintenanceMode: false,
  requireEmailVerify: true,
  twoFactorAdmins: true,
  sessionHours: 24,
  brandPrimary: '#d4af37',
};
