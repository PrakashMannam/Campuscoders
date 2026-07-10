import React, { useState } from 'react';
import {
  FiUsers, FiUpload, FiBell, FiBarChart2,
  FiPlus, FiCheck, FiActivity,
  FiBook, FiTrendingUp
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const recentActivity = [
  { icon: <FiUpload size={14} />,  color: '#6366f1', text: 'DSA Notes PDF uploaded',                   time: '10m ago' },
  { icon: <FiBell size={14} />,    color: '#0ea5e9', text: 'Announcement posted: HackCampus 2026',      time: '1h ago'  },
  { icon: <FiUsers size={14} />,   color: '#0d9488', text: 'New student registered: Rahul Verma',       time: '3h ago'  },
  { icon: <FiBarChart2 size={14} />, color: '#f97316', text: 'Weekly activity report generated',        time: '1d ago'  },
  { icon: <FiBook size={14} />,    color: '#f43f5e', text: 'SQL Cheat Sheet uploaded',                  time: '1d ago'  },
];

const students = [
  { name: 'Rohit Sharma',  email: 'rohit@campus.com',  streak: 12, rank: 1,  status: 'active'    },
  { name: 'Sneha Patel',   email: 'sneha@campus.com',  streak: 9,  rank: 2,  status: 'active'    },
  { name: 'Arjun Das',     email: 'arjun@campus.com',  streak: 7,  rank: 3,  status: 'active'    },
  { name: 'Priya Nair',    email: 'priya@campus.com',  streak: 4,  rank: 8,  status: 'inactive'  },
  { name: 'Alex Rivera',   email: 'alex@campus.com',   streak: 6,  rank: 10, status: 'active'    },
];

function AdminStatCard({ icon, value, label, color, change }) {
  return (
    <div className="dash-stat-card">
      <div className="dash-stat-icon" style={{ background: `${color}18`, color }}>{icon}</div>
      <div className="dash-stat-val">{value}</div>
      <div className="dash-stat-label">{label}</div>
      {change && <div className="dash-stat-sub" style={{ color: '#10b981' }}>{change}</div>}
    </div>
  );
}

function AdminDashboard() {
  const { user } = useAuth();
  const [announcementText, setAnnouncementText] = useState('');
  const [posted, setPosted] = useState(false);

  const handlePost = (e) => {
    e.preventDefault();
    if (!announcementText.trim()) return;
    setPosted(true);
    setTimeout(() => { setPosted(false); setAnnouncementText(''); }, 3000);
  };

  return (
    <div className="page dash-page">
      {/* Header */}
      <div className="dash-header">
        <div>
          <p className="dash-greeting">Admin Panel 🛡️</p>
          <h1 className="dash-title">
            Welcome, <span className="gradient-text">{user?.name.split(' ')[0]}</span>
          </h1>
          <p className="dash-subtitle">Manage students, content, and platform health from here.</p>
        </div>
        <a href="#upload-section" className="btn btn-primary">
          <FiUpload size={14} /> Upload Resource
        </a>
      </div>

      {/* Admin stats */}
      <div className="dash-stats-grid">
        <AdminStatCard icon={<FiUsers size={20} />}     value="124"  label="Total Students"        color="#6366f1" change="+3 this week" />
        <AdminStatCard icon={<FiBook size={20} />}      value="38"   label="Resources Uploaded"     color="#0ea5e9" change="+2 today"     />
        <AdminStatCard icon={<FiBell size={20} />}      value="12"   label="Announcements Posted"   color="#f97316" change="1 pending"    />
        <AdminStatCard icon={<FiActivity size={20} />}  value="89"   label="Active Today"           color="#10b981" change="72% of total" />
      </div>

      {/* Main grid */}
      <div className="dash-main-grid">
        {/* Left */}
        <div className="dash-col">
          {/* Quick actions */}
          <div className="dash-card">
            <div className="dash-card-header">
              <span className="dash-card-title"><FiTrendingUp size={16} /> Quick Actions</span>
            </div>
            <div className="admin-action-grid">
              {[
                { icon: '📤', label: 'Upload Resource',   color: '#6366f1', id: 'action-upload'   },
                { icon: '📢', label: 'Post Announcement', color: '#0ea5e9', id: 'action-announce'  },
                { icon: '👥', label: 'Manage Students',   color: '#0d9488', id: 'action-students'  },
                { icon: '📊', label: 'View Reports',      color: '#f97316', id: 'action-reports'   },
              ].map(a => (
                <button
                  key={a.label}
                  id={a.id}
                  className="admin-action-btn"
                  style={{ '--action-color': a.color }}
                >
                  <span className="admin-action-icon" style={{ background: `${a.color}18`, color: a.color }}>
                    {a.icon}
                  </span>
                  <span>{a.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Post announcement */}
          <div className="dash-card" id="upload-section">
            <div className="dash-card-header">
              <span className="dash-card-title"><FiBell size={16} /> Post Announcement</span>
            </div>
            {posted ? (
              <div className="dash-solved-banner">
                <FiCheck size={22} style={{ color: '#10b981' }} />
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Announcement Posted!</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    All students have been notified.
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePost}>
                <input
                  id="admin-announce-title"
                  type="text"
                  placeholder="Announcement title"
                  style={{ marginBottom: '12px' }}
                />
                <textarea
                  id="admin-announce-body"
                  placeholder="Write the announcement message…"
                  rows={3}
                  value={announcementText}
                  onChange={e => setAnnouncementText(e.target.value)}
                  style={{ resize: 'vertical', marginBottom: '12px' }}
                />
                <button
                  id="admin-post-btn"
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '11px' }}
                >
                  <FiPlus size={14} /> Post Announcement
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right */}
        <div className="dash-col">
          {/* Student table */}
          <div className="dash-card">
            <div className="dash-card-header">
              <span className="dash-card-title"><FiUsers size={16} /> Students</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Showing top 5</span>
            </div>
            <div className="admin-student-table">
              <div className="admin-table-head">
                <span>Name</span>
                <span>Streak</span>
                <span>Rank</span>
                <span>Status</span>
              </div>
              {students.map(s => (
                <div key={s.email} className="admin-table-row">
                  <div className="admin-student-info">
                    <div className="admin-student-avatar">
                      {s.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <div className="admin-student-name">{s.name}</div>
                      <div className="admin-student-email">{s.email}</div>
                    </div>
                  </div>
                  <span style={{ color: '#f97316', fontWeight: 700 }}>{s.streak}🔥</span>
                  <span style={{ color: '#0ea5e9', fontWeight: 700 }}>#{s.rank}</span>
                  <span className={`admin-status-badge ${s.status}`}>
                    {s.status === 'active' ? '● Active' : '○ Inactive'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent activity */}
          <div className="dash-card">
            <div className="dash-card-header">
              <span className="dash-card-title"><FiActivity size={16} /> Recent Activity</span>
            </div>
            <ul className="dash-announce-list">
              {recentActivity.map((a, i) => (
                <li key={i} className="dash-announce-item">
                  <span className="dash-announce-tag" style={{ background: `${a.color}18`, color: a.color }}>
                    {a.icon}
                  </span>
                  <div className="dash-announce-body">
                    <span className="dash-announce-title">{a.text}</span>
                    <span className="dash-announce-time">{a.time}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
