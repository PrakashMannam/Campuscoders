import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  FiGrid, FiList, FiBook, FiMessageSquare, FiVolume2, FiTarget,
  FiUsers, FiAward, FiPieChart, FiSettings, FiBell, FiLogOut, FiUser
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

const adminNavItems = [
  { to: '/admin',                  icon: <FiGrid size={18} />,          label: 'Dashboard',       end: true },
  { to: '/admin/learning-paths',   icon: <FiList size={18} />,          label: 'Learning Paths',  end: false },
  { to: '/admin/resources',        icon: <FiBook size={18} />,          label: 'Resources',       end: false },
  { to: '/admin/topics',           icon: <FiMessageSquare size={18} />, label: 'Topics',          end: false },
  { to: '/admin/announcements',    icon: <FiVolume2 size={18} />,       label: 'Announcements',   end: false },
  { to: '/admin/challenges',       icon: <FiTarget size={18} />,        label: 'Daily Challenges',end: false },
  { to: '/admin/users',            icon: <FiUsers size={18} />,         label: 'Users',           end: false },
  { to: '/admin/community',        icon: <FiMessageSquare size={18} />, label: 'Community',       end: false },
  { to: '/admin/leaderboard',      icon: <FiAward size={18} />,         label: 'Leaderboard',     end: false },
  { to: '/admin/reports',          icon: <FiPieChart size={18} />,      label: 'Reports',         end: false },
  { to: '/admin/settings',         icon: <FiSettings size={18} />,      label: 'Settings',        end: false },
];

export default function AdminLayout({ children }) {
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
    : 'A';

  return (
    <div className="dl-wrapper">
      {/* ── Sidebar ── */}
      <aside className="dl-sidebar">
        <div className="dl-sidebar-brand" style={{ paddingBottom: '20px' }}>
          <Logo size={28} showText={true} layout="inline" theme="light" />
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 800, marginTop: '4px', paddingLeft: '40px', letterSpacing: '1px' }}>ADMIN PANEL</div>
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
        
        {/* User Badge at bottom of sidebar */}
        <div style={{ marginTop: 'auto', padding: '16px', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setDropdownOpen(prev => !prev)} ref={dropdownRef}>
            <div className="dl-avatar" style={{ width: '40px', height: '40px' }}>
              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" className="dl-avatar-img-round" />
              ) : (
                userInitials
              )}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111827', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user?.name || 'Admin User'}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user?.email || 'admin@campuscoders.com'}</div>
            </div>
          </div>
          
          {dropdownOpen && (
            <div className="dl-dropdown" style={{ bottom: '70px', top: 'auto' }}>
              <button className="dl-dropdown-item dl-dropdown-logout" onClick={handleLogout}>
                <FiLogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="dl-main" style={{ background: '#f8fafc' }}>
        {/* Top bar */}
        <header className="dl-topbar" style={{ background: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
             {/* Optional breadcrumbs could go here */}
          </div>
          <div className="dl-topbar-right">
            <button className="dl-topbar-bell">
              <FiBell size={20} />
              <span style={{ position: 'absolute', top: '8px', right: '10px', background: '#d97706', width: '8px', height: '8px', borderRadius: '50%' }}></span>
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '16px', borderLeft: '1px solid #e2e8f0' }}>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Admin</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Super Admin</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="dl-content" style={{ padding: '32px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
