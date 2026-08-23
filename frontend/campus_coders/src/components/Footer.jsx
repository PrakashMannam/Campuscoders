import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

export default function Footer() {
  const location = useLocation();
  const { user } = useAuth();
  const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'].includes(location.pathname);

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
            Your engineering learning workspace: practice, paths, and discussions.
          </p>
        </div>

        {/* Quick Links Column */}
        <div className="footer-links-col">
          <div className="footer-title">Links</div>
          <ul>
            <li>
              <button type="button" onClick={() => handleScrollTo('how')} className="footer-contact-item footer-link-btn">
                How it works
              </button>
            </li>
            <li>
              <button type="button" onClick={() => handleScrollTo('features')} className="footer-contact-item footer-link-btn">
                Features
              </button>
            </li>
            <li>
              <Link to="/privacy" className="footer-contact-item">Privacy</Link>
            </li>
            <li>
              <Link to="/terms" className="footer-contact-item">Terms</Link>
            </li>
            {!user ? (
              <>
                <li>
                  <Link to="/login" className="footer-contact-item">Sign in</Link>
                </li>
                <li>
                  <Link to="/register" className="footer-contact-item">Create account</Link>
                </li>
              </>
            ) : (
              <li>
                <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="footer-contact-item">
                  {user.role === 'admin' ? 'Open admin' : 'Open dashboard'}
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        &copy; {new Date().getFullYear()} Campus Coders. All rights reserved.
      </div>
    </footer>
  );
}
