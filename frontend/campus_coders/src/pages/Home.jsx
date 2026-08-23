import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiBookOpen, FiMessageSquare, FiCode, FiVolume2, FiCalendar, FiBriefcase } from 'react-icons/fi';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handlePrimaryCTA = () => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } else {
      navigate('/register');
    }
  };

  const handleSecondaryCTA = () => {
    if (!user) {
      const el = document.getElementById('features');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      const el = document.getElementById('how');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-page">
      <section id="home" className="hero-section hero-grid">
        <div className="hero-content">
          <div className="badge-live">
            <span className="badge-live-dot"></span>
            Engineering learning workspace
          </div>

          <h1>
            The coding workspace for <span className="highlight">students and aspiring engineers.</span>
          </h1>

          <p className="hero-subtitle">
            Daily problems as curated links, learning paths, discussions, and announcements - in one place for students and admins.
          </p>

          <div className="hero-ctas">
            <button type="button" className="btn btn-primary hero-btn" onClick={handlePrimaryCTA}>
              {user ? (user.role === 'admin' ? 'Open admin' : 'Open dashboard') : 'Start coding'}
            </button>
            <button type="button" className="btn btn-secondary hero-btn-outline" onClick={handleSecondaryCTA}>
              {user ? 'See how it works' : 'Explore features'}
            </button>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="radial-glow"></div>
          <div className="mock-dashboard">
            <div className="mock-sidebar">
              <div className="mock-logo">
                <span className="mock-logo-c">C</span>
                <span className="mock-logo-text">CampusCoders</span>
              </div>
              <div className="mock-nav-item active">Dashboard</div>
              <div className="mock-nav-item">Learning</div>
              <div className="mock-nav-item">Practice</div>
              <div className="mock-nav-item">Discussions</div>
              <div className="mock-nav-item">Placement</div>
            </div>
            <div className="mock-main">
              <div className="mock-header">
                <div className="mock-greeting">Welcome back</div>
              </div>
              <div className="mock-grid">
                <div className="mock-col-left">
                  <div className="mock-card">
                    <div className="mock-card-title">Today's challenge</div>
                    <div className="mock-potd-box">
                      <div className="mock-potd-icon">&lt;/&gt;</div>
                      <div className="mock-potd-info">Problem of the day</div>
                    </div>
                  </div>
                  <div className="mock-card">
                    <div className="mock-card-title">Learning paths</div>
                    <div className="mock-progress-bar"><div className="mock-progress-fill" style={{ width: '55%' }}></div></div>
                    <div className="mock-progress-bar" style={{ marginTop: 8 }}><div className="mock-progress-fill" style={{ width: '35%' }}></div></div>
                  </div>
                </div>
                <div className="mock-col-right">
                  <div className="mock-card">
                    <div className="mock-card-title">Announcements</div>
                    <div className="mock-skel-line"></div>
                    <div className="mock-skel-line mock-skel-short"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="features-section-wrapper">
        <div className="features-section">
          <h2>How it works</h2>
          <p className="subtitle">
            Three steps. No extra apps. A shared workspace to build your developer identity.
          </p>
          <div className="how-cards">
            <div className="how-card">
              <div className="step-number">1</div>
              <h3>Create an account</h3>
              <p>Register with your email, then sign in to a student dashboard or an admin workspace.</p>
            </div>
            <div className="how-card">
              <div className="step-number">2</div>
              <h3>Practice every day</h3>
              <p>Open the problem of the day, follow a learning path, and mark resources complete as you go.</p>
            </div>
            <div className="how-card">
              <div className="step-number">3</div>
              <h3>Discuss and learn</h3>
              <p>Join discussions and stay updated.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="features-section landing-features">
        <h2>What's included</h2>
        <p className="subtitle">
          Only what the product actually has - not a marketing catalog.
        </p>
        <div className="feature-cards-grid landing-feature-grid">
          <div className="feature-card">
            <div className="feature-icon-wrapper gold"><FiCode size={20} /></div>
            <h3>Daily challenge</h3>
            <p>A curated coding problem link for today - practice if you want.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon-wrapper gold"><FiBookOpen size={20} /></div>
            <h3>Learning paths</h3>
            <p>Curated topics and resources, with progress you can track.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon-wrapper gold"><FiMessageSquare size={20} /></div>
            <h3>Discussions</h3>
            <p>Threads, replies, votes, and categories for questions.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon-wrapper gold"><FiVolume2 size={20} /></div>
            <h3>Announcements</h3>
            <p>Official updates from the admin team, with optional links.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon-wrapper gold"><FiCalendar size={20} /></div>
            <h3>Events</h3>
            <p>Upcoming contests, sessions, and campus events.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon-wrapper gold"><FiBriefcase size={20} /></div>
            <h3>Placement Prep</h3>
            <p>Core resources and guides for technical interviews.</p>
          </div>
        </div>
      </section>

      <section id="who" className="who-section">
        <div className="who-grid">
          <div className="who-card">
            <h3>For students</h3>
            <p>Show up for the daily problem, move through paths, bookmark resources, and join discussions.</p>
          </div>
          <div className="who-card">
            <h3>For admins</h3>
            <p>Publish paths, resources, daily challenges, and announcements, and moderate discussions.</p>
          </div>
        </div>
      </section>

      <section className="landing-cta">
        <h2>{user ? 'Jump back into your workspace' : 'Ready to start?'}</h2>
        <p>{user ? 'Open the app you already use.' : 'Create a free account and go to your dashboard.'}</p>
        <button type="button" className="btn btn-primary" onClick={handlePrimaryCTA}>
          {user ? (user.role === 'admin' ? 'Open admin' : 'Open dashboard') : 'Start coding'}
        </button>
      </section>
    </div>
  );
}
