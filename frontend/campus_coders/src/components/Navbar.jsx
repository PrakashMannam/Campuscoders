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

  const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'].includes(location.pathname);

  if (isAuthPage) {
    return null;
  }

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
        <div className="nav-left">
          <Link to="/" className="brand" onClick={() => handleScrollTo('home')}>
            <Logo size={38} showText={true} layout="inline" theme="light" />
          </Link>
          <nav className="nav-links" aria-label="Landing">
            <button type="button" className="btn btn-secondary nav-link" onClick={() => handleScrollTo('how')}>
              How it works
            </button>
            <button type="button" className="btn btn-secondary nav-link" onClick={() => handleScrollTo('features')}>
              Features
            </button>
            <button type="button" className="btn btn-secondary nav-link" onClick={() => handleScrollTo('who')}>
              For students
            </button>
          </nav>
        </div>

        <div className="nav-actions">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span className="nav-hello">
                Hi, {user.name.split(' ')[0]}!
              </span>
              {user.role === 'student' ? (
                <Link to="/dashboard" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                  Open dashboard
                </Link>
              ) : (
                <Link to="/admin" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                  Open admin
                </Link>
              )}
              <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                Sign in
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
