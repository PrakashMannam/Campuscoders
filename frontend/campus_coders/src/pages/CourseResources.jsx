import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowRight, FiArrowLeft, FiPlay, FiFileText, FiBookOpen, FiMonitor, FiX, FiDownload, FiCode } from 'react-icons/fi';
import DashboardLayout from '../components/DashboardLayout';
import Toast from '../components/Toast';

const courseNames = {
  java: 'Java Development',
  python: 'Python Mastery',
  dsa: 'DSA Intensive',
  fullstack: 'Full Stack Web',
};

const filterLevels = [
  { name: 'All Levels', type: 'ALL', color: '#6B7280' },
  { name: 'Beginner', type: 'beginner', color: '#10b981' },
  { name: 'Intermediate', type: 'intermediate', color: '#D4AF37' },
  { name: 'Advanced', type: 'advanced', color: '#ef4444' },
];

const trendingTags = ['#video', '#pdf', '#article', '#interactive'];

const allResources = [
  { 
    id: 1, 
    type: 'YOUTUBE VIDEO', 
    icon: <FiPlay size={14} />, 
    title: 'Asynchronous JavaScript: Promises and Async/Await', 
    meta: '42 minutes', 
    level: 'beginner',
    tag: '#video',
    desc: 'Learn how to manage asynchronous operations in modern JavaScript. Covers callbacks, Promises, and the async/await syntax with practical examples.'
  },
  { 
    id: 2, 
    type: 'PDF GUIDE', 
    icon: <FiFileText size={14} />, 
    title: "The Engineer's Guide to Data Structures", 
    meta: '24 Pages', 
    level: 'beginner',
    tag: '#pdf',
    desc: 'An in-depth handbook covering arrays, linked lists, stacks, queues, trees, and graphs, with Big-O complexities and code implementations.'
  },
  { 
    id: 3, 
    type: 'TECHNICAL ARTICLE', 
    icon: <FiBookOpen size={14} />, 
    title: 'Writing Clean Code: Principles of SOLID Design', 
    meta: '15 min read', 
    level: 'intermediate',
    tag: '#article',
    desc: 'Explore the 5 essential design principles of Object-Oriented programming that make code systems more maintainable, understandable, and flexible.'
  },
  { 
    id: 4, 
    type: 'RECORDED LECTURE', 
    icon: <FiMonitor size={14} />, 
    title: 'Introduction to HTTP/3 and QUIC Protocols', 
    meta: '55 minutes', 
    level: 'advanced',
    tag: '#video',
    desc: 'A comprehensive lecture covering the evolution of internet transport protocols, detail-checking how QUIC resolves head-of-line blocking.'
  },
  { 
    id: 5, 
    type: 'INTERACTIVE MODULE', 
    icon: <FiPlay size={14} />, 
    title: 'Mastering the Linux Command Line (Bash)', 
    meta: 'Hands-on Lab', 
    level: 'beginner',
    tag: '#interactive',
    desc: 'A complete hands-on terminal playground to practice navigation, file creation, permissions, pipelines, grep, and script creation.'
  },
  { 
    id: 6, 
    type: 'PDF GUIDE', 
    icon: <FiFileText size={14} />, 
    title: 'Docker & Kubernetes: Container Orchestration Handbook', 
    meta: '18 Pages', 
    level: 'intermediate',
    tag: '#pdf',
    desc: 'Detailed engineering guide on building container images, setting up volumes, multi-stage builds, pods, deployments, and services.'
  },
];

const badges = {
  'YOUTUBE VIDEO': { bg: '#EEF5FF', color: '#1E6BFA' },
  'PDF GUIDE': { bg: '#FFF0FB', color: '#D61B9E' },
  'TECHNICAL ARTICLE': { bg: '#FFFBE6', color: '#D4AF37' },
  'RECORDED LECTURE': { bg: '#ECFDF5', color: '#059669' },
  'INTERACTIVE MODULE': { bg: '#EEF5FF', color: '#1E6BFA' },
};

const colorMap = {
  'JS CONCEPTS': '#D4AF37',
  'FOUNDATIONS': '#6366f1',
  'BEST PRACTICES': '#059669',
  'NETWORKING': '#f43f5e',
};

const thumbLabels = [
  'JS CONCEPTS',
  'FOUNDATIONS',
  'BEST PRACTICES',
  'NETWORKING',
  null,
  null,
];

