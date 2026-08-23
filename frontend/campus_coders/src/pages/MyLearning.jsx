import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBookmark, FiBookOpen, FiChevronRight, FiExternalLink } from 'react-icons/fi';
import DashboardLayout from '../components/DashboardLayout';
import EmptyState from '../components/EmptyState';
import Toast from '../components/Toast';
import api from '../api/client';
import { humanize } from '../utils/label';

export default function MyLearning() {
  const navigate = useNavigate();
  const [inProgress, setInProgress] = useState([]);
  const [bookmarkedPaths, setBookmarkedPaths] = useState([]);
  const [bookmarkedResources, setBookmarkedResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });
  const showToast = useCallback((type, message) => setToast({ show: true, type, message }), []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [progRes, bmRes, pathsRes] = await Promise.all([
        api.get('/learning-progress/in-progress'),
        api.get('/bookmarks'),
        api.get('/learning-paths?page=0&size=100'),
      ]);
      setInProgress(Array.isArray(progRes.data) ? progRes.data : []);

      const bm = bmRes.data || {};
      const pathIds = new Set(bm.bookmarkedPathIds || []);
      const resourceIds = bm.bookmarkedResourceIds || [];
      const allPaths = pathsRes.data?.content || [];
      setBookmarkedPaths(allPaths.filter((p) => pathIds.has(p.id)));

      const resources = await Promise.all(
        resourceIds.map((id) => api.get(`/resources/${id}`).then((r) => r.data).catch(() => null))
      );
      setBookmarkedResources(resources.filter(Boolean));
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Could not load My Learning.');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const hasAnything =
    inProgress.length > 0
    || bookmarkedPaths.length > 0
    || bookmarkedResources.length > 0;

  return (
    <DashboardLayout>
      <div className="jp-page">
        <Toast type={toast.type} message={toast.message} show={toast.show} onClose={() => setToast((t) => ({ ...t, show: false }))} />

        <header className="jp-header">
          <div>
            <p className="jp-sub">
              Paths in progress and bookmarks.{' '}
              <button type="button" className="jp-inline-link" onClick={() => navigate('/dashboard/resources')}>
                Browse learning paths
              </button>
            </p>
          </div>
        </header>

        {loading ? (
          <div className="jp-skel-stack" aria-busy="true">
            <div className="skeleton jp-skel-row" />
            <div className="skeleton jp-skel-row" />
          </div>
        ) : !hasAnything ? (
          <EmptyState
            title="Nothing saved yet"
            description="Start a learning path or bookmark a resource to see it here."
            action={(
              <button type="button" className="btn btn-primary" onClick={() => navigate('/dashboard/resources')}>
                Go to Learning
              </button>
            )}
          />
        ) : (
          <div className="jp-stack">
            <section className="jp-panel">
              <div className="jp-panel-head">
                <h3><FiBookOpen size={16} /> In progress</h3>
              </div>
              {inProgress.length === 0 ? (
                <p className="sd-muted">Complete a resource in a path to track progress here.</p>
              ) : (
                <ul className="jp-row-list">
                  {inProgress.map((path) => (
                    <li key={path.learningPathId}>
                      <button
                        type="button"
                        className="jp-row-link"
                        onClick={() => navigate(`/dashboard/resources/paths/${path.slug}`)}
                      >
                        <span className="jp-row-copy">
                          <strong>{path.title}</strong>
                          <span className="sd-muted">
                            {path.completedResources}/{path.totalResources} resources
                            {path.difficulty ? ` - ${humanize(path.difficulty)}` : ''}
                          </span>
                          <span className="sd-continue-bar" aria-hidden="true">
                            <span className="sd-continue-fill" style={{ width: `${Math.min(100, path.progressPercentage || 0)}%` }} />
                          </span>
                        </span>
                        <span className="jp-row-action">Continue <FiChevronRight size={16} /></span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="jp-panel">
              <div className="jp-panel-head">
                <h3><FiBookmark size={16} /> Bookmarked resources</h3>
              </div>
              {bookmarkedResources.length === 0 ? (
                <p className="sd-muted">No bookmarked resources yet.</p>
              ) : (
                <ul className="jp-row-list">
                  {bookmarkedResources.map((r) => (
                    <li key={r.id}>
                      {r.url ? (
                        <a href={r.url} target="_blank" rel="noopener noreferrer" className="jp-row-link">
                          <span className="jp-row-copy">
                            <strong>{r.title}</strong>
                            <span className="sd-muted">
                              {humanize(r.type)}
                              {r.provider ? ` - ${r.provider}` : ''}
                            </span>
                          </span>
                          <span className="jp-row-action">Open <FiExternalLink size={14} /></span>
                        </a>
                      ) : (
                        <div className="jp-row-static">
                          <span className="jp-row-copy">
                            <strong>{r.title}</strong>
                            <span className="sd-muted">{humanize(r.type)}</span>
                          </span>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {bookmarkedPaths.length > 0 && (
              <section className="jp-panel">
                <div className="jp-panel-head">
                  <h3><FiBookmark size={16} /> Bookmarked paths</h3>
                </div>
                <ul className="jp-row-list">
                  {bookmarkedPaths.map((p) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        className="jp-row-link"
                        onClick={() => navigate(`/dashboard/resources/paths/${p.slug}`)}
                      >
                        <span className="jp-row-copy">
                          <strong>{p.title}</strong>
                          <span className="sd-muted">{p.category || humanize(p.difficulty)}</span>
                        </span>
                        <span className="jp-row-action">Open <FiChevronRight size={16} /></span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
