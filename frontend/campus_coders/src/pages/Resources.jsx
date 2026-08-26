import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiChevronRight, FiBookmark, FiMessageSquare, FiX } from 'react-icons/fi';
import DashboardLayout from '../components/DashboardLayout';
import Toast from '../components/Toast';
import api from '../api/client';
import { difficultyClass, humanize } from '../utils/label';

export default function Resources() {
  const navigate = useNavigate();
  const [paths, setPaths] = useState([]);
  const [progressByPath, setProgressByPath] = useState({});
  const [bookmarkedResources, setBookmarkedResources] = useState([]);
  const [, setBookmarkResourceIds] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });

  const showToast = useCallback((type, message) => setToast({ show: true, type, message }), []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const pathRes = await api.get('/learning-paths?page=0&size=50');
      const list = pathRes.data?.content || [];
      setPaths(list);

      const progressEntries = await Promise.all(
        list.map((p) =>
          api.get(`/learning-progress/paths/${p.id}`)
            .then((r) => [p.id, r.data])
            .catch(() => [p.id, null])
        )
      );
      setProgressByPath(Object.fromEntries(progressEntries));

      try {
        const bm = await api.get('/bookmarks');
        const ids = bm.data?.bookmarkedResourceIds || [];
        setBookmarkResourceIds(ids);
        const resources = await Promise.all(
          ids.map((id) => api.get(`/resources/${id}`).then((r) => r.data).catch(() => null))
        );
        setBookmarkedResources(resources.filter(Boolean));
      } catch {
        setBookmarkResourceIds([]);
        setBookmarkedResources([]);
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Could not load learning paths.');
      setPaths([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const categories = useMemo(() => {
    const set = new Set(paths.map((p) => p.category).filter(Boolean));
    return ['All', ...Array.from(set).sort()];
  }, [paths]);

  const filteredPaths = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return paths.filter((path) => {
      const matchesSearch = !q
        || path.title?.toLowerCase().includes(q)
        || path.description?.toLowerCase().includes(q)
        || path.shortDescription?.toLowerCase().includes(q)
        || path.category?.toLowerCase().includes(q);
      const matchesCat = selectedCategory === 'All' || path.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [paths, searchQuery, selectedCategory]);

  const filteredBookmarks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return bookmarkedResources.filter((r) => {
      if (!q) return true;
      return (
        r.title?.toLowerCase().includes(q)
        || r.type?.toLowerCase().includes(q)
        || r.provider?.toLowerCase().includes(q)
      );
    });
  }, [bookmarkedResources, searchQuery]);

  const removeBookmark = async (resource) => {
    try {
      await api.post(`/resources/${resource.id}/bookmark`);
      setBookmarkedResources((prev) => prev.filter((r) => r.id !== resource.id));
      setBookmarkResourceIds((prev) => prev.filter((id) => id !== resource.id));
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Could not update bookmark.');
    }
  };

  return (
    <DashboardLayout>
      <div className="res-hub-container">
        <Toast type={toast.type} message={toast.message} show={toast.show} onClose={() => setToast((t) => ({ ...t, show: false }))} />

        <div className="res-page-title-row">
          <h1 className="res-hub-title">Learning</h1>
          <p className="res-hub-subtitle">Curated paths and saved resources from the campus catalog.</p>
        </div>

        <div className="res-search-bar-row">
          <div className="res-search-wrapper">
            <FiSearch className="res-search-icon" size={15} />
            <input
              type="text"
              className="res-search-input"
              placeholder="Search paths and bookmarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button type="button" className="res-search-clear" onClick={() => setSearchQuery('')} aria-label="Clear search">
                <FiX size={13} />
              </button>
            )}
          </div>
        </div>

        <div className="res-chips-bar">
          {categories.map((chip) => (
            <button
              key={chip}
              type="button"
              className={`res-chip-btn ${selectedCategory === chip ? 'active' : ''}`}
              onClick={() => setSelectedCategory(chip)}
            >
              {chip}
            </button>
          ))}
        </div>

        {loading && <p className="sd-muted">Loading catalog...</p>}

        {!loading && filteredPaths.length === 0 && (
          <div className="res-empty-state">
            <p>No learning paths{searchQuery ? ` matching "${searchQuery}"` : ''} yet.</p>
          </div>
        )}

        {filteredPaths.length > 0 && (
          <section className="res-section">
            <div className="res-section-header">
              <h3 className="res-section-title">Learning paths</h3>
              <button type="button" className="res-view-all-btn" onClick={() => navigate('/dashboard/resources/paths')}>
                View all <FiChevronRight size={14} />
              </button>
            </div>
            <div className="res-paths-grid">
              {filteredPaths.map((path) => {
                const progress = progressByPath[path.id];
                return (
                  <div key={path.id} className="res-path-card">
                    <div className="res-path-top">
                      <span className={`res-diff-badge ${difficultyClass(path.difficulty)}`}>
                        {humanize(path.difficulty)}
                      </span>
                    </div>
                    <h4 className="res-path-title">{path.title}</h4>
                    <p className="res-path-desc">{path.shortDescription || path.description}</p>
                    <div className="res-path-meta">
                      {path.category && <span>{path.category}</span>}
                    </div>
                    {progress && progress.totalResources > 0 && (
                      <div className="sd-continue-bar" style={{ margin: '10px 0 12px' }}>
                        <div className="sd-continue-fill" style={{ width: `${Math.min(100, progress.progressPercentage)}%` }} />
                      </div>
                    )}
                    <button
                      type="button"
                      className="res-explore-btn"
                      onClick={() => navigate(`/dashboard/resources/paths/${path.slug}`)}
                    >
                      Explore path <FiChevronRight size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section className="res-section">
          <div className="res-section-header">
            <h3 className="res-section-title">
              <FiBookmark size={16} style={{ marginRight: 8, color: '#d97706', verticalAlign: 'middle' }} />
              Bookmarked resources
            </h3>
          </div>
          {filteredBookmarks.length === 0 ? (
            <div className="res-bookmarks-empty">
              <FiBookmark size={28} style={{ color: '#cbd5e1', marginBottom: 8 }} />
              <p>No bookmarks yet. Open a resource and save it.</p>
            </div>
          ) : (
            <div className="res-bookmark-table-container" style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, overflow: 'auto' }}>
              <table className="res-bookmark-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ padding: 14, textAlign: 'left' }}>Resource</th>
                    <th style={{ padding: 14, textAlign: 'left' }}>Type</th>
                    <th style={{ padding: 14, textAlign: 'left' }}>Difficulty</th>
                    <th style={{ padding: 14, textAlign: 'left' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookmarks.map((r) => (
                    <tr key={r.id}>
                      <td style={{ padding: 14, fontWeight: 600 }}>{r.title}</td>
                      <td style={{ padding: 14 }}>{humanize(r.type)}</td>
                      <td style={{ padding: 14 }}>{humanize(r.difficulty)}</td>
                      <td style={{ padding: 14 }}>
                        {r.url && (
                          <a href={r.url} target="_blank" rel="noopener noreferrer" className="sd-text-link">Open</a>
                        )}
                        {' '}
                        <button type="button" className="sd-text-link" onClick={() => removeBookmark(r)}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="res-community-banner">
          <div className="res-banner-left">
            <div className="res-banner-icon-bg"><FiMessageSquare size={20} /></div>
            <div>
              <h4 className="res-banner-title">Need help with a topic?</h4>
              <p className="res-banner-sub">Ask in discussions.</p>
            </div>
          </div>
          <button type="button" className="res-banner-btn" onClick={() => navigate('/dashboard/discussions')}>
            Open discussions
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
