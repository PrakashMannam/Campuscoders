import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiSearch, FiChevronRight, FiBookmark,
  FiMessageSquare, FiX, FiSlash
} from 'react-icons/fi';
import DashboardLayout from '../components/DashboardLayout';
import ResourceCard from '../components/ResourceCard';
import { learningPathsData } from '../data/learningPaths';
import { resourcesData } from '../data/resources';
import { useProgress } from '../context/ProgressContext';

const CATEGORY_CHIPS = [
  'All', 'Java', 'DSA', 'Spring Boot', 'React',
  'DBMS', 'Operating Systems', 'Computer Networks',
  'System Design', 'Aptitude', 'Interview Prep'
];

function resourceMatchesSearch(r, q) {
  if (!q) return true;
  const lower = q.toLowerCase();
  return (
    r.title.toLowerCase().includes(lower) ||
    (r.type && r.type.toLowerCase().includes(lower)) ||
    (r.difficulty && r.difficulty.toLowerCase().includes(lower)) ||
    (r.source && r.source.toLowerCase().includes(lower)) ||
    (r.tags && r.tags.some(t => t.toLowerCase().includes(lower)))
  );
}

export default function Resources() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const { isBookmarked, toggleBookmark } = useProgress();

  const hasActiveFilters = searchQuery.trim() !== '' || selectedCategory !== 'All';

  const clearAll = () => {
    setSearchQuery('');
    setSelectedCategory('All');
  };

  /* ── Learning path filtering ── */
  const filteredPaths = useMemo(() => {
    return learningPathsData.filter(path => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q ||
        path.title.toLowerCase().includes(q) ||
        path.description.toLowerCase().includes(q);
      if (selectedCategory === 'All') return matchesSearch;
      const catLower = selectedCategory.toLowerCase();
      const badgeLower = path.badge ? path.badge.toLowerCase() : '';
      const titleLower = path.title.toLowerCase();
      return matchesSearch && (
        badgeLower.includes(catLower) ||
        titleLower.includes(catLower) ||
        catLower.includes(badgeLower)
      );
    });
  }, [selectedCategory, searchQuery]);

  const featuredPaths = useMemo(() =>
    filteredPaths.filter(p => p.featured || selectedCategory !== 'All').slice(0, 6),
    [filteredPaths, selectedCategory]
  );

  /* ── User-bookmarked resources (search-aware) ── */
  const userBookmarkedResources = useMemo(() =>
    resourcesData
      .filter(r => isBookmarked(r.id, r.bookmarked) && resourceMatchesSearch(r, searchQuery)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchQuery, isBookmarked]
  );

  const hasNoResults = featuredPaths.length === 0 && userBookmarkedResources.length === 0;

  return (
    <DashboardLayout>
      <div className="res-hub-container">

        {/* ── Page Title ── */}
        <div className="res-page-title-row">
          <h1 className="res-hub-title">Resources</h1>
          <p className="res-hub-subtitle">
            Curated learning paths and resources — search, filter, and dive in.
          </p>
        </div>

        {/* ── Search Bar (full-width) ── */}
        <div className="res-search-bar-row">
          <div className="res-search-wrapper">
            <FiSearch className="res-search-icon" size={15} />
            <input
              type="text"
              className="res-search-input"
              placeholder="Search by title, type, tag, difficulty…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="res-search-clear"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <FiX size={13} />
              </button>
            )}
          </div>
        </div>

        {/* ── Category chips + inline Clear All ── */}
        <div className="res-chips-bar">
          {CATEGORY_CHIPS.map(chip => (
            <button
              key={chip}
              className={`res-chip-btn ${selectedCategory === chip ? 'active' : ''}`}
              onClick={() => setSelectedCategory(chip)}
            >
              {chip}
              {selectedCategory === chip && chip !== 'All' && (
                <span
                  className="res-chip-close"
                  onClick={e => { e.stopPropagation(); setSelectedCategory('All'); }}
                >
                  <FiX size={10} />
                </span>
              )}
            </button>
          ))}

          {/* Clear All — appears inline as last chip when filters are active */}
          {hasActiveFilters && (
            <button className="res-chip-clear-all" onClick={clearAll}>
              <FiSlash size={11} /> Clear all
            </button>
          )}
        </div>

        {/* ── Empty state ── */}
        {hasNoResults && (
          <div className="res-empty-state">
            <span style={{ fontSize: '2rem' }}>🔍</span>
            <p>
              No results{searchQuery ? ` for "${searchQuery}"` : ''}
              {selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}.
            </p>
            <button className="res-reset-btn" onClick={clearAll}>Reset Filters</button>
          </div>
        )}

        {/* ── Featured Learning Paths ── */}
        {featuredPaths.length > 0 && (
          <section className="res-section">
            <div className="res-section-header">
              <h3 className="res-section-title">Featured Learning Paths</h3>
              <button className="res-view-all-btn" onClick={() => navigate('/dashboard/resources/paths')}>
                View All <FiChevronRight size={14} />
              </button>
            </div>
            <div className="res-paths-grid">
              {featuredPaths.map(path => (
                <div key={path.id} className="res-path-card">
                  <div className="res-path-top">
                    <div className="res-path-icon-box" style={{ background: path.iconBg || '#FFF4E6' }}>
                      <span className="res-path-emoji">{path.icon}</span>
                    </div>
                    <span className={`res-diff-badge ${path.difficulty.toLowerCase()}`}>
                      {path.difficulty}
                    </span>
                  </div>
                  <h4 className="res-path-title">{path.title}</h4>
                  <p className="res-path-desc">{path.shortDesc || path.description}</p>
                  <div className="res-path-meta">
                    <span>{path.topicCount} Topics</span>
                    <span>• {path.estimatedDuration}</span>
                  </div>
                  <button
                    className="res-explore-btn"
                    onClick={() => navigate(`/dashboard/resources/paths/${path.id}`)}
                  >
                    Explore Path <FiChevronRight size={12} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Bookmarked Resources (Rich Data Table) ── */}
        <section className="res-section">
          <div className="res-section-header">
            <h3 className="res-section-title">
              <FiBookmark size={16} style={{ marginRight: 8, color: '#d97706', verticalAlign: 'middle' }} />
               Bookmarked Resources
            </h3>
            <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Your saved resources for quick access</span>
          </div>
          {userBookmarkedResources.length > 0 ? (
            <div className="res-bookmark-table-container" style={{
              background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px',
              overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}>
              <table className="res-bookmark-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f1f5f9', textAlign: 'left' }}>
                    <th style={{ padding: '14px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>RESOURCE</th>
                    <th style={{ padding: '14px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>TYPE</th>
                    <th style={{ padding: '14px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>DIFFICULTY</th>
                    <th style={{ padding: '14px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>DURATION</th>
                    <th style={{ padding: '14px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ADDED ON</th>
                    <th style={{ padding: '14px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>PROGRESS</th>
                    <th style={{ padding: '14px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {userBookmarkedResources.map(r => {
                    const typeIcon = r.type === 'Video' ? '🎬' : r.type === 'Documentation' ? '📄' : r.type === 'Article' ? '📝' : '📚';
                    const diffColor = r.difficulty === 'Beginner' ? { bg: '#ECFDF5', color: '#059669' }
                      : r.difficulty === 'Intermediate' ? { bg: '#FEF3C7', color: '#D97706' }
                      : r.difficulty === 'Advanced' ? { bg: '#FEF2F2', color: '#DC2626' }
                      : { bg: '#F3F4F6', color: '#374151' };
                    const progressPct = r.completed ? 100 : Math.floor(Math.random() * 80 + 10);
                    const progressColor = progressPct === 100 ? '#10b981' : progressPct > 60 ? '#d97706' : '#ef4444';

                    return (
                      <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#fafbfc'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        {/* Resource name + source */}
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '36px', height: '36px', borderRadius: '10px',
                              background: r.type === 'Video' ? '#FEF3C7' : r.type === 'Article' ? '#DBEAFE' : '#E0E7FF',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '1rem', flexShrink: 0
                            }}>{typeIcon}</div>
                            <div>
                              <div style={{ fontWeight: 700, color: '#111827', fontSize: '0.88rem' }}>{r.title}</div>
                              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{r.source || r.type}</div>
                            </div>
                          </div>
                        </td>
                        {/* Type */}
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#4b5563' }}>
                            <span>{typeIcon}</span> {r.type}
                          </div>
                        </td>
                        {/* Difficulty */}
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{
                            padding: '3px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700,
                            background: diffColor.bg, color: diffColor.color
                          }}>{r.difficulty}</span>
                        </td>
                        {/* Duration */}
                        <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: '#4b5563' }}>
                          {r.duration || '—'}
                        </td>
                        {/* Added On */}
                        <td style={{ padding: '14px 16px', fontSize: '0.82rem', color: '#94a3b8' }}>
                          {new Date(Date.now() - Math.random() * 30 * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        {/* Progress */}
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              width: '80px', height: '6px', borderRadius: '3px', background: '#f1f5f9', overflow: 'hidden'
                            }}>
                              <div style={{
                                width: `${progressPct}%`, height: '100%', borderRadius: '3px',
                                background: progressColor, transition: 'width 0.6s ease'
                              }}></div>
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: progressColor }}>
                              {progressPct === 100 ? 'Completed' : `${progressPct}%`}
                            </span>
                          </div>
                        </td>
                        {/* Action */}
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              onClick={() => r.url && window.open(r.url, '_blank')}
                              title="Open resource"
                              style={{
                                background: 'none', border: '1px solid #e2e8f0', borderRadius: '6px',
                                padding: '5px 8px', cursor: 'pointer', color: '#d97706', fontSize: '0.82rem',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = '#FFFBEB'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                            >
                              🔗
                            </button>
                            <button 
                              title="Remove bookmark" 
                              onClick={() => toggleBookmark(r.id)}
                              style={{
                                background: 'none', border: '1px solid #e2e8f0', borderRadius: '6px',
                                padding: '5px 8px', cursor: 'pointer', color: '#ef4444', fontSize: '0.82rem',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                            >
                              🔖
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {/* View All Link */}
              <div style={{ textAlign: 'right', padding: '12px 16px', borderTop: '1px solid #f1f5f9' }}>
                <button style={{
                  background: 'none', border: 'none', color: '#d97706', fontSize: '0.85rem',
                  fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px'
                }}>
                  View All Bookmarks <FiChevronRight size={14} />
                </button>
              </div>
            </div>
          ) : (
            <div className="res-bookmarks-empty">
              <FiBookmark size={28} style={{ color: '#cbd5e1', marginBottom: 8 }} />
              <p>No bookmarks yet. Open any resource and click the bookmark icon to save it here.</p>
            </div>
          )}
        </section>

        {/* ── Community Banner ── */}
        <div className="res-community-banner">
          <div className="res-banner-left">
            <div className="res-banner-icon-bg"><FiMessageSquare size={20} /></div>
            <div>
              <h4 className="res-banner-title">Need help with a topic?</h4>
              <p className="res-banner-sub">Ask doubts and learn together with the senior community.</p>
            </div>
          </div>
          <button className="res-banner-btn" onClick={() => navigate('/dashboard/discussions')}>
            Open Community →
          </button>
        </div>

      </div>
    </DashboardLayout>
  );
}
