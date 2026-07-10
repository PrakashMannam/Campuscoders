import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiGrid, FiBook, FiMessageSquare, FiVolume2, FiBell, FiUser, FiSettings, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

const navItems = [
  { to: '/dashboard',               icon: <FiGrid size={18} />,          label: 'Dashboard',     end: true },
  { to: '/dashboard/resources',      icon: <FiBook size={18} />,          label: 'Resources',     end: false },
  { to: '/dashboard/discussions',    icon: <FiMessageSquare size={18} />, label: 'Discussions',    end: false },
  { to: '/dashboard/announcements',  icon: <FiVolume2 size={18} />,       label: 'Announcements', end: false },
];

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
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
    : 'U';

  return (
    <div className="dl-wrapper">
      {/* ── Sidebar ── */}
      <aside className="dl-sidebar">
        <div className="dl-sidebar-brand">
          <Logo size={36} showText={true} layout="inline" theme="light" />
        </div>

        <div className="dl-sidebar-label">MAIN MENU</div>

        <nav className="dl-sidebar-nav">
          {navItems.map(item => (
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
      </aside>

      {/* ── Main area ── */}
      <div className="dl-main">
        {/* Top bar */}
        <header className="dl-topbar">
          <div className="dl-topbar-right">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '4px' }}>
              <span 
                className="dl-xp-badge"
                style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: 800, 
                  color: '#8C701B', 
                  background: '#FFFBE6', 
                  border: '1px solid #FCE8B2', 
                  padding: '4px 10px', 
                  borderRadius: '12px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px',
                  fontFamily: 'var(--font-title)'
                }}
              >
                ⚡ {user?.xp || 120} XP
              </span>
            </div>

            <button 
              className="dl-topbar-bell" 
              id="notification-bell" 
              aria-label="Notifications"
              onClick={() => navigate('/dashboard/notifications')}
            >
              <FiBell size={20} />
            </button>

            <div className="dl-profile-wrapper" ref={dropdownRef}>
              <button
                className="dl-avatar-btn"
                id="profile-avatar-btn"
                onClick={() => setDropdownOpen(prev => !prev)}
                aria-label="Open profile menu"
              >
                <div className="dl-avatar">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Profile" className="dl-avatar-img-round" />
                  ) : (
                    userInitials
                  )}
                </div>
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div className="dl-dropdown" id="profile-dropdown">
                  <div className="dl-dropdown-user">
                    <div className="dl-dropdown-avatar">
                      {user?.avatar ? (
                        <img src={user.avatar} alt="Profile" className="dl-avatar-img-round" />
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

                  <button
                    className="dl-dropdown-item"
                    id="dropdown-profile"
                    onClick={() => { setDropdownOpen(false); navigate('/dashboard/profile'); }}
                  >
                    <FiUser size={16} />
                    <span>My Profile</span>
                  </button>

                  <button
                    className="dl-dropdown-item"
                    id="dropdown-settings"
                    onClick={() => { setDropdownOpen(false); navigate('/dashboard/settings'); }}
                  >
                    <FiSettings size={16} />
                    <span>Settings</span>
                  </button>

                  <div className="dl-dropdown-divider" />

                  <button
                    className="dl-dropdown-item dl-dropdown-logout"
                    id="dropdown-logout"
                    onClick={handleLogout}
                  >
                    <FiLogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="dl-content">
          {children}
        </div>
      </div>
    </div>
  );
}
