import React, { useState, useEffect, useCallback } from 'react';
import { FiRefreshCw, FiX, FiChevronLeft, FiChevronRight, FiArrowRight } from 'react-icons/fi';
import DashboardLayout from '../components/DashboardLayout';
import Toast from '../components/Toast';
import api from '../api/client';
import { humanize } from '../utils/label';

const CATEGORIES = [
  { id: 'ALL', color: 'var(--gold)' },
  { id: 'PLATFORM_UPDATE', color: '#6366F1' },
  { id: 'EVENT', color: '#F59E0B' },
  { id: 'ACADEMIC_NEWS', color: '#10B981' },
  { id: 'SYSTEM_MAINTENANCE', color: '#EF4444' },
  { id: 'CAREER_CENTER', color: '#EC4899' },
];

function categoryColor(category) {
  return CATEGORIES.find((c) => c.id === category)?.color || 'var(--gold)';
}

function actionLabel(announcement) {
  const label = (announcement.actionLabel || '').trim();
  if (!label) return 'Open';
  if (/^https?:\/\//i.test(label) || label.includes('.')) return 'Open link';
  return label;
}

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 5;

  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });
  const showToast = useCallback((type, message) => {
    setToast({ show: true, type, message });
  }, []);
  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, show: false }));
  }, []);

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/announcements?page=${currentPage}&size=${pageSize}`;
      if (activeCategory !== 'ALL') {
        url += `&category=${activeCategory}`;
      }
      const res = await api.get(url);
      setAnnouncements(res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalElements(res.data.totalElements || 0);
    } catch {
      showToast('error', 'Failed to load announcements.');
    } finally {
      setLoading(false);
    }
  }, [activeCategory, currentPage, showToast]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const startItem = totalElements === 0 ? 0 : currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalElements);
  const activeColor = categoryColor(activeCategory);

  return (
    <DashboardLayout>
      <div className="ann-page">
        <Toast type={toast.type} message={toast.message} show={toast.show} onClose={hideToast} />

        <div className="ann-top">
          <div>
            <h2 className="ann-title">Announcements</h2>
            <p className="ann-subtitle">
              Official updates, releases, and academic news from the Campus Coders team.
            </p>
          </div>
        </div>

        <div className="ann-layout">
          <aside className="ann-side">
            <div className="ann-side-card">
              <h4 className="ann-side-label">Categories</h4>
              <ul className="ann-cat-list">
                {CATEGORIES.map((cat) => {
                  const isActive = activeCategory === cat.id;
                  const displayName = cat.id === 'ALL' ? 'All' : humanize(cat.id);
                  return (
                    <li key={cat.id}>
                      <button
                        type="button"
                        className={`ann-cat-btn ${isActive ? 'is-active' : ''}`}
                        onClick={() => {
                          setActiveCategory(cat.id);
                          setCurrentPage(0);
                        }}
                      >
                        <span className="ann-cat-dot" style={{ background: cat.color }} />
                        <span className="ann-cat-name">{displayName}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="ann-side-card ann-side-note">
              <h4>In-app alerts</h4>
              <p>
                New announcements and discussion replies appear under Notifications in your dashboard.
              </p>
            </div>
          </aside>

          <div className="ann-main">
            <div className="ann-toolbar">
              <div className="ann-toolbar-left">
                <span>Sort by:</span>
                <span className="ann-sort-pill">Latest</span>
              </div>
              <button type="button" className="ann-refresh" onClick={() => fetchAnnouncements()}>
                <FiRefreshCw size={14} /> Refresh
              </button>
            </div>

            {activeCategory !== 'ALL' && (
              <div className="ann-active-filter">
                <span
                  className="ann-chip"
                  style={{ background: `${activeColor}22`, color: activeColor }}
                >
                  {humanize(activeCategory)}
                </span>
                <button type="button" className="ann-clear" onClick={() => setActiveCategory('ALL')}>
                  Clear <FiX size={12} />
                </button>
              </div>
            )}

            <div className="ann-list">
              {loading ? (
                <p className="ann-muted">Loading announcements...</p>
              ) : announcements.length === 0 ? (
                <div className="ann-empty">
                  <p>No announcements found.</p>
                </div>
              ) : (
                announcements.map((a) => {
                  const color = categoryColor(a.category);
                  return (
                    <article key={a.id} className="ann-card" id={`announcement-${a.id}`}>
                      <div className="ann-card-body">
                        <div className="ann-card-meta">
                          <span
                            className="ann-chip"
                            style={{ background: `${color}22`, color }}
                          >
                            {humanize(a.category) || 'Update'}
                          </span>
                          <span className="ann-date">
                            {a.createdAt
                              ? new Date(a.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })
                              : 'Recent'}
                          </span>
                        </div>
                        <h3>{a.title}</h3>
                        <p>{a.message}</p>
                      </div>
                      {a.actionUrl ? (
                        <a
                          href={a.actionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ann-action"
                        >
                          {actionLabel(a)} <FiArrowRight size={14} />
                        </a>
                      ) : null}
                    </article>
                  );
                })
              )}
            </div>

            {totalElements > 0 && (
              <div className="ann-pagination">
                <div className="ann-muted">
                  Showing {startItem} to {endItem} of {totalElements}
                </div>
                <div className="ann-page-btns">
                  <button
                    type="button"
                    className="ann-page-btn"
                    disabled={currentPage === 0}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    <FiChevronLeft size={16} />
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`ann-page-btn ${currentPage === i ? 'is-active' : ''}`}
                      onClick={() => setCurrentPage(i)}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="ann-page-btn"
                    disabled={currentPage >= totalPages - 1}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
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
