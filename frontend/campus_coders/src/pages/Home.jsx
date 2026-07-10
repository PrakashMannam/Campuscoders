import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheck, FiFolder, FiMessageSquare, FiZap } from 'react-icons/fi';

export default function Home() {
  const navigate = useNavigate();
  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (!feedbackName || !feedbackText) return;
    
    // Simulate feedback submission
    setSubmitted(true);
    setSuccessMessage('');
    setTimeout(() => {
      setFeedbackName('');
      setFeedbackText('');
      setSubmitted(false);
      setSuccessMessage('Thank you for your valuable feedback!');
      
      // Auto clear after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    }, 1000);
  };

  const handleGetStarted = () => {
    navigate('/register');
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* SECTION 1: HERO SECTION */}
      <section id="home" className="hero-section">
        

        {/* Headline */}
        <h1>
          Everything Your College <span className="highlight">Engineering</span> Needs.
        </h1>

        {/* Subtitle */}
        <p className="hero-subtitle">
          Empowering the next generation of engineers with high-fidelity resources, collaborative discussions, and real-time updates. Join the elite community of Campus Coders.
        </p>

        {/* CTA Button */}
        <button className="btn btn-dark" style={{ padding: '14px 36px', fontSize: '1rem' }} onClick={handleGetStarted}>
          Get Started
        </button>
      </section>

      {/* SECTION 2: STATS & SUMMARY SECTION */}
      <section id="about" className="stats-section">
        <div className="stats-copy">
          <span className="badge-tag">ENGINEERING EXCELLENCE</span>
          <h2>Empowering the Engineers of Tomorrow.</h2>
          <p>
            Campus Coders is more than just a platform; it's a mission-driven ecosystem designed for engineering excellence. We believe in providing every student with the tools they need to transcend traditional academic boundaries.
          </p>

          <div className="check-list">
            <div className="check-item">
              <span className="check-icon">
                <FiCheck size={12} />
              </span>
              <span>High-fidelity curated technical resources.</span>
            </div>
            <div className="check-item">
              <span className="check-icon">
                <FiCheck size={12} />
              </span>
              <span>Global community collaboration for real-world projects.</span>
            </div>
            <div className="check-item">
              <span className="check-icon">
                <FiCheck size={12} />
              </span>
              <span>Mentorship from industry-leading technical experts.</span>
            </div>
          </div>
        </div>

        
      </section>

      {/* SECTION 3: FEATURES SECTION */}
      <section id="features" className="features-section-wrapper">
        <div className="features-section">
          <h2>Powerful Features for Growth</h2>
          <p className="subtitle">
            Every tool you need to excel in your technical journey, integrated into a single seamless experience.
          </p>

          <div className="feature-cards-grid">
            {/* Card 1 */}
            <div className="feature-card">
              <div className="feature-icon-wrapper blue">
                <FiFolder size={20} />
              </div>
              <h3>Resource Hub</h3>
              <p>
                Access thousands of technical papers, coding templates, and academic notes curated by top faculty.
              </p>
            </div>

            {/* Card 2 */}
            <div className="feature-card">
              <div className="feature-icon-wrapper pink">
                <FiMessageSquare size={20} />
              </div>
              <h3>Community Collab</h3>
              <p>
                Engage in threaded discussions, solve bugs collectively, and find partners for your next big project.
              </p>
            </div>

            {/* Card 3 */}
            <div className="feature-card">
              <div className="feature-icon-wrapper gold">
                <FiZap size={20} />
              </div>
              <h3>Live Feed</h3>
              <p>
                Stay updated with instant notifications on hackathons, campus events, and tech news across the globe.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: FEEDBACK / INPUT SECTION */}
      <section id="feedback" className="feedback-section">
        <div className="feedback-card">
          {/* Info */}
          <div className="feedback-info">
            <h2>We value your input</h2>
            <p>
              Help us shape the future of Campus Coders. Tell us what features you want to see next or report any issues.
            </p>

            <div className="feedback-contributors">
              <div className="contributor-avatars">
                {/* Visual Avatar Placeholders using inline styled circles/images */}
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#D4AF37',
                  border: '2px solid #0F1115',
                  marginRight: '-10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: '0.65rem',
                  color: '#4A3B00'
                }}>JD</div>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#FFF0FB',
                  border: '2px solid #0F1115',
                  marginRight: '-10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: '0.65rem',
                  color: '#D61B9E'
                }}>AR</div>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#EEF5FF',
                  border: '2px solid #0F1115',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: '0.65rem',
                  color: '#1E6BFA'
                }}>PM</div>
              </div>
              <span className="contributors-text">Join 500+ daily contributors</span>
            </div>
          </div>

          {/* Form */}
          <form className="feedback-form" onSubmit={handleFeedbackSubmit}>
            {successMessage && (
              <div style={{
                backgroundColor: '#ECFDF5',
                color: '#059669',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 600,
                border: '1px solid #A7F3D0',
                marginBottom: '10px'
              }}>
                {successMessage}
              </div>
            )}
            <input
              type="text"
              placeholder="Your Name"
              value={feedbackName}
              onChange={(e) => setFeedbackName(e.target.value)}
              required
            />
            <textarea
              placeholder="Your feedback or suggestions..."
              rows="4"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '14px', width: '100%', fontWeight: 700 }}>
              {submitted ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
