import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isAuthPage = ['/login', '/register', '/verify-otp', '/forgot-password'].includes(location.pathname);

  // If we are on an auth page, we don't display the standard header navbar, or we display a simplified header.
  // Looking at the screenshots:
  // - Login and Register pages have a top line: Left: "Back to Home", Center: "Campus Coders" (in gold).
  // - OTP Verification page has: Center: Campus Coders Logo + Text.
  // So we handle rendering individual simplified headers inside the auth page components directly, 
  // and only render this main Navbar on public landing/other standard pages.
  if (isAuthPage) {
    return null; 
  }

  // Helper to handle smooth scroll on landing page
  const handleScrollTo = (elementId) => {
    if (location.pathname !== '/') {
      navigate('/#' + elementId);
      return;
    }
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="navbar-wrapper">
      <div className="navbar">
        {/* Brand */}
        <Link to="/" className="brand" onClick={() => handleScrollTo('home')}>
          <Logo size={38} showText={true} layout="inline" theme="light" />
        </Link>

        {/* Links (Guest/Home) */}
        {!user && (
          <nav className="nav-links">
            <button className="btn btn-secondary nav-link" onClick={() => handleScrollTo('home')}>Home</button>
            <button className="btn btn-secondary nav-link" onClick={() => handleScrollTo('about')}>About</button>
            <button className="btn btn-secondary nav-link" onClick={() => handleScrollTo('features')}>Features</button>
            <button className="btn btn-secondary nav-link" onClick={() => handleScrollTo('feedback')}>Feedback</button>
          </nav>
        )}

        {/* Action buttons */}
        <div className="nav-actions">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0F1115' }}>
                Hi, {user.name.split(' ')[0]}!
              </span>
              {user.role === 'student' ? (
                <Link to="/dashboard" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                  Dashboard
                </Link>
              ) : (
                <Link to="/admin" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                  Admin Panel
                </Link>
              )}
              <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="nav-login">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary nav-signup">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
