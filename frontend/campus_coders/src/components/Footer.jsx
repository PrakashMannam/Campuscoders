import React from 'react';
import { FiMail, FiPhone } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';
import Logo from './Logo';

export default function Footer() {
  const location = useLocation();
  const isAuthPage = ['/login', '/register', '/verify-otp', '/forgot-password'].includes(location.pathname);

  // If on an auth page, we do not render the main footer (it has its own simple footer)
  if (isAuthPage) {
    return null;
  }

  const handleScrollTo = (elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="footer-wrapper">
      <div className="footer-main">
        {/* Brand Column */}
        <div className="footer-logo-col">
          <div className="brand" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <Logo size={24} showText={false} />
            <span style={{ fontWeight: 700 }}>
              <span style={{ color: '#0F1115' }}>Campus</span>
              <span style={{ color: '#D4AF37' }}>Coders</span>
            </span>
          </div>
          <p>
            The ultimate platform for engineering students to connect, learn, and build the future of technology together.
          </p>
        </div>

        {/* Quick Links Column */}
        <div className="footer-links-col">
          <div className="footer-title">Quick Links</div>
          <ul>
            <li>
              <button 
                onClick={() => handleScrollTo('home')} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                className="footer-contact-item"
              >
                Home
              </button>
            </li>
            <li>
              <button 
                onClick={() => handleScrollTo('about')} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                className="footer-contact-item"
              >
                About Us
              </button>
            </li>
            <li>
              <button 
                onClick={() => handleScrollTo('features')} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                className="footer-contact-item"
              >
                Features
              </button>
            </li>
            <li>
              <button 
                onClick={() => handleScrollTo('feedback')} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                className="footer-contact-item"
              >
                Feedback
              </button>
            </li>
          </ul>
        </div>

        {/* Support Column */}
        <div className="footer-contact-col">
          <div className="footer-title">Support Contact</div>
          <ul>
            <li className="footer-contact-item">
              <span className="footer-contact-icon">
                <FiMail size={16} />
              </span>
              <a href="mailto:support@campuscoders.edu">support@campuscoders.edu</a>
            </li>
            <li className="footer-contact-item">
              <span className="footer-contact-icon">
                <FiPhone size={16} />
              </span>
              <span>+1 (555) TECH-PRO</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        © 2023 CAMPUS CODERS. ALL RIGHTS RESERVED. ACADEMIC TECHNICAL MODERNISM V2.0
      </div>
    </footer>
  );
}
