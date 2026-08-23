/**
 * Curated Campus Coders catalog — replaces Antigravity "everything is 600 min" junk.
 *
 * Each path has ONE core topic with up to 3 resources:
 *   1) DOCUMENTATION (required)
 *   2) VIDEO (required) — popular free YouTube courses; estimatedMinutes from published length
 *   3) PRACTICE (when a solid free practice track exists)
 *
 * Durations are NOT inventing 10h for every video — they come from Class Central /
 * freeCodeCamp article watch times / YouTube listed length where known.
 */
module.exports = [
  {
    path: { title: "Java Fundamentals", slug: "java-fundamentals", category: "PROGRAMMING", difficulty: "BEGINNER", estimatedHours: 20, iconName: "code", shortDescription: "Syntax, OOP, and the JDK", description: "Beginner Java with official docs, a widely recommended freeCodeCamp/Bro Code style course, and hands-on practice." },
    topic: { title: "Core Java", slug: "java-fundamentals-core", description: "Language basics through OOP.", estimatedMinutes: 900, sortOrder: 1 },
    resources: [
      { title: "Oracle Java Tutorials — Getting Started", type: "DOCUMENTATION", url: "https://docs.oracle.com/javase/tutorial/getStarted/index.html", provider: "Oracle", estimatedMinutes: 90, sortOrder: 1, description: "Official Oracle trail for new Java developers." },
      { title: "Bro Code — Java Full Course for Beginners", type: "VIDEO", url: "https://www.youtube.com/watch?v=xk4_1vDrzzo", provider: "Bro Code", estimatedMinutes: 720, sortOrder: 2, description: "Very popular ~12h beginner Java course (Class Central)." },
      { title: "Exercism — Java track", type: "PRACTICE", url: "https://exercism.org/tracks/java", provider: "Exercism", estimatedMinutes: 300, sortOrder: 3, description: "Mentored coding exercises for Java." }
    ]
  },
  {
    path: { title: "Python Fundamentals", slug: "python-fundamentals", category: "PROGRAMMING", difficulty: "BEGINNER", estimatedHours: 15, iconName: "code", shortDescription: "Python syntax and basics", description: "Official tutorial, freeCodeCamp beginner course, and practice drills." },
    topic: { title: "Core Python", slug: "python-fundamentals-core", description: "Syntax, data structures, functions, and OOP intro.", estimatedMinutes: 600, sortOrder: 1 },
    resources: [
      { title: "Python.org Official Tutorial", type: "DOCUMENTATION", url: "https://docs.python.org/3/tutorial/", provider: "Python Software Foundation", estimatedMinutes: 180, sortOrder: 1, description: "Canonical language tutorial." },
      { title: "freeCodeCamp — Learn Python Full Course for Beginners", type: "VIDEO", url: "https://www.youtube.com/watch?v=rfscVS0vtbw", provider: "freeCodeCamp", estimatedMinutes: 270, sortOrder: 2, description: "Widely recommended ~4.5h Mike Dane beginner course." },
      { title: "Exercism — Python track", type: "PRACTICE", url: "https://exercism.org/tracks/python", provider: "Exercism", estimatedMinutes: 300, sortOrder: 3, description: "Practice problems with community mentoring." }
    ]
  },
  {
    path: { title: "C++ Fundamentals", slug: "cpp-fundamentals", category: "PROGRAMMING", difficulty: "BEGINNER", estimatedHours: 12, iconName: "code", shortDescription: "C++ syntax and memory basics", description: "cplusplus.com tutorial plus Bro Code C++ course and HackerRank practice." },
    topic: { title: "Core C++", slug: "cpp-fundamentals-core", description: "Syntax, OOP, and STL intro.", estimatedMinutes: 500, sortOrder: 1 },
    resources: [
      { title: "cplusplus.com — C++ Language Tutorial", type: "DOCUMENTATION", url: "https://cplusplus.com/doc/tutorial/", provider: "cplusplus.com", estimatedMinutes: 240, sortOrder: 1, description: "Classic free C++ language tutorial." },
      { title: "Bro Code — C++ Full Course", type: "VIDEO", url: "https://www.youtube.com/watch?v=vLnPwxZdW4Y", provider: "Bro Code", estimatedMinutes: 230, sortOrder: 2, description: "Popular beginner C++ full course (~3h 50m)." },
      { title: "HackerRank — C++ domain", type: "PRACTICE", url: "https://www.hackerrank.com/domains/cpp", provider: "HackerRank", estimatedMinutes: 240, sortOrder: 3, description: "Structured C++ practice challenges." }
    ]
  },
  {
    path: { title: "C Fundamentals", slug: "c-fundamentals", category: "PROGRAMMING", difficulty: "BEGINNER", estimatedHours: 12, iconName: "code", shortDescription: "C programming and memory", description: "Learn C from freeCodeCamp and practice on HackerRank." },
    topic: { title: "Core C", slug: "c-fundamentals-core", description: "Pointers, arrays, structs, and memory.", estimatedMinutes: 500, sortOrder: 1 },
    resources: [
      { title: "GNU C Manual (reference)", type: "DOCUMENTATION", url: "https://www.gnu.org/software/gnu-c-manual/gnu-c-manual.html", provider: "GNU", estimatedMinutes: 180, sortOrder: 1, description: "Authoritative C language reference." },
      { title: "freeCodeCamp — C Programming Full Course", type: "VIDEO", url: "https://www.youtube.com/watch?v=KJgsSFOSQv0", provider: "freeCodeCamp", estimatedMinutes: 225, sortOrder: 2, description: "Popular ~3h 45m C beginner course (Mike Dane)." },
      { title: "HackerRank — C domain", type: "PRACTICE", url: "https://www.hackerrank.com/domains/c", provider: "HackerRank", estimatedMinutes: 240, sortOrder: 3, description: "C language practice problems." }
    ]
  },
  {
    path: { title: "JavaScript Fundamentals", slug: "javascript-fundamentals", category: "PROGRAMMING", difficulty: "BEGINNER", estimatedHours: 18, iconName: "code", shortDescription: "Modern JavaScript core", description: "MDN docs, freeCodeCamp JS course, and freeCodeCamp curriculum practice." },
    topic: { title: "Core JavaScript", slug: "javascript-fundamentals-core", description: "ES6+ language fundamentals.", estimatedMinutes: 700, sortOrder: 1 },
    resources: [
      { title: "MDN — JavaScript Guide", type: "DOCUMENTATION", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide", provider: "MDN", estimatedMinutes: 240, sortOrder: 1, description: "Industry-standard JS documentation." },
      { title: "freeCodeCamp — JavaScript Algorithms & Data Structures course video", type: "VIDEO", url: "https://www.youtube.com/watch?v=jS4aFq5-91M", provider: "freeCodeCamp", estimatedMinutes: 460, sortOrder: 2, description: "Long-form JS beginner course (~7.5h) often recommended for fundamentals." },
      { title: "freeCodeCamp — JS Algorithms & Data Structures certification", type: "PRACTICE", url: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/", provider: "freeCodeCamp", estimatedMinutes: 400, sortOrder: 3, description: "Interactive challenges used by millions of learners." }
    ]
  },
  {
    path: { title: "HTML & CSS Web Fundamentals", slug: "html-and-css-web-fundamentals", category: "WEB", difficulty: "BEGINNER", estimatedHours: 16, iconName: "globe", shortDescription: "Build static pages", description: "MDN + freeCodeCamp HTML/CSS marathon + Frontend Mentor practice." },
    topic: { title: "HTML & CSS Basics", slug: "html-and-css-web-fundamentals-core", description: "Semantic HTML and responsive CSS.", estimatedMinutes: 700, sortOrder: 1 },
    resources: [
      { title: "MDN — Learn HTML & CSS", type: "DOCUMENTATION", url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content", provider: "MDN", estimatedMinutes: 180, sortOrder: 1, description: "Official learning area for web fundamentals." },
      { title: "freeCodeCamp — HTML & CSS Full Course", type: "VIDEO", url: "https://www.youtube.com/watch?v=mU6anWqZJcc", provider: "freeCodeCamp", estimatedMinutes: 660, sortOrder: 2, description: "Very popular ~11h HTML/CSS course (Mike Dane)." },
      { title: "Frontend Mentor — free challenges", type: "PRACTICE", url: "https://www.frontendmentor.io/challenges", provider: "Frontend Mentor", estimatedMinutes: 300, sortOrder: 3, description: "Real UI challenges recommended by many frontend learners." }
    ]
  },
  {
    path: { title: "SQL Fundamentals", slug: "sql-fundamentals", category: "DATABASE", difficulty: "BEGINNER", estimatedHours: 12, iconName: "database", shortDescription: "Query relational data", description: "PostgreSQL docs, freeCodeCamp SQL course, and SQLBolt practice." },
    topic: { title: "SQL Core", slug: "sql-fundamentals-core", description: "SELECT, joins, aggregation, and design basics.", estimatedMinutes: 500, sortOrder: 1 },
    resources: [
      { title: "PostgreSQL Tutorial — Official docs", type: "DOCUMENTATION", url: "https://www.postgresql.org/docs/current/tutorial.html", provider: "PostgreSQL", estimatedMinutes: 120, sortOrder: 1, description: "Official SQL tutorial against a real RDBMS." },
      { title: "freeCodeCamp — SQL Full Course for Beginners", type: "VIDEO", url: "https://www.youtube.com/watch?v=HXV3zeQKqGY", provider: "freeCodeCamp", estimatedMinutes: 240, sortOrder: 2, description: "Widely cited ~4h SQL beginner course (Mike Dane)." },
      { title: "SQLBolt — Interactive lessons", type: "PRACTICE", url: "https://sqlbolt.com/", provider: "SQLBolt", estimatedMinutes: 180, sortOrder: 3, description: "Browser SQL drills used by many students." }
    ]
  },
  {
    path: { title: "Git & GitHub Fundamentals", slug: "git-and-github-fundamentals", category: "PROGRAMMING", difficulty: "BEGINNER", estimatedHours: 8, iconName: "code", shortDescription: "Version control workflow", description: "Pro Git book, freeCodeCamp Git course, and GitHub Skills labs." },
    topic: { title: "Git Workflow", slug: "git-and-github-fundamentals-core", description: "Commits, branches, PRs, and collaboration.", estimatedMinutes: 350, sortOrder: 1 },
    resources: [
      { title: "Pro Git Book (official)", type: "DOCUMENTATION", url: "https://git-scm.com/book/en/v2", provider: "git-scm", estimatedMinutes: 240, sortOrder: 1, description: "The standard free Git book." },
      { title: "freeCodeCamp — Git and GitHub for Beginners", type: "VIDEO", url: "https://www.youtube.com/watch?v=RGOj5yH7evk", provider: "freeCodeCamp", estimatedMinutes: 60, sortOrder: 2, description: "Popular ~1h Git/GitHub crash course." },
      { title: "GitHub Skills", type: "PRACTICE", url: "https://skills.github.com/", provider: "GitHub", estimatedMinutes: 120, sortOrder: 3, description: "Official interactive GitHub learning labs." }
    ]
  },
  {
    path: { title: "Linux Fundamentals", slug: "linux-fundamentals", category: "COMPUTER SCIENCE", difficulty: "BEGINNER", estimatedHours: 10, iconName: "cpu", shortDescription: "Command line and OS basics", description: "Linux Journey docs-style learning, freeCodeCamp Linux course, and OverTheWire practice." },
    topic: { title: "Linux CLI", slug: "linux-fundamentals-core", description: "Shell, files, permissions, processes.", estimatedMinutes: 450, sortOrder: 1 },
    resources: [
      { title: "Linux Journey", type: "DOCUMENTATION", url: "https://linuxjourney.com/", provider: "Linux Journey", estimatedMinutes: 180, sortOrder: 1, description: "Friendly structured Linux learning site." },
      { title: "freeCodeCamp — Introduction to Linux Full Course", type: "VIDEO", url: "https://www.youtube.com/watch?v=sWbUDq4S6Y8", provider: "freeCodeCamp", estimatedMinutes: 330, sortOrder: 2, description: "Popular freeCodeCamp Linux intro course (~5.5h)." },
      { title: "OverTheWire — Bandit", type: "PRACTICE", url: "https://overthewire.org/wargames/bandit/", provider: "OverTheWire", estimatedMinutes: 180, sortOrder: 3, description: "Classic Linux CLI war-game for beginners." }
    ]
  },
  {
    path: { title: "Data Structures Basics", slug: "data-structures-basics", category: "DSA / PROBLEM SOLVING", difficulty: "BEGINNER", estimatedHours: 20, iconName: "layers", shortDescription: "Arrays, lists, stacks, queues", description: "VisuAlgo + freeCodeCamp DSA intro + LeetCode Easy practice." },
    topic: { title: "Intro DSA", slug: "data-structures-basics-core", description: "Core structures and Big-O intuition.", estimatedMinutes: 600, sortOrder: 1 },
    resources: [
      { title: "VisuAlgo — Visual explanations", type: "DOCUMENTATION", url: "https://visualgo.net/en", provider: "VisuAlgo", estimatedMinutes: 120, sortOrder: 1, description: "Interactive visualizations of classic structures/algorithms." },
      { title: "freeCodeCamp — Algorithms & Data Structures Full Course", type: "VIDEO", url: "https://www.youtube.com/watch?v=8hly31xKli0", provider: "freeCodeCamp", estimatedMinutes: 322, sortOrder: 2, description: "Treehouse/freeCodeCamp course — YouTube length 5h 22m." },
      { title: "LeetCode — Easy problem set", type: "PRACTICE", url: "https://leetcode.com/problemset/?difficulty=EASY", provider: "LeetCode", estimatedMinutes: 400, sortOrder: 3, description: "Industry-standard interview practice (start Easy)." }
    ]
  },
  {
    path: { title: "Ruby Fundamentals", slug: "ruby-fundamentals", category: "PROGRAMMING", difficulty: "BEGINNER", estimatedHours: 12, iconName: "code", shortDescription: "Ruby language basics", description: "Official Ruby docs, freeCodeCamp Ruby course, Exercism practice." },
    topic: { title: "Core Ruby", slug: "ruby-fundamentals-core", description: "Syntax, OOP, and Ruby idioms.", estimatedMinutes: 450, sortOrder: 1 },
    resources: [
      { title: "Ruby-lang — Getting Started", type: "DOCUMENTATION", url: "https://www.ruby-lang.org/en/documentation/quickstart/", provider: "ruby-lang.org", estimatedMinutes: 60, sortOrder: 1, description: "Official Ruby quickstart." },
      { title: "freeCodeCamp — Ruby Programming Language Full Course", type: "VIDEO", url: "https://www.youtube.com/watch?v=t_ispmWmdjY", provider: "freeCodeCamp", estimatedMinutes: 240, sortOrder: 2, description: "Popular freeCodeCamp Ruby beginner course (~4h)." },
      { title: "Exercism — Ruby track", type: "PRACTICE", url: "https://exercism.org/tracks/ruby", provider: "Exercism", estimatedMinutes: 240, sortOrder: 3, description: "Ruby practice with mentoring." }
    ]
  },
  {
    path: { title: "PHP Fundamentals", slug: "php-fundamentals", category: "PROGRAMMING", difficulty: "BEGINNER", estimatedHours: 14, iconName: "code", shortDescription: "PHP for the web", description: "PHP.net manual, freeCodeCamp PHP course, and practice challenges." },
    topic: { title: "Core PHP", slug: "php-fundamentals-core", description: "Syntax, forms, and basic backend scripts.", estimatedMinutes: 500, sortOrder: 1 },
    resources: [
      { title: "PHP.net — Language Reference", type: "DOCUMENTATION", url: "https://www.php.net/manual/en/langref.php", provider: "php.net", estimatedMinutes: 180, sortOrder: 1, description: "Official PHP language reference." },
      { title: "freeCodeCamp — PHP Programming Language Tutorial", type: "VIDEO", url: "https://www.youtube.com/watch?v=OK_JCtrrv-c", provider: "freeCodeCamp", estimatedMinutes: 270, sortOrder: 2, description: "Popular ~4.5h PHP beginner course." },
      { title: "Exercism — PHP track", type: "PRACTICE", url: "https://exercism.org/tracks/php", provider: "Exercism", estimatedMinutes: 240, sortOrder: 3, description: "PHP coding practice." }
    ]
  },
  {
    path: { title: "Java Backend Development", slug: "java-backend-development", category: "BACKEND", difficulty: "INTERMEDIATE", estimatedHours: 18, iconName: "server", shortDescription: "Spring Boot APIs", description: "Spring docs, Amigoscode/freeCodeCamp Spring Boot course, and Spring guides practice." },
    topic: { title: "Spring Boot Basics", slug: "java-backend-development-core", description: "REST APIs, JPA, and configuration.", estimatedMinutes: 400, sortOrder: 1 },
    resources: [
      { title: "Spring — Getting Started Guides", type: "DOCUMENTATION", url: "https://spring.io/guides", provider: "Spring", estimatedMinutes: 180, sortOrder: 1, description: "Official Spring Boot getting-started guides." },
      { title: "freeCodeCamp — Spring Boot Tutorial for Beginners (Amigoscode)", type: "VIDEO", url: "https://www.youtube.com/watch?v=vtPkZShrvXQ", provider: "freeCodeCamp / Amigoscode", estimatedMinutes: 109, sortOrder: 2, description: "YouTube listed length ~1h 49m — highly recommended intro." },
      { title: "Spring Guide — Building a RESTful Web Service", type: "PRACTICE", url: "https://spring.io/guides/gs/rest-service/", provider: "Spring", estimatedMinutes: 90, sortOrder: 3, description: "Follow-along official REST service lab." }
    ]
  },
  {
    path: { title: "React Frontend Development", slug: "react-frontend-development", category: "WEB", difficulty: "INTERMEDIATE", estimatedHours: 25, iconName: "globe", shortDescription: "Build SPAs with React", description: "React.dev docs, freeCodeCamp React course, and practice projects." },
    topic: { title: "React Core", slug: "react-frontend-development-core", description: "Components, hooks, and state.", estimatedMinutes: 900, sortOrder: 1 },
    resources: [
      { title: "React.dev — Learn React", type: "DOCUMENTATION", url: "https://react.dev/learn", provider: "Meta", estimatedMinutes: 240, sortOrder: 1, description: "Official modern React documentation." },
      { title: "freeCodeCamp — React Course for Beginners (Bob Ziroll / Scrimba era classic still linked)", type: "VIDEO", url: "https://www.youtube.com/watch?v=bMknfKXIFA8", provider: "freeCodeCamp", estimatedMinutes: 720, sortOrder: 2, description: "Very popular freeCodeCamp React full course (~12h listed on many aggregators; confirm in YouTube UI)." },
      { title: "freeCodeCamp — Front End Development Libraries practice", type: "PRACTICE", url: "https://www.freecodecamp.org/learn/front-end-development-libraries/", provider: "freeCodeCamp", estimatedMinutes: 300, sortOrder: 3, description: "Interactive React projects inside freeCodeCamp." }
    ]
  },
  {
    path: { title: "Node.js Backend Development", slug: "node-js-backend-development", category: "BACKEND", difficulty: "INTERMEDIATE", estimatedHours: 18, iconName: "server", shortDescription: "Node + Express APIs", description: "Node docs, freeCodeCamp Node/Express course, and Express tutorial practice." },
    topic: { title: "Node & Express", slug: "node-js-backend-development-core", description: "HTTP servers, middleware, REST.", estimatedMinutes: 600, sortOrder: 1 },
    resources: [
      { title: "Node.js — Guides", type: "DOCUMENTATION", url: "https://nodejs.org/en/learn/getting-started/introduction-to-nodejs", provider: "nodejs.org", estimatedMinutes: 90, sortOrder: 1, description: "Official Node getting started." },
      { title: "freeCodeCamp — Node.js and Express.js Full Course", type: "VIDEO", url: "https://www.youtube.com/watch?v=Oe421EPjeBE", provider: "freeCodeCamp", estimatedMinutes: 480, sortOrder: 2, description: "Popular ~8h Node/Express course." },
      { title: "Express — Hello world / routing guide", type: "PRACTICE", url: "https://expressjs.com/en/starter/hello-world.html", provider: "Express", estimatedMinutes: 120, sortOrder: 3, description: "Official Express starter exercises." }
    ]
  },
  {
    path: { title: "Angular Frontend Development", slug: "angular-frontend-development", category: "WEB", difficulty: "INTERMEDIATE", estimatedHours: 20, iconName: "globe", shortDescription: "Angular framework", description: "Angular.dev tutorial, freeCodeCamp Angular course, and Tour of Heroes practice." },
    topic: { title: "Angular Core", slug: "angular-frontend-development-core", description: "Components, DI, and routing.", estimatedMinutes: 700, sortOrder: 1 },
    resources: [
      { title: "Angular.dev — Tutorials", type: "DOCUMENTATION", url: "https://angular.dev/tutorials", provider: "Google", estimatedMinutes: 240, sortOrder: 1, description: "Official Angular learning tutorials." },
      { title: "freeCodeCamp — Angular Course for Beginners", type: "VIDEO", url: "https://www.youtube.com/watch?v=3qBXWUpoPHo", provider: "freeCodeCamp", estimatedMinutes: 140, sortOrder: 2, description: "Popular Angular full course for beginners (~2h+)." },
      { title: "Angular — Tour of Heroes", type: "PRACTICE", url: "https://angular.dev/tutorials/first-app", provider: "Angular", estimatedMinutes: 180, sortOrder: 3, description: "Official first-app / guided tutorial practice." }
    ]
  },
  {
    path: { title: "Vue.js Frontend Development", slug: "vue-js-frontend-development", category: "WEB", difficulty: "INTERMEDIATE", estimatedHours: 16, iconName: "globe", shortDescription: "Vue progressive framework", description: "Vue docs, freeCodeCamp Vue course, and Vue tutorial practice." },
    topic: { title: "Vue Core", slug: "vue-js-frontend-development-core", description: "Composition API and components.", estimatedMinutes: 550, sortOrder: 1 },
    resources: [
      { title: "Vue.js — Official Guide", type: "DOCUMENTATION", url: "https://vuejs.org/guide/introduction.html", provider: "Vue", estimatedMinutes: 180, sortOrder: 1, description: "Official Vue documentation." },
      { title: "freeCodeCamp — Vue.js Course for Beginners", type: "VIDEO", url: "https://www.youtube.com/watch?v=FXpIoQ_rT_c", provider: "freeCodeCamp", estimatedMinutes: 225, sortOrder: 2, description: "Popular Vue beginner full course (~3h 45m)." },
      { title: "Vue — Quick Start tutorial", type: "PRACTICE", url: "https://vuejs.org/tutorial/", provider: "Vue", estimatedMinutes: 90, sortOrder: 3, description: "Official interactive Vue tutorial." }
    ]
  },
  {
    path: { title: "MERN Stack Masterclass", slug: "mern-stack-masterclass", category: "WEB", difficulty: "INTERMEDIATE", estimatedHours: 22, iconName: "globe", shortDescription: "Mongo + Express + React + Node", description: "MongoDB University docs, freeCodeCamp MERN course, and project practice." },
    topic: { title: "MERN Full Stack", slug: "mern-stack-masterclass-core", description: "End-to-end MERN application flow.", estimatedMinutes: 800, sortOrder: 1 },
    resources: [
      { title: "MongoDB — University / Docs hub", type: "DOCUMENTATION", url: "https://www.mongodb.com/docs/manual/", provider: "MongoDB", estimatedMinutes: 150, sortOrder: 1, description: "Official MongoDB manual." },
      { title: "freeCodeCamp — MERN Stack Course", type: "VIDEO", url: "https://www.youtube.com/watch?v=-0exw-9YJBo", provider: "freeCodeCamp", estimatedMinutes: 300, sortOrder: 2, description: "Popular freeCodeCamp MERN project course (~5h)." },
      { title: "MongoDB — Aggregation practice examples", type: "PRACTICE", url: "https://www.mongodb.com/docs/manual/tutorial/getting-started/", provider: "MongoDB", estimatedMinutes: 120, sortOrder: 3, description: "Official getting-started labs." }
    ]
  },
  {
    path: { title: "Android App Development", slug: "android-app-development", category: "PROGRAMMING", difficulty: "INTERMEDIATE", estimatedHours: 25, iconName: "code", shortDescription: "Native Android", description: "Android Developers docs, freeCodeCamp Android course, and Codelabs." },
    topic: { title: "Android Basics", slug: "android-app-development-core", description: "Activities, layouts, and Kotlin/Java Android.", estimatedMinutes: 900, sortOrder: 1 },
    resources: [
      { title: "Android Developers — Get started", type: "DOCUMENTATION", url: "https://developer.android.com/courses", provider: "Google", estimatedMinutes: 240, sortOrder: 1, description: "Official Android courses and docs." },
      { title: "freeCodeCamp — Android Development for Beginners", type: "VIDEO", url: "https://www.youtube.com/watch?v=fis26HvvDII", provider: "freeCodeCamp", estimatedMinutes: 690, sortOrder: 2, description: "Long-form Android beginner course often cited (~11.5h)." },
      { title: "Android Codelabs", type: "PRACTICE", url: "https://codelabs.developers.google.com/?cat=android", provider: "Google", estimatedMinutes: 300, sortOrder: 3, description: "Hands-on official Android codelabs." }
    ]
  },
  {
    path: { title: "iOS App Development", slug: "ios-app-development", category: "PROGRAMMING", difficulty: "INTERMEDIATE", estimatedHours: 22, iconName: "code", shortDescription: "SwiftUI / iOS", description: "Apple docs, freeCodeCamp iOS/Swift course, and Swift Playgrounds practice." },
    topic: { title: "iOS & Swift", slug: "ios-app-development-core", description: "Swift basics and UIKit/SwiftUI intro.", estimatedMinutes: 800, sortOrder: 1 },
    resources: [
      { title: "Apple — Swift / SwiftUI documentation", type: "DOCUMENTATION", url: "https://developer.apple.com/tutorials/swiftui", provider: "Apple", estimatedMinutes: 240, sortOrder: 1, description: "Official SwiftUI tutorials." },
      { title: "freeCodeCamp — iOS & Swift for Beginners", type: "VIDEO", url: "https://www.youtube.com/watch?v=8Xg7E9shq0U", provider: "CodeWithChris / popular listings", estimatedMinutes: 270, sortOrder: 2, description: "Widely shared beginner iOS course (~4.5h range)." },
      { title: "Apple — Swift Playgrounds", type: "PRACTICE", url: "https://www.apple.com/swift/playgrounds/", provider: "Apple", estimatedMinutes: 180, sortOrder: 3, description: "Interactive Swift learning from Apple." }
    ]
  },
  {
    path: { title: "Database Management Systems", slug: "database-management-systems", category: "DATABASE", difficulty: "INTERMEDIATE", estimatedHours: 16, iconName: "database", shortDescription: "DBMS concepts", description: "DB-Engines / academic notes, freeCodeCamp DBMS course, and practice quizzes." },
    topic: { title: "DBMS Concepts", slug: "database-management-systems-core", description: "ER models, normalization, transactions.", estimatedMinutes: 550, sortOrder: 1 },
    resources: [
      { title: "PostgreSQL — Internals / architecture overview", type: "DOCUMENTATION", url: "https://www.postgresql.org/docs/current/overview.html", provider: "PostgreSQL", estimatedMinutes: 120, sortOrder: 1, description: "Solid free DBMS architecture reading." },
      { title: "freeCodeCamp — Database Design Course", type: "VIDEO", url: "https://www.youtube.com/watch?v=ztHopE5Wnpc", provider: "freeCodeCamp", estimatedMinutes: 90, sortOrder: 2, description: "Popular database design course (~1.5h)." },
      { title: "SQLBolt — Intermediate lessons", type: "PRACTICE", url: "https://sqlbolt.com/lesson/select_queries_with_joins", provider: "SQLBolt", estimatedMinutes: 120, sortOrder: 3, description: "Join/aggregation practice." }
    ]
  },
  {
    path: { title: "Cyber Security Fundamentals", slug: "cyber-security-fundamentals", category: "COMPUTER SCIENCE", difficulty: "INTERMEDIATE", estimatedHours: 18, iconName: "cpu", shortDescription: "Security basics", description: "OWASP docs, freeCodeCamp cyber security course, and TryHackMe free rooms." },
    topic: { title: "Security Foundations", slug: "cyber-security-fundamentals-core", description: "OWASP, networking security basics, ethical hacking intro.", estimatedMinutes: 600, sortOrder: 1 },
    resources: [
      { title: "OWASP Top Ten", type: "DOCUMENTATION", url: "https://owasp.org/www-project-top-ten/", provider: "OWASP", estimatedMinutes: 90, sortOrder: 1, description: "Industry-standard web risk catalog." },
      { title: "freeCodeCamp — Cyber Security Full Course", type: "VIDEO", url: "https://www.youtube.com/watch?v=U_P23SqJaDc", provider: "freeCodeCamp", estimatedMinutes: 180, sortOrder: 2, description: "Popular freeCodeCamp cyber security overview (~3h)." },
      { title: "TryHackMe — Free rooms", type: "PRACTICE", url: "https://tryhackme.com/hacktivities", provider: "TryHackMe", estimatedMinutes: 300, sortOrder: 3, description: "Hands-on labs widely recommended for beginners." }
    ]
  },
  {
    path: { title: "Machine Learning Basics", slug: "machine-learning-basics", category: "ADVANCED", difficulty: "INTERMEDIATE", estimatedHours: 20, iconName: "cpu", shortDescription: "Classical ML with Python", description: "scikit-learn docs, freeCodeCamp ML course, and Kaggle Learn." },
    topic: { title: "Classical ML", slug: "machine-learning-basics-core", description: "Supervised learning workflow.", estimatedMinutes: 700, sortOrder: 1 },
    resources: [
      { title: "scikit-learn — User Guide", type: "DOCUMENTATION", url: "https://scikit-learn.org/stable/user_guide.html", provider: "scikit-learn", estimatedMinutes: 240, sortOrder: 1, description: "Canonical classical ML library docs." },
      { title: "freeCodeCamp — Machine Learning for Everybody", type: "VIDEO", url: "https://www.youtube.com/watch?v=i_LwzRVP7bg", provider: "freeCodeCamp", estimatedMinutes: 230, sortOrder: 2, description: "Popular Kylie Ying / freeCodeCamp ML course (~4h)." },
      { title: "Kaggle Learn — Intro to ML", type: "PRACTICE", url: "https://www.kaggle.com/learn/intro-to-machine-learning", provider: "Kaggle", estimatedMinutes: 180, sortOrder: 3, description: "Interactive notebooks used by many students." }
    ]
  },
  {
    path: { title: "Computer Networks", slug: "computer-networks", category: "COMPUTER SCIENCE", difficulty: "INTERMEDIATE", estimatedHours: 14, iconName: "cpu", shortDescription: "Networking protocols", description: "Cloudflare Learning Center, freeCodeCamp networking course, and Wireshark practice." },
    topic: { title: "Networking Core", slug: "computer-networks-core", description: "OSI/TCP-IP, HTTP, DNS.", estimatedMinutes: 500, sortOrder: 1 },
    resources: [
      { title: "Cloudflare Learning Center", type: "DOCUMENTATION", url: "https://www.cloudflare.com/learning/", provider: "Cloudflare", estimatedMinutes: 150, sortOrder: 1, description: "Clear networking explainers used by developers." },
      { title: "freeCodeCamp — Computer Networking Course", type: "VIDEO", url: "https://www.youtube.com/watch?v=qiQR5rTSshw", provider: "freeCodeCamp", estimatedMinutes: 300, sortOrder: 2, description: "Popular networking full course (~5h)." },
      { title: "Wireshark — Official docs & sample captures", type: "PRACTICE", url: "https://www.wireshark.org/docs/", provider: "Wireshark", estimatedMinutes: 120, sortOrder: 3, description: "Packet analysis practice with real tools." }
    ]
  },
  {
    path: { title: "Java Full Stack Development", slug: "java-full-stack-development", category: "BACKEND", difficulty: "ADVANCED", estimatedHours: 30, iconName: "server", shortDescription: "Spring + frontend integration", description: "Spring guides, Amigoscode full-stack style courses, and Spring Petclinic practice." },
    topic: { title: "Full Stack Java", slug: "java-full-stack-development-core", description: "API + UI + persistence end-to-end.", estimatedMinutes: 1000, sortOrder: 1 },
    resources: [
      { title: "Spring — Building an Application with Spring Boot", type: "DOCUMENTATION", url: "https://spring.io/guides/gs/spring-boot/", provider: "Spring", estimatedMinutes: 90, sortOrder: 1, description: "Official Spring Boot application guide." },
      { title: "Amigoscode — Spring Boot Full Course", type: "VIDEO", url: "https://www.youtube.com/watch?v=9SGDpanrc8U", provider: "Amigoscode", estimatedMinutes: 98, sortOrder: 2, description: "YouTube length ~1h 37m — highly recommended Spring Boot API course." },
      { title: "Spring Petclinic sample", type: "PRACTICE", url: "https://github.com/spring-projects/spring-petclinic", provider: "Spring", estimatedMinutes: 240, sortOrder: 3, description: "Study/extend the canonical Spring sample app." }
    ]
  },
  {
    path: { title: "Advanced Data Structures & Algorithms", slug: "advanced-data-structures-and-algorithms", category: "DSA / PROBLEM SOLVING", difficulty: "ADVANCED", estimatedHours: 50, iconName: "layers", shortDescription: "DP, graphs, trees for interviews", description: "CP-Algorithms, freeCodeCamp DSA mega course, and LeetCode Medium+." },
    topic: { title: "Advanced DSA", slug: "advanced-data-structures-and-algorithms-core", description: "Interview-level algorithms.", estimatedMinutes: 2000, sortOrder: 1 },
    resources: [
      { title: "CP-Algorithms", type: "DOCUMENTATION", url: "https://cp-algorithms.com/", provider: "CP-Algorithms", estimatedMinutes: 600, sortOrder: 1, description: "Deep free algorithm encyclopedia used by competitive programmers." },
      { title: "freeCodeCamp — DSA Mega Course (Java interviews)", type: "VIDEO", url: "https://www.youtube.com/watch?v=xwI5OBEnsZU", provider: "freeCodeCamp", estimatedMinutes: 2930, sortOrder: 2, description: "YouTube listed ~48h 50m mega course for technical interviews." },
      { title: "LeetCode — Top Interview 150", type: "PRACTICE", url: "https://leetcode.com/studyplan/top-interview-150/", provider: "LeetCode", estimatedMinutes: 1200, sortOrder: 3, description: "Curated interview practice plan." }
    ]
  },
  {
    path: { title: "System Design Fundamentals", slug: "system-design-fundamentals", category: "PLACEMENT / CAREER", difficulty: "ADVANCED", estimatedHours: 20, iconName: "briefcase", shortDescription: "Scalable systems", description: "System Design Primer, freeCodeCamp system design course, and practice prompts." },
    topic: { title: "System Design", slug: "system-design-fundamentals-core", description: "Load balancing, caching, databases, CAP.", estimatedMinutes: 700, sortOrder: 1 },
    resources: [
      { title: "System Design Primer (GitHub)", type: "DOCUMENTATION", url: "https://github.com/donnemartin/system-design-primer", provider: "donnemartin", estimatedMinutes: 360, sortOrder: 1, description: "Most-starred free system design curriculum." },
      { title: "freeCodeCamp — System Design for Beginners", type: "VIDEO", url: "https://www.youtube.com/watch?v=m8Icp_Cid5o", provider: "freeCodeCamp / ByteByteGo style listings", estimatedMinutes: 90, sortOrder: 2, description: "Popular system design intro (~1.5h)." },
      { title: "System Design Primer — practice exercises section", type: "PRACTICE", url: "https://github.com/donnemartin/system-design-primer#system-design-interview-questions-with-solutions", provider: "GitHub", estimatedMinutes: 300, sortOrder: 3, description: "Interview prompts with community solutions." }
    ]
  },
  {
    path: { title: "Cloud Engineering (AWS)", slug: "cloud-engineering-aws", category: "ADVANCED", difficulty: "ADVANCED", estimatedHours: 25, iconName: "cpu", shortDescription: "AWS fundamentals", description: "AWS docs, freeCodeCamp AWS course, and AWS Free Tier labs." },
    topic: { title: "AWS Core", slug: "cloud-engineering-aws-core", description: "IAM, EC2, S3, networking basics.", estimatedMinutes: 900, sortOrder: 1 },
    resources: [
      { title: "AWS — Getting Started", type: "DOCUMENTATION", url: "https://aws.amazon.com/getting-started/", provider: "AWS", estimatedMinutes: 180, sortOrder: 1, description: "Official AWS getting started hub." },
      { title: "freeCodeCamp — AWS Certified Cloud Practitioner course", type: "VIDEO", url: "https://www.youtube.com/watch?v=3hLmDS179YE", provider: "freeCodeCamp", estimatedMinutes: 780, sortOrder: 2, description: "Popular AWS Cloud Practitioner prep (~13h)." },
      { title: "AWS Free Tier hands-on tutorials", type: "PRACTICE", url: "https://aws.amazon.com/getting-started/hands-on/", provider: "AWS", estimatedMinutes: 300, sortOrder: 3, description: "Official free-tier labs." }
    ]
  },
  {
    path: { title: "DevOps Engineering", slug: "devops-engineering", category: "ADVANCED", difficulty: "ADVANCED", estimatedHours: 22, iconName: "cpu", shortDescription: "Docker, CI/CD, K8s intro", description: "Docker docs, freeCodeCamp DevOps/Docker courses, and Katacoda/Killercoda practice." },
    topic: { title: "DevOps Tools", slug: "devops-engineering-core", description: "Containers and delivery pipelines.", estimatedMinutes: 800, sortOrder: 1 },
    resources: [
      { title: "Docker — Get Started", type: "DOCUMENTATION", url: "https://docs.docker.com/get-started/", provider: "Docker", estimatedMinutes: 150, sortOrder: 1, description: "Official Docker getting started." },
      { title: "freeCodeCamp — Docker Tutorial for Beginners", type: "VIDEO", url: "https://www.youtube.com/watch?v=fqMOX6JJhGo", provider: "freeCodeCamp / TechWorld with Nana style", estimatedMinutes: 180, sortOrder: 2, description: "Widely recommended Docker beginner course (~3h)." },
      { title: "Killercoda — Docker scenarios", type: "PRACTICE", url: "https://killercoda.com/course/docker", provider: "Killercoda", estimatedMinutes: 180, sortOrder: 3, description: "Browser labs for Docker." }
    ]
  },
  {
    path: { title: "Deep Learning & AI", slug: "deep-learning-and-ai", category: "ADVANCED", difficulty: "ADVANCED", estimatedHours: 20, iconName: "cpu", shortDescription: "Neural nets intuition", description: "PyTorch tutorials, 3Blue1Brown/freeCodeCamp neural nets, and Kaggle DL practice." },
    topic: { title: "Neural Networks", slug: "deep-learning-and-ai-core", description: "Backprop intuition and frameworks.", estimatedMinutes: 700, sortOrder: 1 },
    resources: [
      { title: "PyTorch — Tutorials", type: "DOCUMENTATION", url: "https://pytorch.org/tutorials/", provider: "PyTorch", estimatedMinutes: 240, sortOrder: 1, description: "Official PyTorch learning path." },
      { title: "3Blue1Brown — Neural Networks series", type: "VIDEO", url: "https://www.youtube.com/watch?v=aircAruvnKk", provider: "3Blue1Brown", estimatedMinutes: 20, sortOrder: 2, description: "Famous first episode (~20m) — start of the highly recommended NN series." },
      { title: "Kaggle Learn — Intro to Deep Learning", type: "PRACTICE", url: "https://www.kaggle.com/learn/intro-to-deep-learning", provider: "Kaggle", estimatedMinutes: 180, sortOrder: 3, description: "Interactive DL notebooks." }
    ]
  },
  {
    path: { title: "Blockchain & Web3", slug: "blockchain-and-web3", category: "ADVANCED", difficulty: "ADVANCED", estimatedHours: 24, iconName: "cpu", shortDescription: "Ethereum & Solidity intro", description: "Ethereum docs, freeCodeCamp Solidity course, and Remix practice." },
    topic: { title: "Solidity Basics", slug: "blockchain-and-web3-core", description: "Smart contracts and EVM basics.", estimatedMinutes: 900, sortOrder: 1 },
    resources: [
      { title: "Ethereum.org — Developers docs", type: "DOCUMENTATION", url: "https://ethereum.org/en/developers/docs/", provider: "Ethereum", estimatedMinutes: 180, sortOrder: 1, description: "Official Ethereum developer documentation." },
      { title: "freeCodeCamp — Solidity / Smart Contracts course", type: "VIDEO", url: "https://www.youtube.com/watch?v=gyMwXuJrbJQ", provider: "freeCodeCamp", estimatedMinutes: 960, sortOrder: 2, description: "Popular Patrick Collins freeCodeCamp Solidity course (~16h)." },
      { title: "Remix IDE — try Solidity", type: "PRACTICE", url: "https://remix.ethereum.org/", provider: "Remix", estimatedMinutes: 120, sortOrder: 3, description: "Browser Solidity IDE for experiments." }
    ]
  },
  {
    path: { title: "Advanced Spring Security", slug: "advanced-spring-security", category: "BACKEND", difficulty: "ADVANCED", estimatedHours: 12, iconName: "server", shortDescription: "JWT & OAuth2 with Spring", description: "Spring Security reference, freeCodeCamp/Amigoscode JWT courses, and Spring Security samples." },
    topic: { title: "Spring Security", slug: "advanced-spring-security-core", description: "Authn/z, JWT, OAuth2 resource server.", estimatedMinutes: 450, sortOrder: 1 },
    resources: [
      { title: "Spring Security Reference", type: "DOCUMENTATION", url: "https://docs.spring.io/spring-security/reference/index.html", provider: "Spring", estimatedMinutes: 180, sortOrder: 1, description: "Official Spring Security docs." },
      { title: "Amigoscode — Spring Security / JWT style course", type: "VIDEO", url: "https://www.youtube.com/watch?v=her_7pa0vrg", provider: "Amigoscode / freeCodeCamp listings", estimatedMinutes: 120, sortOrder: 2, description: "Popular Spring Security JWT tutorial (~2h)." },
      { title: "Spring Security Samples", type: "PRACTICE", url: "https://github.com/spring-projects/spring-security-samples", provider: "Spring", estimatedMinutes: 180, sortOrder: 3, description: "Official sample apps to clone and modify." }
    ]
  },
  {
    path: { title: "Microservices Architecture", slug: "microservices-architecture", category: "BACKEND", difficulty: "ADVANCED", estimatedHours: 18, iconName: "server", shortDescription: "Distributed Java services", description: "Microsoft/Spring microservices docs, freeCodeCamp microservices course, and sample repos." },
    topic: { title: "Microservices", slug: "microservices-architecture-core", description: "Service boundaries, messaging, discovery.", estimatedMinutes: 650, sortOrder: 1 },
    resources: [
      { title: "Spring — Microservices with Spring Cloud", type: "DOCUMENTATION", url: "https://spring.io/microservices", provider: "Spring", estimatedMinutes: 120, sortOrder: 1, description: "Official Spring microservices overview." },
      { title: "freeCodeCamp — Microservices with FastAPI Full Course", type: "VIDEO", url: "https://www.youtube.com/watch?v=Cy9fAvsXGZA", provider: "freeCodeCamp", estimatedMinutes: 89, sortOrder: 2, description: "YouTube length ~1h 29m — hands-on microservices with FastAPI/React/Redis." },
      { title: "Spring Cloud Samples", type: "PRACTICE", url: "https://github.com/spring-cloud-samples", provider: "Spring", estimatedMinutes: 240, sortOrder: 3, description: "Sample microservices projects." }
    ]
  },
  {
    path: { title: "Placement Preparation", slug: "placement-preparation", category: "PLACEMENT / CAREER", difficulty: "ADVANCED", estimatedHours: 40, iconName: "briefcase", shortDescription: "Interview readiness", description: "Tech Interview Handbook, DSA mega course, and LeetCode study plans." },
    topic: { title: "Interview Prep", slug: "placement-preparation-core", description: "DSA + behavioral + system design lite.", estimatedMinutes: 1800, sortOrder: 1 },
    resources: [
      { title: "Tech Interview Handbook", type: "DOCUMENTATION", url: "https://www.techinterviewhandbook.org/", provider: "yangshun", estimatedMinutes: 240, sortOrder: 1, description: "Widely recommended free interview guide." },
      { title: "freeCodeCamp — Algorithms & Data Structures Full Course", type: "VIDEO", url: "https://www.youtube.com/watch?v=8hly31xKli0", provider: "freeCodeCamp", estimatedMinutes: 322, sortOrder: 2, description: "5h 22m beginner-to-interview DSA foundation (real YouTube length)." },
      { title: "LeetCode — Blind 75 / study plans", type: "PRACTICE", url: "https://leetcode.com/studyplan/leetcode-75/", provider: "LeetCode", estimatedMinutes: 1500, sortOrder: 3, description: "Structured interview problem practice." }
    ]
  }
];
