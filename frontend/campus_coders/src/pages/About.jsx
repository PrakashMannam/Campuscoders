function About() {
  return (
    <div className="page">
      <section className="section">
        <div className="section-header">
          <p className="badge">About Us</p>
          <h2>About Campus Coders</h2>
          <p className="section-text">
            A college-focused platform built for students to study, collaborate, and
            prepare for interviews and placements — all in one place.
          </p>
        </div>

        <div className="info-box">
          <h3>🎯 What the platform offers</h3>
          <ul>
            <li>Announcements for events, webinars, and college notices</li>
            <li>Curated resources — notes, PDFs, cheat sheets, and video links</li>
            <li>Student dashboard with progress tracking and daily streaks</li>
            <li>Admin tools for managing content, students, and resources</li>
          </ul>
        </div>
      </section>
    </div>
  );
}

export default About;
