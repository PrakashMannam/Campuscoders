import React, { useState, useEffect, useCallback } from 'react';
import { FiCalendar, FiRefreshCw, FiX, FiBell, FiChevronLeft, FiChevronRight, FiArrowRight } from 'react-icons/fi';
import DashboardLayout from '../components/DashboardLayout';
import Toast from '../components/Toast';
import api from '../api/client';

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState('Latest');
  const [pushEnabled, setPushEnabled] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 5;

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
      let url = `/announcements?page=${currentPage}&size=${pageSize}`;
      if (activeCategory !== 'ALL') {
        url += `&category=${activeCategory}`;
      }
      // Map sort option to API parameter
      if (sortBy === 'Important') url += '&sortFilter=IMPORTANT';
      else if (sortBy === 'Popular') url += '&sortFilter=POPULAR';

      const res = await api.get(url);
      setAnnouncements(res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalElements(res.data.totalElements || 0);
    } catch (err) {
      showToast('error', 'Failed to load announcements.');
    } finally {
      setLoading(false);
    }
  }, [activeCategory, currentPage, sortBy, showToast]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleEnablePush = async () => {
    try {
      await api.put('/profile/settings/me', { pushNotifications: true });
      setPushEnabled(true);
      showToast('success', 'Push notifications enabled! You\'ll never miss an update.');
    } catch (err) {
      showToast('error', 'Failed to enable push notifications.');
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'SYSTEM': return '⚙️';
      case 'ACADEMIC': return '📚';
      case 'EVENT': return '🎉';
      case 'HACKATHON': return '💻';
      default: return '📢';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'SYSTEM': return { bg: '#EEF2FF', color: '#4F46E5' };
      case 'ACADEMIC': return { bg: '#ECFDF5', color: '#059669' };
      case 'EVENT': return { bg: '#FEF3C7', color: '#D97706' };
      case 'HACKATHON': return { bg: '#FCE7F3', color: '#DB2777' };
      default: return { bg: '#F3F4F6', color: '#374151' };
    }
  };

  const startItem = currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalElements);

  return (
    <DashboardLayout>
      <div className="ann-page">
        <Toast type={toast.type} message={toast.message} show={toast.show} onClose={hideToast} />

        <div className="ann-top">
          <div>
            <h2 className="ann-title">Platform Announcements</h2>
            <p className="ann-subtitle">
              Browse official updates, releases, and academic news from the Campus Coders team.
            </p>
          </div>
        </div>

        <div className="ann-layout" style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '28px', marginTop: '24px' }}>
          {/* Sidebar Left */}
          <div className="ann-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Categories */}
            <div style={{ background: '#FFFFFF', border: '1px solid #F0F4F8', borderRadius: '12px', padding: '20px' }}>
              <h4 style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', color: '#9CA3AF', textTransform: 'uppercase', margin: '0 0 14px' }}>CATEGORIES</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {['ALL', 'SYSTEM', 'ACADEMIC', 'EVENT', 'HACKATHON'].map(cat => {
                  const isActive = activeCategory === cat;
                  return (
                    <li
                      key={cat}
                      onClick={() => { setActiveCategory(cat); setCurrentPage(0); }}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '8px 12px', borderRadius: '8px', cursor: 'pointer',
                        fontSize: '0.85rem', fontWeight: isActive ? '700' : '500',
                        color: isActive ? '#8C701B' : '#4B5563',
                        background: isActive ? '#FFFBE6' : 'transparent',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {getCategoryIcon(cat)} {cat}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Push Notifications Widget */}
            <div style={{
              background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
              border: '1px solid #FDE68A', borderRadius: '12px', padding: '20px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                background: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 12px', color: '#fff'
              }}>
                <FiBell size={22} />
              </div>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#111827', margin: '0 0 8px' }}>
                Never miss an update!
              </h4>
              <p style={{ fontSize: '0.78rem', color: '#6B7280', margin: '0 0 16px', lineHeight: '1.5' }}>
                Enable push notifications to get instant alerts for important announcements.
              </p>
              {pushEnabled ? (
                <div style={{
                  padding: '8px 16px', borderRadius: '8px', background: '#ECFDF5',
                  color: '#059669', fontSize: '0.82rem', fontWeight: 700
                }}>
                  ✓ Notifications Enabled
                </div>
              ) : (
                <button onClick={handleEnablePush} style={{
                  width: '100%', padding: '10px 16px', borderRadius: '8px',
                  background: '#d97706', color: '#fff', border: 'none',
                  fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#b45309'}
                onMouseLeave={e => e.currentTarget.style.background = '#d97706'}>
                  Enable Notifications 🔔
                </button>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="ann-main">
            {/* Sorting Toolbar */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: '20px', padding: '12px 16px',
              background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#64748b' }}>
                <span style={{ fontWeight: 600 }}>Sort by:</span>
                {['Latest', 'Important', 'Popular'].map(opt => (
                  <button key={opt} onClick={() => { setSortBy(opt); setCurrentPage(0); }}
                    style={{
                      padding: '4px 12px', borderRadius: '6px', fontSize: '0.82rem',
                      fontWeight: sortBy === opt ? 700 : 500, cursor: 'pointer',
                      background: sortBy === opt ? '#FFFBEB' : 'transparent',
                      color: sortBy === opt ? '#d97706' : '#64748b',
                      border: sortBy === opt ? '1px solid #FDE68A' : '1px solid transparent',
                      transition: 'all 0.2s'
                    }}>
                    {opt}
                  </button>
                ))}
              </div>
              <button onClick={() => fetchAnnouncements()} style={{
                background: 'none', border: '1px solid #e2e8f0', borderRadius: '6px',
                padding: '4px 10px', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px',
                fontSize: '0.82rem'
              }}>
                <FiRefreshCw size={14} /> Refresh
              </button>
            </div>

            {/* Active Filter Badge */}
            {activeCategory !== 'ALL' && (
              <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  padding: '4px 12px', borderRadius: '6px', fontSize: '0.82rem',
                  fontWeight: 600, background: '#FFFBEB', color: '#92400E',
                  border: '1px solid #FDE68A'
                }}>
                  Showing: {activeCategory}
                </span>
                <button onClick={() => setActiveCategory('ALL')} style={{
                  background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer',
                  fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                  Clear <FiX size={12} />
                </button>
              </div>
            )}

            {/* Announcements List */}
            <div className="ann-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {loading ? (
                <p style={{ color: '#64748b', padding: '24px', textAlign: 'center' }}>Loading announcements...</p>
              ) : announcements.length === 0 ? (
                <div style={{
                  textAlign: 'center', padding: '60px 24px', background: '#ffffff',
                  border: '1px solid #e2e8f0', borderRadius: '14px'
                }}>
                  <span style={{ fontSize: '2.5rem' }}>📭</span>
                  <p style={{ color: '#94a3b8', marginTop: '12px', fontSize: '0.9rem' }}>No announcements found.</p>
                </div>
              ) : (
                announcements.map(a => {
                  const catColor = getCategoryColor(a.category);
                  return (
                    <div key={a.id} className="ann-item" id={`announcement-${a.id}`} style={{
                      background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px',
                      padding: '20px 24px', display: 'flex', alignItems: 'flex-start', gap: '16px',
                      transition: 'box-shadow 0.2s, transform 0.2s', cursor: 'default',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.02)'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.02)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                      <div style={{
                        width: '44px', height: '44px', borderRadius: '12px',
                        background: catColor.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.2rem', flexShrink: 0
                      }}>
                        {getCategoryIcon(a.category)}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                          <span style={{
                            padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700,
                            background: catColor.bg, color: catColor.color
                          }}>
                            {a.category || 'UPDATE'}
                          </span>
                          <span style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FiCalendar size={12} /> {a.createdAt ? new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                          </span>
                        </div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>{a.title}</h3>
                        <p style={{ fontSize: '0.88rem', color: '#6B7280', margin: 0, lineHeight: '1.5' }}>{a.message}</p>
                      </div>

                      {/* Action Button */}
                      <button style={{
                        background: 'none', border: '1px solid #e2e8f0', borderRadius: '8px',
                        padding: '6px 14px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
                        color: '#d97706', display: 'flex', alignItems: 'center', gap: '4px',
                        whiteSpace: 'nowrap', flexShrink: 0, transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#FFFBEB'; e.currentTarget.style.borderColor = '#FDE68A'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = '#e2e8f0'; }}>
                        Read More <FiArrowRight size={14} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination */}
            {totalElements > 0 && (
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginTop: '24px', padding: '16px 0'
              }}>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Showing {startItem} to {endItem} of {totalElements}
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)}
                    style={{
                      padding: '6px 10px', borderRadius: '8px', border: '1px solid #d1d5db',
                      background: currentPage === 0 ? '#f8fafc' : '#fff',
                      cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
                      color: currentPage === 0 ? '#cbd5e1' : '#374151'
                    }}>
                    <FiChevronLeft size={16} />
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
                    <button key={i} onClick={() => setCurrentPage(i)}
                      style={{
                        padding: '6px 12px', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem',
                        border: currentPage === i ? 'none' : '1px solid #d1d5db',
                        background: currentPage === i ? '#d97706' : '#fff',
                        color: currentPage === i ? '#fff' : '#374151',
                        cursor: 'pointer'
                      }}>
                      {i + 1}
                    </button>
                  ))}
                  <button disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage(p => p + 1)}
                    style={{
                      padding: '6px 10px', borderRadius: '8px', border: '1px solid #d1d5db',
                      background: currentPage >= totalPages - 1 ? '#f8fafc' : '#fff',
                      cursor: currentPage >= totalPages - 1 ? 'not-allowed' : 'pointer',
                      color: currentPage >= totalPages - 1 ? '#cbd5e1' : '#374151'
                    }}>
                    <FiChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
