import React, { useState } from 'react';
import {
  FiUsers, FiUpload, FiBell, FiBarChart2,
  FiPlus, FiCheck, FiActivity,
  FiBook, FiTrendingUp, FiLink, FiFileText, FiStar
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { learningPathsData } from '../data/learningPaths';
import { resourcesData } from '../data/resources';

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
  const [announceTitle, setAnnounceTitle] = useState('');
  const [posted, setPosted] = useState(false);

  // Resource Upload Form State
  const [resourceSourceMode, setResourceSourceMode] = useState('external'); // 'external' | 'file'
  const [resTitle, setResTitle] = useState('');
  const [resDesc, setResDesc] = useState('');
  const [resPathId, setResPathId] = useState('java');
  const [resTopic, setResTopic] = useState('oop');
  const [resType, setResType] = useState('Video');
  const [resDifficulty, setResDifficulty] = useState('Beginner');
  const [resExternalUrl, setResExternalUrl] = useState('');
  const [resFile, setResFile] = useState(null);
  const [resSourceName, setResSourceName] = useState('');
  const [resDuration, setResDuration] = useState('');
  const [resTags, setResTags] = useState('');
  const [resRecommended, setResRecommended] = useState(true);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handlePostAnnouncement = (e) => {
    e.preventDefault();
    if (!announcementText.trim() || !announceTitle.trim()) return;
    setPosted(true);
    setTimeout(() => {
      setPosted(false);
      setAnnouncementText('');
      setAnnounceTitle('');
    }, 3000);
  };

  const handleResourceSubmit = (e) => {
    e.preventDefault();
    if (!resTitle.trim()) {
      alert('Please provide a resource title.');
      return;
    }

    const newResource = {
      id: `res-${Date.now()}`,
      topicId: resTopic,
      pathId: resPathId,
      title: resTitle,
      description: resDesc,
      source: resSourceName || 'Campus Coders',
      verifiedSource: true,
      type: resType,
      difficulty: resDifficulty,
      duration: resDuration || '15 min',
      url: resourceSourceMode === 'external' ? (resExternalUrl || '#') : '#pdf-download',
      isFileUpload: resourceSourceMode === 'file',
      fileName: resFile ? resFile.name : 'Uploaded_Resource.pdf',
      bookmarked: false,
      completed: false,
      recommended: resRecommended,
      recentlyAdded: true,
      bookmarkCount: 0,
      tags: resTags ? resTags.split(',').map(t => t.trim()).filter(Boolean) : ['Campus Coders']
    };

    // Prepend to in-memory resources
    resourcesData.unshift(newResource);

    setUploadSuccess(true);
    setTimeout(() => {
      setUploadSuccess(false);
      // Reset form
      setResTitle('');
      setResDesc('');
      setResExternalUrl('');
      setResFile(null);
      setResSourceName('');
      setResDuration('');
      setResTags('');
    }, 3000);
  };

  return (
    <div className="page dash-page">
      {/* Header */}
      <div className="dash-header">
        <div>
          <p className="dash-greeting">Admin Panel 🛡️</p>
          <h1 className="dash-title">
            Welcome, <span className="gradient-text">{user?.name ? user.name.split(' ')[0] : 'Admin'}</span>
          </h1>
          <p className="dash-subtitle">Manage students, learning resources, announcements, and platform health.</p>
        </div>
        <a href="#admin-upload-form-section" className="btn btn-primary">
          <FiUpload size={14} /> Upload Resource
        </a>
      </div>

      {/* Admin stats */}
      <div className="dash-stats-grid">
        <AdminStatCard icon={<FiUsers size={20} />}     value="124"  label="Total Students"        color="#6366f1" change="+3 this week" />
        <AdminStatCard icon={<FiBook size={20} />}      value={resourcesData.length} label="Resources Uploaded" color="#0ea5e9" change="+2 today" />
        <AdminStatCard icon={<FiBell size={20} />}      value="12"   label="Announcements Posted"   color="#f97316" change="1 pending"    />
        <AdminStatCard icon={<FiActivity size={20} />}  value="89"   label="Active Today"           color="#10b981" change="72% of total" />
      </div>

      {/* Main grid */}
      <div className="dash-main-grid">
        {/* Left Column: Admin Upload Resource Form */}
        <div className="dash-col">
          <div className="dash-card" id="admin-upload-form-section">
            <div className="dash-card-header">
              <span className="dash-card-title"><FiUpload size={16} /> Admin Resource Upload</span>
            </div>

            {uploadSuccess ? (
              <div className="dash-solved-banner" style={{ margin: '16px 0' }}>
                <FiCheck size={24} style={{ color: '#10b981' }} />
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Resource Successfully Published!</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    It is now live on the Resources page and topic hub.
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleResourceSubmit} className="admin-resource-form">
                {/* Source Mode Toggle (External Link vs File Upload) */}
                <div className="admin-source-mode-toggle">
                  <button
                    type="button"
                    className={`admin-mode-btn ${resourceSourceMode === 'external' ? 'active' : ''}`}
                    onClick={() => setResourceSourceMode('external')}
                  >
                    <FiLink size={14} /> External Link Resource
                  </button>
                  <button
                    type="button"
                    className={`admin-mode-btn ${resourceSourceMode === 'file' ? 'active' : ''}`}
                    onClick={() => setResourceSourceMode('file')}
                  >
                    <FiFileText size={14} /> Upload File (PDF/Doc)
                  </button>
                </div>

                {/* Title */}
                <div className="form-group-custom">
                  <label>Resource Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Spring Boot Microservices Deep Dive"
                    value={resTitle}
                    onChange={(e) => setResTitle(e.target.value)}
                  />
                </div>

                {/* Description */}
                <div className="form-group-custom">
                  <label>Description</label>
                  <textarea
                    rows={2}
                    placeholder="Short summary of what this resource covers..."
                    value={resDesc}
                    onChange={(e) => setResDesc(e.target.value)}
                  />
                </div>

                {/* Grid row: Learning Path & Topic */}
                <div className="form-row-2col">
                  <div className="form-group-custom">
                    <label>Learning Path</label>
                    <select value={resPathId} onChange={(e) => setResPathId(e.target.value)}>
                      {learningPathsData.map(p => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group-custom">
                    <label>Topic</label>
                    <input
                      type="text"
                      placeholder="e.g. oop, collections, streams"
                      value={resTopic}
                      onChange={(e) => setResTopic(e.target.value)}
                    />
                  </div>
                </div>

                {/* Grid row: Resource Type & Difficulty */}
                <div className="form-row-2col">
                  <div className="form-group-custom">
                    <label>Resource Type</label>
                    <select value={resType} onChange={(e) => setResType(e.target.value)}>
                      <option value="Video">Video</option>
                      <option value="Article">Article</option>
                      <option value="PDF">PDF Document</option>
                      <option value="Documentation">Documentation</option>
                      <option value="External Link">External Link</option>
                    </select>
                  </div>

                  <div className="form-group-custom">
                    <label>Difficulty Level</label>
                    <select value={resDifficulty} onChange={(e) => setResDifficulty(e.target.value)}>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                {/* External Link Input vs File Upload Input */}
                {resourceSourceMode === 'external' ? (
                  <div className="form-group-custom">
                    <label>External Resource URL *</label>
                    <input
                      type="url"
                      placeholder="https://youtube.com/watch?v=..."
                      value={resExternalUrl}
                      onChange={(e) => setResExternalUrl(e.target.value)}
                    />
                  </div>
                ) : (
                  <div className="form-group-custom">
                    <label>Attach PDF or Document File *</label>
                    <input
                      type="file"
                      accept=".pdf,.docx,.ppt,.txt"
                      onChange={(e) => setResFile(e.target.files[0] || null)}
                    />
                  </div>
                )}

                {/* Grid row: Source Name & Duration */}
                <div className="form-row-2col">
                  <div className="form-group-custom">
                    <label>Source Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Telusko, freeCodeCamp, Oracle"
                      value={resSourceName}
                      onChange={(e) => setResSourceName(e.target.value)}
                    />
                  </div>

                  <div className="form-group-custom">
                    <label>Duration / Size</label>
                    <input
                      type="text"
                      placeholder="e.g. 45 min or 1.2 MB • 15 pages"
                      value={resDuration}
                      onChange={(e) => setResDuration(e.target.value)}
                    />
                  </div>
                </div>

                {/* Tags */}
                <div className="form-group-custom">
                  <label>Tags (Comma Separated)</label>
                  <input
                    type="text"
                    placeholder="Java, Spring, Microservices"
                    value={resTags}
                    onChange={(e) => setResTags(e.target.value)}
                  />
                </div>

                {/* Club Recommended Checkbox */}
                <div className="form-checkbox-custom">
                  <input
                    type="checkbox"
                    id="recommend-check"
                    checked={resRecommended}
                    onChange={(e) => setResRecommended(e.target.checked)}
                  />
                  <label htmlFor="recommend-check">
                    <FiStar size={14} style={{ color: '#EAB308' }} /> Mark as Club Recommended Resource
                  </label>
                </div>

                <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: '16px' }}>
                  <FiPlus size={16} /> Publish Resource
                </button>
              </form>
            )}
          </div>

          {/* Quick Actions */}
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
        </div>

        {/* Right Column: Post Announcement & Student table */}
        <div className="dash-col">
          {/* Post announcement */}
          <div className="dash-card">
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
              <form onSubmit={handlePostAnnouncement}>
                <input
                  id="admin-announce-title"
                  type="text"
                  placeholder="Announcement title"
                  value={announceTitle}
                  onChange={e => setAnnounceTitle(e.target.value)}
                  style={{ marginBottom: '12px', width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #E2E8F0' }}
                />
                <textarea
                  id="admin-announce-body"
                  placeholder="Write the announcement message…"
                  rows={3}
                  value={announcementText}
                  onChange={e => setAnnouncementText(e.target.value)}
                  style={{ resize: 'vertical', marginBottom: '12px', width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #E2E8F0' }}
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

          {/* Student table */}
          <div className="dash-card">
            <div className="dash-card-header">
              <span className="dash-card-title"><FiUsers size={16} /> Active Students</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Top 5</span>
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
              <span className="dash-card-title"><FiActivity size={16} /> Recent Admin Activity</span>
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
