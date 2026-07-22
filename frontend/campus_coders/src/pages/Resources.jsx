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
  const { isBookmarked } = useProgress();

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

        {/* ── User Bookmarked Resources ── */}
        <section className="res-section">
          <div className="res-section-header">
            <h3 className="res-section-title">
              <FiBookmark size={16} style={{ marginRight: 8, color: '#0284c7', verticalAlign: 'middle' }} />
               Bookmarked Resources
            </h3>
          </div>
          {userBookmarkedResources.length > 0 ? (
            <div className="res-bookmarked-grid">
              {userBookmarkedResources.map(r => (
                <ResourceCard key={r.id} resource={r} compact={true} />
              ))}
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