export default function CourseResources() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  /* ── Filtering State ── */
  const [activeLevel, setActiveLevel] = useState('ALL');
  const [activeTag, setActiveTag] = useState(null);

  // Active Resource details modal
  const [activeResource, setActiveResource] = useState(null);

  /* ── Toast ── */
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });
  const showToast = useCallback((type, message) => {
    setToast({ show: true, type, message });
  }, []);
  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, show: false }));
  }, []);

  const getDynamicCourseName = (id) => {
    if (courseNames[id]) return courseNames[id];
    if (!id) return 'Course';
    return id
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const courseName = getDynamicCourseName(courseId);

  // Apply filters
  const filteredResources = allResources.filter(r => {
    const matchesLevel = activeLevel === 'ALL' || r.level === activeLevel;
    const matchesTag = !activeTag || r.tag === activeTag;
    return matchesLevel && matchesTag;
  });

  const handleActionClick = (r) => {
    let actionMessage = '';
    if (r.type.includes('VIDEO') || r.type.includes('LECTURE')) {
      actionMessage = `Lecture stream initialized: "${r.title}". Enjoy watching!`;
    } else if (r.type.includes('PDF')) {
      actionMessage = `Guide "${r.title}" download started successfully. Check your browser downloads.`;
    } else if (r.type.includes('ARTICLE')) {
      actionMessage = `Redirecting you to full article: "${r.title}".`;
    } else if (r.type.includes('MODULE') || r.type.includes('INTERACTIVE')) {
      actionMessage = `Interactive coding playground initialized for: "${r.title}"!`;
    }

    showToast('success', actionMessage);
    setActiveResource(null);
  };

  const getLevelCount = (levelType) => {
    if (levelType === 'ALL') return allResources.length;
    return allResources.filter(r => r.level === levelType).length;
  };

  return (
    <DashboardLayout>
      <div className="cr-page" style={{ padding: '32px', maxWidth: '1100px' }}>
        {/* ── Toast ── */}
        <Toast
          type={toast.type}
          message={toast.message}
          show={toast.show}
          onClose={hideToast}
        />

        <button className="cr-back" onClick={() => navigate('/dashboard/resources')}>
          <FiArrowLeft size={16} /> Back to Courses
        </button>

        <div className="cr-header" style={{ marginBottom: '28px' }}>
          <div>
            <h2 className="cr-title" style={{ fontFamily: 'var(--font-title)', fontSize: '1.8rem', fontWeight: 800, color: '#111827', margin: '0 0 6px' }}>{courseName} Resources</h2>
            <p className="cr-subtitle" style={{ fontSize: '0.9rem', color: '#6B7280', margin: 0 }}>
              Access curated learning materials, textbooks, codes, and playgrounds designed for the {courseName} track.
            </p>
          </div>
        </div>

        <div className="rs-layout" style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '28px', marginTop: '24px' }}>
          {/* Sidebar Left Filters */}
          <div className="rs-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Levels */}
            <div className="disc-sidebar-card" style={{ background: '#FFFFFF', border: '1px solid #F0F4F8', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <h4 style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', color: '#9CA3AF', textTransform: 'uppercase', margin: '0 0 14px' }}>LEVELS</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filterLevels.map(lvl => {
                  const isActive = activeLevel === lvl.type && !activeTag;
                  return (
                    <li
                      key={lvl.type}
                      onClick={() => {
                        setActiveLevel(lvl.type);
                        setActiveTag(null);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: isActive ? '700' : '500',
                        color: isActive ? '#8C701B' : '#4B5563',
                        background: isActive ? '#FFFBE6' : 'transparent',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: lvl.color }} />
                        <span>{lvl.name}</span>
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.7 }}>{getLevelCount(lvl.type)}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Formats Tags */}
            <div className="disc-sidebar-card" style={{ background: '#FFFFFF', border: '1px solid #F0F4F8', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <h4 style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', color: '#9CA3AF', textTransform: 'uppercase', margin: '0 0 14px' }}>FORMATS</h4>
              <div className="disc-tags-wrap" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {trendingTags.map(tag => {
                  const isActive = activeTag === tag;
                  return (
                    <span 
                      key={tag} 
                      className={`disc-tag ${isActive ? 'active' : ''}`}
                      onClick={() => {
                        setActiveTag(isActive ? null : tag);
                        setActiveLevel('ALL');
                      }}
                      style={{ 
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: isActive ? '#8C701B' : '#6B7280',
                        background: isActive ? '#FFFBE6' : '#F3F4F6',
                        padding: '5px 12px',
                        borderRadius: '6px',
                        border: isActive ? '1px solid #FCE8B2' : 'none'
                      }}
                    >
                      {tag}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Grid Content */}
          <div className="rs-main">
            {(activeLevel !== 'ALL' || activeTag) && (
              <div className="disc-filter-badge-row" style={{ marginBottom: '20px' }}>
                <span className="disc-filter-info">
                  Showing resources matching <strong>{activeTag ? `format: ${activeTag}` : `level: ${activeLevel}`}</strong>
                </span>
                <button 
                  className="disc-clear-filter-btn"
                  onClick={() => {
                    setActiveLevel('ALL');
                    setActiveTag(null);
                  }}
                >
                  Clear filter <FiX size={12} />
                </button>
              </div>
            )}

            <div className="cr-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
              {filteredResources.length === 0 ? (
                <div className="disc-empty-state" style={{ gridColumn: '1 / -1' }}>
                  <p>No learning resources found matching this filter.</p>
                  <button className="disc-empty-reset" onClick={() => { setActiveLevel('ALL'); setActiveTag(null); }}>Show All Levels</button>
                </div>
              ) : (
                filteredResources.map((r, idx) => {
                  const badge = badges[r.type] || {};
                  const thumbLabel = thumbLabels[idx] || null;
                  const thumbColor = thumbLabel ? colorMap[thumbLabel] : '#6366f1';
                  return (
                    <div 
                      key={r.id} 
                      className="cr-card" 
                      id={`resource-card-${r.id}`}
                      onClick={() => setActiveResource(r)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="cr-card-thumb" style={{ background: `linear-gradient(135deg, ${thumbColor}22, ${thumbColor}44)` }}>
                        {thumbLabel && (
                          <span className="cr-card-thumb-label" style={{ background: thumbColor, color: '#fff' }}>
                            {thumbLabel}
                          </span>
                        )}
                      </div>
                      <div className="cr-card-body">
                        <span className="cr-card-type" style={{ background: badge.bg, color: badge.color }}>
                          {r.icon} {r.type}
                        </span>
                        <h4 className="cr-card-title">{r.title}</h4>
                        <div className="cr-card-footer">
                          <span className="cr-card-meta">{r.meta}</span>
                          <FiArrowRight size={14} className="cr-card-arrow" />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── RESOURCE INTERACTIVE DETAIL MODAL ── */}
      {activeResource && (
        <div className="disc-modal-overlay">
          <div className="disc-modal-container">
            <div className="disc-modal-header">
              <span className="cr-card-type" style={{ background: badges[activeResource.type]?.bg, color: badges[activeResource.type]?.color }}>
                {activeResource.icon} {activeResource.type}
              </span>
              <button className="disc-modal-close" onClick={() => setActiveResource(null)}>
                <FiX size={20} />
              </button>
            </div>
            <div className="disc-modal-form" style={{ padding: '24px' }}>
              <div>
                <span className="ann-item-type" style={{ background: activeResource.level === 'beginner' ? '#ecfdf5' : activeResource.level === 'intermediate' ? '#FFFBE6' : '#fef2f2', color: activeResource.level === 'beginner' ? '#059669' : activeResource.level === 'intermediate' ? '#D4AF37' : '#ef4444' }}>
                  {activeResource.level.toUpperCase()}
                </span>
                <h3 style={{ margin: '12px 0 8px', fontSize: '1.25rem', fontWeight: 800, color: '#111827', fontFamily: 'var(--font-title)' }}>
                  {activeResource.title}
                </h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#6B7280' }}>
                  ⏱ {activeResource.meta} | Category Tag: {activeResource.tag}
                </p>
              </div>

              <div style={{ margin: '12px 0 4px', fontSize: '0.9rem', color: '#4B5563', lineHeight: '1.6' }}>
                <h5 style={{ fontWeight: 700, margin: '0 0 4px', color: '#374151' }}>Resource Overview</h5>
                {activeResource.desc}
              </div>

              {/* Resource Content Placeholder preview */}
              <div style={{
                background: '#FAFBFD',
                border: '1px dashed #D1D5DB',
                borderRadius: '10px',
                padding: '24px',
                textAlign: 'center',
                margin: '10px 0',
                color: '#6B7280'
              }}>
                {activeResource.type.includes('VIDEO') || activeResource.type.includes('LECTURE') ? (
                  <>
                    <FiMonitor size={36} style={{ color: '#D4AF37', marginBottom: '8px' }} />
                    <p style={{ fontSize: '0.82rem', margin: 0 }}>HD Video Stream ready • Access duration: Unlimited</p>
                  </>
                ) : activeResource.type.includes('PDF') ? (
                  <>
                    <FiFileText size={36} style={{ color: '#D61B9E', marginBottom: '8px' }} />
                    <p style={{ fontSize: '0.82rem', margin: 0 }}>PDF document preview loaded • Size: {activeResource.meta}</p>
                  </>
                ) : activeResource.type.includes('ARTICLE') ? (
                  <>
                    <FiBookOpen size={36} style={{ color: '#D4AF37', marginBottom: '8px' }} />
                    <p style={{ fontSize: '0.82rem', margin: 0 }}>Technical Article ready for reading • Estimated time: {activeResource.meta}</p>
                  </>
                ) : (
                  <>
                    <FiCode size={36} style={{ color: '#1E6BFA', marginBottom: '8px' }} />
                    <p style={{ fontSize: '0.82rem', margin: 0 }}>Terminal lab image loaded • Environment: Ubuntu Sandbox</p>
                  </>
                )}
              </div>

              <div className="disc-modal-footer" style={{ borderTop: '1px solid #F3F4F6', paddingTop: '20px' }}>
                <button type="button" className="disc-btn-cancel" onClick={() => setActiveResource(null)}>
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={() => handleActionClick(activeResource)} 
                  className="disc-btn-submit"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  {activeResource.type.includes('VIDEO') || activeResource.type.includes('LECTURE') ? (
                    <>Start Watching <FiPlay size={13} /></>
                  ) : activeResource.type.includes('PDF') ? (
                    <>Download PDF <FiDownload size={13} /></>
                  ) : activeResource.type.includes('ARTICLE') ? (
                    <>Read Article <FiBookOpen size={13} /></>
                  ) : (
                    <>Launch Lab Playground <FiCode size={13} /></>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
