import React, { useState, useCallback } from 'react';
import { FiArrowRight, FiCalendar, FiMapPin, FiChevronDown, FiRefreshCw, FiStar, FiCheckCircle, FiX, FiUser, FiMail } from 'react-icons/fi';
import DashboardLayout from '../components/DashboardLayout';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';

const filterCategories = [
  { name: 'All Updates', type: 'ALL', count: 3, color: '#D4AF37' },
  { name: 'Platform Updates', type: 'PLATFORM UPDATE', count: 1, color: '#D4AF37' },
  { name: 'Events & Hackathons', type: 'EVENT', count: 1, color: '#059669' },
  { name: 'Academic News', type: 'ACADEMIC NEWS', count: 1, color: '#6366f1' },
];

const announcementData = [
  {
    id: 1,
    type: 'PLATFORM UPDATE',
    typeColor: '#D4AF37',
    icon: <FiRefreshCw size={20} />,
    iconBg: '#FFFBE6',
    iconColor: '#D4AF37',
    date: 'Oct 24, 2023',
    author: 'Engineering Team',
    title: 'Introducing the Beta Code Workspace v2.0',
    desc: "We've completely rebuilt the integrated development environment to support real-time pair programming and advanced debugging tools. This update includes a lower latency synchronization engine and a revamped UI that maximizes code real estate.",
    content: "We've completely rebuilt the integrated development environment to support real-time pair programming, advanced debugging tools, and a terminal runner. This update includes a lower latency synchronization engine that uses operational transformation to sync keystrokes across peers in under 50ms. Additionally, the revamped UI maximizes code real estate by allowing panels to be dynamically collapsed or floated. Support for custom keybindings (Vim, Emacs) and dark themes is now enabled by default. Try it out in your profile dashboard today!",
    cta: 'Read More',
    image: null,
    eventMeta: null,
  },
  {
    id: 2,
    type: 'EVENT',
    typeColor: '#059669',
    icon: <FiStar size={20} />,
    iconBg: '#ECFDF5',
    iconColor: '#059669',
    date: 'Oct 21, 2023',
    author: 'Community Relations',
    title: 'Annual Winter Hackathon: "Code for Impact"',
    desc: "Registration is now open for our flagship 48-hour coding marathon. This year, we're focusing on sustainable tech solutions for campus life. Over $10,000 in prizes and mentorship opportunities with industry leaders.",
    content: "Registration is now open for our flagship 48-hour coding marathon. This year, we're focusing on sustainable tech solutions for campus life. Teams will design and build projects addressing energy efficiency, community waste reduction, or resource sharing. Over $10,000 in cash prizes, API credits, and hardware gadgets will be awarded. You will also get 1-on-1 mentorship opportunities with engineering managers and directors from top tech firms during the hackathon. Register now to reserve your spot!",
    cta: 'Register Now',
    image: true,
    eventMeta: { dateRange: 'Dec 12 - 14', location: 'Engineering Hall' },
  },
  {
    id: 3,
    type: 'ACADEMIC NEWS',
    typeColor: '#6366f1',
    icon: <FiCheckCircle size={20} />,
    iconBg: '#EEF5FF',
    iconColor: '#6366f1',
    date: 'Oct 18, 2023',
    author: 'Academic Board',
    title: 'Curriculum Update: New Distributed Systems Track',
    desc: 'Following industry feedback, we are launching an advanced track focused on distributed databases, consensus algorithms, and cloud-native architecture. Prerequisites include Operating Systems and Networking.',
    content: "Following industry feedback and alumni reviews, we are launching an advanced track focused on distributed databases, consensus algorithms, and cloud-native architectures. Students will study seminal papers (Paxos, Raft, Spanner), build a replicated distributed key-value store from scratch in Go, and practice deploying containerized systems to Kubernetes. Prerequisites include Operating Systems and Computer Networking. Applications are open for the upcoming semester starting next week.",
    cta: 'View Syllabus',
    image: null,
    eventMeta: null,
  },
];

