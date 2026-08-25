import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FiGrid, FiList, FiBook, FiHash, FiVolume2, FiTarget, FiCalendar,
  FiUsers, FiMessageCircle, FiLogOut, FiMoon, FiSun, FiFolder
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Logo from './Logo';
import '../pages/admin/admin.css';

const adminNavItems = [
  { to: '/admin', icon: <FiGrid size={18} />, label: 'Dashboard', end: true },
  { to: '/admin/learning-paths', icon: <FiList size={18} />, label: 'Learning Paths' },
  { to: '/admin/resources', icon: <FiBook size={18} />, label: 'Resources' },
  { to: '/admin/topics', icon: <FiHash size={18} />, label: 'Topics' },
  { to: '/admin/announcements', icon: <FiVolume2 size={18} />, label: 'Announcements' },
  { to: '/admin/challenges', icon: <FiTarget size={18} />, label: 'Daily Challenges' },
  { to: '/admin/events', icon: <FiCalendar size={18} />, label: 'Contests & events' },
  { to: '/admin/users', icon: <FiUsers size={18} />, label: 'Users' },
  { to: '/admin/community', icon: <FiMessageCircle size={18} />, label: 'Community' },
  { to: '/admin/discussion-categories', icon: <FiFolder size={18} />, label: 'Categories' },
];

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/');
  };

  const userInitials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'A';

  return (
    <div className="dl-wrapper admin-shell">
      <aside className="dl-sidebar">
        <div className="admin-brand">
          <Logo size={28} showText={true} layout="inline" />
          <div className="admin-brand-label">ADMIN</div>
        </div>

        <nav className="dl-sidebar-nav">
          {adminNavItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `dl-nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="dl-nav-icon">{item.icon}</span>
              <span className="dl-nav-text">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-user-block" ref={dropdownRef}>
          <button type="button" className="admin-user-row" onClick={() => setDropdownOpen(prev => !prev)}>
            <div className="dl-avatar">{userInitials}</div>
            <div className="admin-user-meta">
              <div className="admin-user-name">{user?.name || 'Admin'}</div>
              <div className="admin-user-email">{user?.email || ''}</div>
            </div>
          </button>
          {dropdownOpen && (
            <div className="dl-dropdown admin-logout-pop">
              <button className="dl-dropdown-item dl-dropdown-logout" onClick={handleLogout}>
                <FiLogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      <div className="dl-main">
        <header className="dl-topbar">
          <div className="dl-topbar-right" style={{ width: '100%', justifyContent: 'flex-end', gap: 14 }}>
            <button
              type="button"
              className="theme-toggle-btn"
              aria-label="Toggle theme"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>
            <div className="admin-top-role">
              <strong>{user?.name || 'Admin'}</strong>
              <span>Administrator</span>
            </div>
          </div>
        </header>
        <div className="dl-content">{children}</div>
      </div>
    </div>
  );
}
