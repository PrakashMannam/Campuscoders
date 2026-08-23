import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSearch, FiBookmark, FiChevronRight } from 'react-icons/fi';
import DashboardLayout from '../components/DashboardLayout';
import Toast from '../components/Toast';
import api from '../api/client';
import { difficultyClass, humanize } from '../utils/label';

export default function AllLearningPaths() {
  const navigate = useNavigate();
  const [paths, setPaths] = useState([]);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });

  const showToast = useCallback((type, message) => setToast({ show: true, type, message }), []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [pathRes, bmRes] = await Promise.all([
          api.get('/learning-paths?page=0&size=50'),
          api.get('/bookmarks').catch(() => ({ data: { bookmarkedPathIds: [] } })),
        ]);
        if (cancelled) return;
        setPaths(pathRes.data?.content || []);
        setBookmarkedIds(new Set(bmRes.data?.bookmarkedPathIds || []));
      } catch (err) {
        showToast('error', err.response?.data?.message || 'Could not load paths.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [showToast]);

  const filteredPaths = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return paths.filter((path) => {
      const matchesSearch = !q
        || path.title?.toLowerCase().includes(q)
        || path.description?.toLowerCase().includes(q)
        || path.category?.toLowerCase().includes(q);
      const matchesDiff = difficultyFilter === 'All'
        || humanize(path.difficulty) === difficultyFilter;
      return matchesSearch && matchesDiff;
    });
  }, [paths, searchQuery, difficultyFilter]);

  const grouped = useMemo(() => {
    const map = new Map();
    filteredPaths.forEach((p) => {
      const key = p.category || 'Other';
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(p);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredPaths]);

  const toggleBookmark = async (e, path) => {
    e.stopPropagation();
    try {
      const res = await api.post(`/learning-paths/${path.id}/bookmark`);
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        if (res.data?.bookmarked) next.add(path.id);
        else next.delete(path.id);
        return next;
      });
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Could not update bookmark.');
    }
  };

  return (
    <DashboardLayout>
      <div className="alp-container">
        <Toast type={toast.type} message={toast.message} show={toast.show} onClose={() => setToast((t) => ({ ...t, show: false }))} />
        <div className="alp-breadcrumb">
          <button type="button" className="alp-back-link" onClick={() => navigate('/dashboard/resources')}>
            <FiArrowLeft size={16} /> Learning
          </button>
          <span className="alp-crumb-sep">/</span>
          <span className="alp-crumb-current">All paths</span>
        </div>

        <div className="alp-header-bar">
          <div>
            <h1 className="alp-title">All learning paths</h1>
            <p className="alp-subtitle">Browse the campus catalog.</p>
          </div>
          <div className="alp-top-controls">
            <div className="alp-search-box">
              <FiSearch size={16} className="alp-search-icon" />
              <input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <select
              className="form-select"
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              style={{ padding: '10px 12px', borderRadius: 8 }}
            >
              {['All', 'Beginner', 'Intermediate', 'Advanced'].map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {loading && <p className="sd-muted">Loading...</p>}
        {!loading && filteredPaths.length === 0 && <p className="sd-muted">No paths match.</p>}

        {grouped.map(([category, domainPaths]) => (
          <section key={category} className="alp-domain-section">
            <div className="alp-section-header">
              <h3 className="alp-domain-title">{category}</h3>
              <span className="alp-count-pill">{domainPaths.length}</span>
            </div>
            <div className="alp-cards-grid">
              {domainPaths.map((path) => {
                const bookmarked = bookmarkedIds.has(path.id);
                return (
                  <div key={path.id} className="alp-card">
                    <div className="alp-card-header">
                      <span className={`alp-diff-badge ${difficultyClass(path.difficulty)}`}>
                        {humanize(path.difficulty)}
                      </span>
                      <button
                        type="button"
                        className={`alp-bookmark-btn ${bookmarked ? 'active' : ''}`}
                        onClick={(e) => toggleBookmark(e, path)}
                      >
                        <FiBookmark size={18} fill={bookmarked ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                    <h4 className="alp-card-title">{path.title}</h4>
                    <p className="alp-card-desc">{path.shortDescription || path.description}</p>
                    {path.estimatedHours != null && (
                      <div className="alp-card-meta"><span>{path.estimatedHours}h</span></div>
                    )}
                    <button
                      type="button"
                      className="alp-explore-btn"
                      onClick={() => navigate(`/dashboard/resources/paths/${path.slug}`)}
                    >
                      Explore path <FiChevronRight size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </DashboardLayout>
  );
}