export default function Announcements() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState('ALL');

  // Modals state
  const [activeAnnouncement, setActiveAnnouncement] = useState(null);
  const [registerEvent, setRegisterEvent] = useState(null);

  // Registration Form state
  const [regName, setRegName] = useState(user?.name || '');
  const [regEmail, setRegEmail] = useState(user?.email || '');
  const [regNote, setRegNote] = useState('');

  /* ── Toast ── */
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });
  const showToast = useCallback((type, message) => {
    setToast({ show: true, type, message });
  }, []);
  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, show: false }));
  }, []);

  const filtered = activeCategory === 'ALL'
    ? announcementData
    : announcementData.filter(a => a.type === activeCategory);

  const handleCtaClick = (a, e) => {
    e.preventDefault();
    if (a.type === 'EVENT') {
      setRegisterEvent(a);
    } else {
      setActiveAnnouncement(a);
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim()) {
      showToast('error', 'Please fill in your name and email.');
      return;
    }

    // Success Toast
    showToast('success', `Registered successfully for "${registerEvent.title}"! A confirmation has been sent to ${regEmail}.`);
    
    // Reset Form
    setRegNote('');
    setRegisterEvent(null);
  };

  return (
    <DashboardLayout>
      <div className="ann-page">
        {/* ── Toast ── */}
        <Toast
          type={toast.type}
          message={toast.message}
          show={toast.show}
          onClose={hideToast}
        />

        <div className="ann-top">
          <div>
            <h2 className="ann-title">Platform Announcements</h2>
            <p className="ann-subtitle">
              Browse official updates, system releases, upcoming workshops, hackathons, and academic news from the Campus Coders engineering and education teams.
            </p>
          </div>
        </div>

        <div className="ann-layout" style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '28px', marginTop: '24px' }}>
          {/* Sidebar Left Filters */}
          <div className="ann-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="disc-sidebar-card" style={{ background: '#FFFFFF', border: '1px solid #F0F4F8', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <h4 style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', color: '#9CA3AF', textTransform: 'uppercase', margin: '0 0 14px' }}>CATEGORIES</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filterCategories.map(cat => {
                  const isActive = activeCategory === cat.type;
                  return (
                    <li
                      key={cat.type}
                      onClick={() => setActiveCategory(cat.type)}
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
                      className="ann-sidebar-item"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: cat.color }} />
                        <span>{cat.name}</span>
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.7 }}>{cat.count}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Main Content List */}
          <div className="ann-main">
            {activeCategory !== 'ALL' && (
              <div className="disc-filter-badge-row" style={{ marginBottom: '20px' }}>
                <span className="disc-filter-info">
                  Showing updates in <strong>{filterCategories.find(c => c.type === activeCategory)?.name}</strong>
                </span>
                <button 
                  className="disc-clear-filter-btn"
                  onClick={() => setActiveCategory('ALL')}
                >
                  Clear filter <FiX size={12} />
                </button>
              </div>
            )}

            <div className="ann-list">
              {filtered.map(a => (
                <div key={a.id} className="ann-item" id={`announcement-${a.id}`}>
                  <div className="ann-item-icon" style={{ background: a.iconBg, color: a.iconColor }}>
                    {a.icon}
                  </div>

                  <div className="ann-item-content">
                    <div className="ann-item-meta">
                      <span className="ann-item-type" style={{ background: `${a.typeColor}18`, color: a.typeColor }}>
                        {a.type.replace('_', ' ')}
                      </span>
                      <span className="ann-item-date"><FiCalendar size={12} /> {a.date}</span>
                      {a.author && <span className="ann-item-author">👤 by {a.author}</span>}
                    </div>
                    <h3 className="ann-item-title">{a.title}</h3>
                    <p className="ann-item-desc">{a.desc}</p>

                    {a.eventMeta && (
                      <div className="ann-event-meta">
                        <div className="ann-event-box">
                          <span className="ann-event-label">DATE RANGE</span>
                          <span className="ann-event-value"><FiCalendar size={12} style={{ marginRight: '4px' }} /> {a.eventMeta.dateRange}</span>
                        </div>
                        <div className="ann-event-box">
                          <span className="ann-event-label">LOCATION</span>
                          <span className="ann-event-value"><FiMapPin size={12} style={{ marginRight: '4px' }} /> {a.eventMeta.location}</span>
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '12px', marginTop: '16px', alignItems: 'center' }}>
                      <button onClick={(e) => handleCtaClick(a, e)} className="disc-btn-submit" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
                        {a.cta} <FiArrowRight size={14} />
                      </button>
                      {a.type === 'EVENT' && (
                        <button onClick={() => setActiveAnnouncement(a)} className="disc-btn-cancel" style={{ border: '1px solid #D1D5DB', background: '#FFFFFF' }}>
                          Read Details
                        </button>
                      )}
                    </div>
                  </div>

                  
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── ANNOUNCEMENT READ MORE DETAILS MODAL ── */}
      {activeAnnouncement && (
        <div className="disc-modal-overlay">
          <div className="disc-modal-container detail-modal">
            <div className="disc-modal-header">
              <span className="ann-item-type" style={{ background: `${activeAnnouncement.typeColor}18`, color: activeAnnouncement.typeColor }}>
                {activeAnnouncement.type}
              </span>
              <button className="disc-modal-close" onClick={() => setActiveAnnouncement(null)}>
                <FiX size={20} />
              </button>
            </div>
            <div className="disc-detail-scrollable">
              <div className="disc-detail-main">
                <h2 className="disc-detail-title">{activeAnnouncement.title}</h2>
                <div className="disc-detail-meta" style={{ borderBottom: '1px solid #F3F4F6', paddingBottom: '14px', marginBottom: '16px' }}>
                  <span><FiCalendar size={12} /> {activeAnnouncement.date}</span>
                  {activeAnnouncement.author && <span style={{ marginLeft: '12px' }}>👤 by {activeAnnouncement.author}</span>}
                </div>
                <div className="disc-detail-content" style={{ fontSize: '0.95rem', color: '#4B5563', lineHeight: '1.7' }}>
                  {activeAnnouncement.content}
                </div>
              </div>
            </div>
            <div className="disc-reply-form" style={{ padding: '16px 24px', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setActiveAnnouncement(null)} className="disc-btn-cancel">
                Close Update
              </button>
              {activeAnnouncement.type === 'EVENT' && (
                <button 
                  onClick={() => {
                    setRegisterEvent(activeAnnouncement);
                    setActiveAnnouncement(null);
                  }} 
                  className="disc-btn-submit"
                >
                  Register Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── EVENT REGISTRATION MODAL ── */}
      {registerEvent && (
        <div className="disc-modal-overlay">
          <div className="disc-modal-container">
            <div className="disc-modal-header">
              <h3>Register for Event</h3>
              <button className="disc-modal-close" onClick={() => setRegisterEvent(null)}>
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleRegisterSubmit} className="disc-modal-form">
              <div style={{ marginBottom: '8px' }}>
                <span className="ann-item-type" style={{ background: `${registerEvent.typeColor}18`, color: registerEvent.typeColor }}>
                  {registerEvent.type}
                </span>
                <h4 style={{ margin: '8px 0 4px', fontSize: '1.05rem', color: '#111827', fontWeight: 800 }}>{registerEvent.title}</h4>
                {registerEvent.eventMeta && (
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#6B7280' }}>
                    📅 {registerEvent.eventMeta.dateRange} | 📍 {registerEvent.eventMeta.location}
                  </p>
                )}
              </div>

              <div className="disc-form-group">
                <label>Your Full Name</label>
                <div style={{ position: 'relative' }}>
                  <FiUser size={15} style={{ position: 'absolute', left: '12px', top: '13px', color: '#9CA3AF' }} />
                  <input 
                    type="text" 
                    value={regName} 
                    onChange={e => setRegName(e.target.value)} 
                    placeholder="Enter your name"
                    style={{ paddingLeft: '36px' }}
                    required
                  />
                </div>
              </div>

              <div className="disc-form-group">
                <label>Your Email Address</label>
                <div style={{ position: 'relative' }}>
                  <FiMail size={15} style={{ position: 'absolute', left: '12px', top: '13px', color: '#9CA3AF' }} />
                  <input 
                    type="email" 
                    value={regEmail} 
                    onChange={e => setRegEmail(e.target.value)} 
                    placeholder="Enter your email"
                    style={{ paddingLeft: '36px' }}
                    required
                  />
                </div>
              </div>

              <div className="disc-form-group">
                <label>Notes / Questions for Organizers (Optional)</label>
                <textarea 
                  value={regNote} 
                  onChange={e => setRegNote(e.target.value)} 
                  placeholder="e.g. food preferences, team status, etc."
                  rows={3}
                />
              </div>

              <div className="disc-modal-footer">
                <button type="button" className="disc-btn-cancel" onClick={() => setRegisterEvent(null)}>
                  Cancel
                </button>
                <button type="submit" className="disc-btn-submit">
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
