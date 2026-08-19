import React, { useState, useEffect, useCallback } from 'react';
import { FiCalendar, FiRefreshCw, FiX } from 'react-icons/fi';
import DashboardLayout from '../components/DashboardLayout';
import Toast from '../components/Toast';
import api from '../api/client';

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('ALL');

  /* ── Toast ── */
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });
  const showToast = useCallback((type, message) => {
    setToast({ show: true, type, message });
  }, []);
  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, show: false }));
  }, []);

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      let url = '/announcements?page=0&size=20';
      if (activeCategory !== 'ALL') {
        url += `&category=${activeCategory}`;
      }
      const res = await api.get(url);
      setAnnouncements(res.data.content || []);
    } catch (err) {
      showToast('error', 'Failed to load announcements.');
    } finally {
      setLoading(false);
    }
  }, [activeCategory, showToast]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

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
              Browse official updates, releases, and academic news from the Campus Coders team.
            </p>
          </div>
        </div>

        <div className="ann-layout" style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '28px', marginTop: '24px' }}>
          {/* Sidebar Left Filters */}
          <div className="ann-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="disc-sidebar-card" style={{ background: '#FFFFFF', border: '1px solid #F0F4F8', borderRadius: '12px', padding: '20px' }}>
              <h4 style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', color: '#9CA3AF', textTransform: 'uppercase', margin: '0 0 14px' }}>CATEGORIES</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {['ALL', 'SYSTEM', 'ACADEMIC', 'EVENT', 'HACKATHON'].map(cat => {
                  const isActive = activeCategory === cat;
                  return (
                    <li
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
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
                      <span>{cat}</span>
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
                  Showing updates in <strong>{activeCategory}</strong>
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
              {loading ? (
                <p style={{ color: '#64748b' }}>Loading announcements...</p>
              ) : announcements.length === 0 ? (
                <p style={{ color: '#64748b' }}>No announcements found.</p>
              ) : (
                announcements.map(a => (
                  <div key={a.id} className="ann-item" id={`announcement-${a.id}`}>
                    <div className="ann-item-icon" style={{ background: '#FFFBE6', color: '#D4AF37' }}>
                      <FiRefreshCw size={20} />
                    </div>

                    <div className="ann-item-content">
                      <div className="ann-item-meta">
                        <span className="ann-item-type" style={{ background: '#D4AF3718', color: '#D4AF37' }}>
                          {a.category || 'UPDATE'}
                        </span>
                        <span className="ann-item-date"><FiCalendar size={12} /> {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : 'Recent'}</span>
                      </div>
                      <h3 className="ann-item-title">{a.title}</h3>
                      <p className="ann-item-desc">{a.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
