import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiBook, FiTarget, FiCalendar, FiVolume2, FiMessageCircle } from 'react-icons/fi';
import api from '../../api/client';

export default function AdminDashboardHome() {
  const [stats, setStats] = useState({
    users: null,
    paths: null,
    challenges: null,
    events: null,
  });

  const load = useCallback(async () => {
    const next = { users: null, paths: null, challenges: null, events: null };
    try {
      const u = await api.get('/admin/users?page=0&size=1');
      next.users = u.data?.totalElements ?? 0;
    } catch { /* leave null */ }
    try {
      const p = await api.get('/admin/learning-paths');
      next.paths = Array.isArray(p.data) ? p.data.length : (p.data?.totalElements ?? 0);
    } catch { /* leave null */ }
    try {
      const c = await api.get('/admin/daily-challenges');
      next.challenges = Array.isArray(c.data) ? c.data.length : (c.data?.totalElements ?? 0);
    } catch { /* leave null */ }
    try {
      const e = await api.get('/admin/events');
      next.events = Array.isArray(e.data) ? e.data.length : (e.data?.totalElements ?? 0);
    } catch { /* leave null */ }
    setStats(next);
  }, []);

  useEffect(() => { load(); }, [load]);

  const cards = [
    { label: 'Users', value: stats.users, icon: <FiUsers size={22} />, color: '#4f46e5', bg: '#EEF2FF' },
    { label: 'Learning paths', value: stats.paths, icon: <FiBook size={22} />, color: '#d97706', bg: '#FFFBEB' },
    { label: 'Daily challenges', value: stats.challenges, icon: <FiTarget size={22} />, color: '#059669', bg: '#ECFDF5' },
    { label: 'Events', value: stats.events, icon: <FiCalendar size={22} />, color: '#7A6410', bg: '#F3E6B8' },
  ];

  const shortcuts = [
    { to: '/admin/users', title: 'Users', desc: 'Roles and status' },
    { to: '/admin/learning-paths', title: 'Learning paths', desc: 'Curriculum' },
    { to: '/admin/resources', title: 'Resources', desc: 'Catalog' },
    { to: '/admin/topics', title: 'Topics', desc: 'Path structure' },
    { to: '/admin/challenges', title: 'Daily challenges', desc: 'Problem of the day' },
    { to: '/admin/events', title: 'Events', desc: 'Contests & sessions' },
    { to: '/admin/announcements', title: 'Announcements', desc: 'Platform updates' },
    { to: '/admin/community', title: 'Community', desc: 'Moderate threads' },
  ];

  return (
    <div>
      <div className="ap-header">
        <div>
          <h1 className="ap-page-title">Dashboard</h1>
          <p className="ap-page-sub">Real counts from admin APIs - no mock telemetry</p>
        </div>
      </div>

      <div className="ap-stat-grid">
        {cards.map((card) => (
          <div key={card.label} className="ap-stat">
            <div className="ap-stat-icon" style={{ background: card.bg, color: card.color }}>{card.icon}</div>
            <div>
              <div className="ap-stat-label">{card.label}</div>
              <div className="ap-stat-value">{card.value == null ? '-' : card.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="ap-quick-grid">
        {shortcuts.map((item) => (
          <Link key={item.to} to={item.to} className="ap-quick-link">
            <strong>{item.title}</strong>
            <span>{item.desc}</span>
          </Link>
        ))}
        <Link to="/admin/reports" className="ap-quick-link">
          <strong>Reports</strong>
          <span>Coming when analytics API exists</span>
        </Link>
        <Link to="/admin/settings" className="ap-quick-link">
          <strong>Settings</strong>
          <span>Platform controls</span>
        </Link>
      </div>

      <p className="sd-muted" style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
        <FiVolume2 size={14} /> Publish content from the modules above. <FiMessageCircle size={14} /> Moderate discussions in Community.
      </p>
    </div>
  );
}
