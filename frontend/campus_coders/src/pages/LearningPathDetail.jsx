import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiBook, FiCheckCircle, FiPlayCircle, FiBookmark, FiChevronRight } from 'react-icons/fi';
import DashboardLayout from '../components/DashboardLayout';
import Toast from '../components/Toast';
import api from '../api/client';
import { difficultyClass, humanize } from '../utils/label';

export default function LearningPathDetail() {
  const { pathId } = useParams();
  const navigate = useNavigate();
  const [path, setPath] = useState(null);
  const [progress, setProgress] = useState(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [topicProgress, setTopicProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });

  const showToast = useCallback((type, message) => setToast({ show: true, type, message }), []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const detailRes = await api.get(`/learning-paths/${pathId}/details`);
        if (cancelled) return;
        const data = detailRes.data;
        setPath(data);

        const [progRes, bmRes] = await Promise.all([
          api.get(`/learning-progress/paths/${data.id}`).catch(() => ({ data: null })),
          api.get('/bookmarks').catch(() => ({ data: { bookmarkedPathIds: [] } })),
        ]);
        if (cancelled) return;
        setProgress(progRes.data);
        setBookmarked((bmRes.data?.bookmarkedPathIds || []).includes(data.id));

        const topics = data.topics || [];
        const tProg = await Promise.all(
          topics.map((t) =>
            api.get(`/learning-progress/topics/${t.id}`).then((r) => [t.id, r.data]).catch(() => [t.id, null])
          )
        );
        if (!cancelled) setTopicProgress(Object.fromEntries(tProg));
      } catch (err) {
        showToast('error', err.response?.data?.message || 'Path not found.');
        setPath(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [pathId, showToast]);

  const toggleBookmark = async () => {
    if (!path) return;
    try {
      const res = await api.post(`/learning-paths/${path.id}/bookmark`);
      setBookmarked(Boolean(res.data?.bookmarked));
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Could not update bookmark.');
    }
  };

  const topics = path?.topics || [];
  const nextTopic = topics.find((t) => (topicProgress[t.id]?.progressPercentage || 0) < 100) || topics[0];

  return (
    <DashboardLayout>
      <div className="lpd-container">
        <Toast type={toast.type} message={toast.message} show={toast.show} onClose={() => setToast((t) => ({ ...t, show: false }))} />
        <div className="lpd-breadcrumb">
          <button type="button" className="lpd-back-link" onClick={() => navigate('/dashboard/resources/paths')}>
            <FiArrowLeft size={16} /> All paths
          </button>
          {path && (
            <>
              <span className="lpd-crumb-sep">/</span>
              <span className="lpd-crumb-current">{path.title}</span>
            </>
          )}
        </div>

        {loading && <p className="sd-muted">Loading path...</p>}
        {!loading && !path && <p className="sd-muted">This path is not available.</p>}

        {path && (
          <>
            <div className="lpd-hero">
              <div className="lpd-hero-top">
                <div className="lpd-hero-title-wrap">
                  <div>
                    <span className={`lpd-diff-pill ${difficultyClass(path.difficulty)}`}>{humanize(path.difficulty)}</span>
                    <h1 className="lpd-title">{path.title}</h1>
                  </div>
                </div>
                <button type="button" className={`lpd-bookmark-btn ${bookmarked ? 'active' : ''}`} onClick={toggleBookmark}>
                  <FiBookmark size={18} fill={bookmarked ? 'currentColor' : 'none'} />
                </button>
              </div>
              <p className="lpd-description">{path.description || path.shortDescription}</p>
              <div className="lpd-stats-row">
                <div className="lpd-stat-item">
                  <FiBook size={18} className="lpd-stat-icon" />
                  <div>
                    <div className="lpd-stat-val">{topics.length}</div>
                    <div className="lpd-stat-lbl">Topics</div>
                  </div>
                </div>
                <div className="lpd-stat-item progress">
                  <div className="lpd-progress-header">
                    <span>Progress</span>
                    <span className="lpd-progress-pct">{progress?.progressPercentage ?? 0}%</span>
                  </div>
                  <div className="lpd-progress-bar-bg">
                    <div className="lpd-progress-bar-fill" style={{ width: `${progress?.progressPercentage ?? 0}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {nextTopic && (
              <div className="lpd-continue-card">
                <div className="lpd-continue-left">
                  <FiPlayCircle size={24} className="lpd-continue-icon" />
                  <div>
                    <div className="lpd-continue-tag">Continue</div>
                    <h4 className="lpd-continue-topic">{nextTopic.title}</h4>
                    <p className="lpd-continue-sub">
                      {nextTopic.resources?.length || 0} resources
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="lpd-continue-btn"
                  onClick={() => navigate(`/dashboard/resources/topics/${nextTopic.slug}`)}
                >
                  Open topic <FiChevronRight size={16} />
                </button>
              </div>
            )}

            <div className="lpd-curriculum-section">
              <h3 className="lpd-section-title">Topics</h3>
              {topics.length === 0 ? (
                <p className="sd-muted">No topics in this path yet.</p>
              ) : (
                <div className="lpd-topics-list">
                  {topics.map((t) => {
                    const pct = topicProgress[t.id]?.progressPercentage || 0;
                    const done = pct >= 100;
                    return (
                      <div
                        key={t.id}
                        className={`lpd-topic-row ${done ? 'completed' : ''}`}
                        onClick={() => navigate(`/dashboard/resources/topics/${t.slug}`)}
                      >
                        <div className="lpd-topic-status-icon">
                          {done ? <FiCheckCircle size={20} className="icon-completed" /> : <FiPlayCircle size={20} className="icon-in-progress" />}
                        </div>
                        <div className="lpd-topic-info">
                          <h5 className="lpd-topic-title">{t.title}</h5>
                          <div className="lpd-topic-meta">
                            <span>{t.resources?.length || 0} resources</span>
                            {pct > 0 && <span>{pct}%</span>}
                          </div>
                        </div>
                        <button type="button" className="lpd-topic-action-btn">
                          {done ? 'Review' : 'Start'} →
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
