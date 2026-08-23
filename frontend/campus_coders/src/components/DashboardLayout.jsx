import React, { useState, useRef, useEffect, useCallback } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  FiGrid, FiBook, FiBookOpen, FiMessageSquare, FiVolume2, FiBell,
  FiUser, FiSettings, FiLogOut, FiMenu, FiMoon, FiSun,
  FiCode, FiCalendar, FiBriefcase
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Logo from './Logo';
import api from '../api/client';

const navGroups = [
  {
    label: 'Today',
    items: [{ to: '/dashboard', icon: <FiGrid size={18} />, label: 'Dashboard', end: true }],
  },
  {
    label: 'Learn',
    items: [
      { to: '/dashboard/resources', icon: <FiBook size={18} />, label: 'Learning', end: false },
      { to: '/dashboard/my-learning', icon: <FiBookOpen size={18} />, label: 'My Learning', end: false },
    ],
  },
  {
    label: 'Practice',
    items: [
      { to: '/dashboard/practice', icon: <FiCode size={18} />, label: "Today's Problem", end: false },
      { to: '/dashboard/events', icon: <FiCalendar size={18} />, label: 'Events', end: false },
    ],
  },
  {
    label: 'Discuss',
    items: [
      { to: '/dashboard/discussions', icon: <FiMessageSquare size={18} />, label: 'Discussions', end: false },
      { to: '/dashboard/announcements', icon: <FiVolume2 size={18} />, label: 'Announcements', end: false },
    ],
  },
  {
    label: 'Prepare',
    items: [
      { to: '/dashboard/placement', icon: <FiBriefcase size={18} />, label: 'Placement', end: false },
    ],
  },
];

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/dashboard/resources': 'Learning',
  '/dashboard/my-learning': 'My Learning',
  '/dashboard/practice': 'Practice',
  '/dashboard/events': 'Events',
  '/dashboard/discussions': 'Discussions',
  '/dashboard/announcements': 'Announcements',
  '/dashboard/placement': 'Placement',
  '/dashboard/notifications': 'Notifications',
  '/dashboard/profile': 'Profile',
  '/dashboard/settings': 'Settings',
  '/dashboard/change-password': 'Password',
};

function titleForPath(pathname) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith('/dashboard/resources')) return 'Learning';
  if (pathname.startsWith('/dashboard/discussions')) return 'Discussions';
  if (pathname.startsWith('/dashboard/practice')) return 'Practice';
  if (pathname.startsWith('/dashboard/events')) return 'Events';
  if (pathname.startsWith('/dashboard/my-learning')) return 'My Learning';
  if (pathname.startsWith('/dashboard/placement')) return 'Placement';
  return 'Campus Coders';
}

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const dropdownRef = useRef(null);

  const refreshUnread = useCallback(() => {
    api.get('/dashboard/summary')
      .then((res) => {
        setUnread(res.data.unreadNotificationsCount || 0);
      })
      .catch(() => { });
  }, []);

  useEffect(() => {
    refreshUnread();
  }, [location.pathname, refreshUnread]);

  useEffect(() => {
    const onNotificationsChanged = () => refreshUnread();
    window.addEventListener('campuscoders:notifications-changed', onNotificationsChanged);
    return () => window.removeEventListener('campuscoders:notifications-changed', onNotificationsChanged);
  }, [refreshUnread]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/');
  };



  const userInitials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <div className="dl-wrapper student-shell">

      {menuOpen && <button type="button" className="dl-backdrop" aria-label="Close menu" onClick={() => setMenuOpen(false)} />}

      <aside className={`dl-sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="dl-sidebar-brand">
          <Logo size={36} showText={true} layout="inline" />
        </div>

        <nav className="dl-sidebar-nav">
          {navGroups.map((group) => (
            <div key={group.label} className="dl-nav-group">
              <div className="dl-sidebar-label">{group.label}</div>
              {group.items.map((item) => (
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
            </div>
          ))}
        </nav>
      </aside>

      <div className="dl-main">
        <header className="dl-topbar">
          <div className="dl-topbar-left">
            <button type="button" className="dl-menu-btn" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
              <FiMenu size={20} />
            </button>
            <h1 className="dl-page-title">{titleForPath(location.pathname)}</h1>
          </div>

          <div className="dl-topbar-right">
            <button type="button" className="theme-toggle-btn" aria-label="Toggle theme" onClick={toggleTheme}>
              {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>
            <button
              className="dl-topbar-bell"
              id="notification-bell"
              aria-label="Notifications"
              onClick={() => navigate('/dashboard/notifications')}
            >
              <FiBell size={20} />
              {unread > 0 && (
                <span className="dl-bell-badge">{unread > 99 ? '99+' : unread}</span>
              )}
            </button>
            <div className="dl-profile-wrapper" ref={dropdownRef}>
              <button
                  className="dl-avatar-btn"
                  id="profile-avatar-btn"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  aria-label="Open profile menu"
                >
                  <div className="dl-avatar">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="" className="dl-avatar-img-round" />
                    ) : (
                      userInitials
                    )}
                  </div>
                </button>

                {dropdownOpen && (
                  <div className="dl-dropdown" id="profile-dropdown">
                    <div className="dl-dropdown-user">
                      <div className="dl-dropdown-avatar">
                        {user?.avatar ? (
                          <img src={user.avatar} alt="" className="dl-avatar-img-round" />
                        ) : (
                          userInitials
                        )}
                      </div>
                      <div className="dl-dropdown-info">
                        <span className="dl-dropdown-name">{user?.name}</span>
                        <span className="dl-dropdown-email">{user?.email}</span>
                      </div>
                    </div>
                    <div className="dl-dropdown-divider" />
                    <button className="dl-dropdown-item" onClick={() => { setDropdownOpen(false); navigate('/dashboard/profile'); }}>
                      <FiUser size={16} />
                      <span>My Profile</span>
                    </button>
                    <button className="dl-dropdown-item" onClick={() => { setDropdownOpen(false); navigate('/dashboard/settings'); }}>
                      <FiSettings size={16} />
                      <span>Settings</span>
                    </button>
                    <div className="dl-dropdown-divider" />
                    <button className="dl-dropdown-item dl-dropdown-logout" onClick={handleLogout}>
                      <FiLogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
        </header>

        <div className="dl-content">
          {children}
        </div>
      </div>
    </div>
  );
}
