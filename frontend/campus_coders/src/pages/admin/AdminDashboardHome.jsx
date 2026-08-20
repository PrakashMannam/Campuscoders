import React from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiTrendingUp, FiBook, FiTarget } from 'react-icons/fi';
import { MOCK_USERS, MOCK_PATHS, MOCK_RESOURCES, MOCK_CHALLENGES, loadStore } from './adminMockData';

export default function AdminDashboardHome() {
  const users = loadStore('users', MOCK_USERS);
  const paths = loadStore('paths', MOCK_PATHS);
  const resources = loadStore('resources', MOCK_RESOURCES);
  const challenges = loadStore('challenges', MOCK_CHALLENGES);

  const stats = [
    { label: 'Users', value: users.length, icon: <FiUsers size={22} />, color: '#4f46e5', bg: '#EEF2FF' },
    { label: 'Active', value: users.filter(u => u.enabled && !u.banned).length, icon: <FiTrendingUp size={22} />, color: '#059669', bg: '#ECFDF5' },
    { label: 'Learning paths', value: paths.length, icon: <FiBook size={22} />, color: '#d97706', bg: '#FFFBEB' },
    { label: 'Challenges', value: challenges.length, icon: <FiTarget size={22} />, color: '#db2777', bg: '#FDF2F8' },
  ];

  const shortcuts = [
    { to: '/admin/users', title: 'Users', desc: 'Roles, status and XP' },
    { to: '/admin/resources', title: 'Resources', desc: `${resources.length} items in catalog` },
    { to: '/admin/learning-paths', title: 'Learning paths', desc: 'Order curriculum' },
    { to: '/admin/challenges', title: 'Daily challenges', desc: 'Schedule problem of the day' },
    { to: '/admin/announcements', title: 'Announcements', desc: 'Banners and alerts' },
    { to: '/admin/community', title: 'Community', desc: 'Moderation queue' },
    { to: '/admin/reports', title: 'Reports', desc: 'Usage overview' },
    { to: '/admin/settings', title: 'Settings', desc: 'Platform controls' },
  ];

  return (
    <div>
      <div className="ap-header">
        <div>
          <h1 className="ap-page-title">Dashboard</h1>
          <p className="ap-page-sub">Overview of the CampusCoders admin tools</p>
        </div>
      </div>

      <div className="ap-stat-grid">
        {stats.map(card => (
          <div key={card.label} className="ap-stat">
            <div className="ap-stat-icon" style={{ background: card.bg, color: card.color }}>{card.icon}</div>
            <div>
              <div className="ap-stat-label">{card.label}</div>
              <div className="ap-stat-value">{card.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="ap-quick-grid">
        {shortcuts.map(item => (
          <Link key={item.to} to={item.to} className="ap-quick-link">
            <strong>{item.title}</strong>
            <span>{item.desc}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
