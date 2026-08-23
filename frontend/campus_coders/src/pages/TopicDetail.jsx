import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiBookmark, FiMessageSquare } from 'react-icons/fi';
import DashboardLayout from '../components/DashboardLayout';
import ResourceCard from '../components/ResourceCard';
import Toast from '../components/Toast';
import api from '../api/client';

export default function TopicDetail() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState(null);
  const [resources, setResources] = useState([]);
  const [progress, setProgress] = useState(null);
  const [pathProgress, setPathProgress] = useState(null);
  const [siblings, setSiblings] = useState([]);
  const [bookmarked, setBookmarked] = useState(false);
  const [completedIds, setCompletedIds] = useState(new Set());
  const [bookmarkedResourceIds, setBookmarkedResourceIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });

  const showToast = useCallback((type, message) => setToast({ show: true, type, message }), []);

  const refreshProgress = useCallback(async (topicNumericId, pathNumericId) => {
    const [tProg, completed, bookmarks] = await Promise.all([
      api.get(`/learning-progress/topics/${topicNumericId}`).catch(() => ({ data: null })),
      api.get('/learning-progress').catch(() => ({ data: [] })),
      api.get('/bookmarks').catch(() => ({ data: {} })),
    ]);
    setProgress(tProg.data);
    setCompletedIds(new Set((completed.data || []).map((row) => row.resourceId)));
    setBookmarkedResourceIds(new Set(bookmarks.data?.bookmarkedResourceIds || []));
    setBookmarked((bookmarks.data?.bookmarkedTopicIds || []).includes(topicNumericId));
    if (pathNumericId) {
      const p = await api.get(`/learning-progress/paths/${pathNumericId}`).catch(() => ({ data: null }));
      setPathProgress(p.data);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [topicRes, resourceRes] = await Promise.all([
          api.get(`/topics/${topicId}`),
          api.get(`/topics/${topicId}/resources`),
        ]);
        if (cancelled) return;
        const t = topicRes.data;
        setTopic(t);
        setResources(resourceRes.data || []);
        if (t.learningPathSlug) {
          const pathRes = await api.get(`/learning-paths/${t.learningPathSlug}/details`).catch(() => ({ data: null }));
          if (!cancelled) setSiblings(pathRes.data?.topics || []);
        }
        await refreshProgress(t.id, t.learningPathId);
      } catch (err) {
        showToast('error', err.response?.data?.message || 'Topic not found.');
        setTopic(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [topicId, refreshProgress, showToast]);

  const toggleTopicBookmark = async () => {
    if (!topic) return;
    try {
      const res = await api.post(`/topics/${topic.id}/bookmark`);
      setBookmarked(Boolean(res.data?.bookmarked));
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Could not update bookmark.');
    }
  };

  const toggleResourceBookmark = async (resource) => {
    try {
      const res = await api.post(`/resources/${resource.id}/bookmark`);
      setBookmarkedResourceIds((prev) => {
        const next = new Set(prev);
        if (res.data?.bookmarked) next.add(resource.id);
        else next.delete(resource.id);
        return next;
      });
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Could not update bookmark.');
    }
  };

  const toggleComplete = async (resource) => {
    const done = completedIds.has(resource.id);
    try {
      if (done) {
        await api.delete(`/learning-progress/complete/${resource.id}`);
        setCompletedIds((prev) => {
          const next = new Set(prev);
          next.delete(resource.id);
          return next;
        });
        showToast('success', 'Marked incomplete.');
      } else {
        await api.post('/learning-progress/complete', { resourceId: resource.id });
        setCompletedIds((prev) => new Set(prev).add(resource.id));
        showToast('success', 'Marked complete.');
      }
      if (topic) await refreshProgress(topic.id, topic.learningPathId);
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Could not update progress.');
    }
  };

  const nextTopic = siblings.find((s) => s.slug !== topicId && s.sortOrder > (topic?.sortOrder || 0))
    || siblings.find((s) => s.slug !== topicId);

  return (
    <DashboardLayout>
      <div className="top-detail-container">
        <Toast type={toast.type} message={toast.message} show={toast.show} onClose={() => setToast((t) => ({ ...t, show: false }))} />

        <div className="top-breadcrumb">
          <button type="button" className="top-back-btn" onClick={() => navigate(topic?.learningPathSlug ? `/dashboard/resources/paths/${topic.learningPathSlug}` : '/dashboard/resources')}>
            <FiArrowLeft size={16} />
          </button>
          <span className="top-crumb-link" onClick={() => navigate('/dashboard/resources')}>Learning</span>
          {topic?.learningPathTitle && (
            <>
              <span className="top-crumb-sep">&gt;</span>
              <span className="top-crumb-link" onClick={() => navigate(`/dashboard/resources/paths/${topic.learningPathSlug}`)}>
                {topic.learningPathTitle}
              </span>
            </>
          )}
          {topic && (
            <>
              <span className="top-crumb-sep">&gt;</span>
              <span className="top-crumb-current">{topic.title}</span>
            </>
          )}
        </div>

        {loading && <p className="sd-muted">Loading topic...</p>}
        {!loading && !topic && <p className="sd-muted">This topic is not available.</p>}

        {topic && (
          <>
            <div className="top-header-box">
              <div className="top-header-top">
                <div className="top-title-area">
                  <h1 className="top-title">{topic.title}</h1>
                  {topic.description && <p className="top-subtitle">{topic.description}</p>}
                  <div className="top-meta-pills">
                    <span className="top-pill">{resources.length} resources</span>
                    {progress && <span className="top-pill">{progress.progressPercentage}% complete</span>}
                  </div>
                </div>
                <div className="top-actions-area">
                  <button
                    type="button"
                    className={`top-icon-btn ${bookmarked ? 'active' : ''}`}
                    onClick={toggleTopicBookmark}
                    aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark topic'}
                  >
                    <FiBookmark size={18} fill={bookmarked ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>
            </div>

            <div className="top-main-layout">
              <div className="top-main-col">
                <div className="top-tab-content">
                  <h3 className="top-section-heading">Resources</h3>
                  {resources.length === 0 ? (
                    <p className="sd-muted">No resources in this topic yet.</p>
                  ) : (
                    <div className="top-resources-list">
                      {resources.map((res) => (
                        <ResourceCard
                          key={res.id}
                          resource={res}
                          bookmarked={bookmarkedResourceIds.has(res.id)}
                          completed={completedIds.has(res.id)}
                          onToggleBookmark={toggleResourceBookmark}
                          onToggleComplete={toggleComplete}
                        />
                      ))}
                    </div>
                  )}
                  <button type="button" className="top-ask-link" onClick={() => navigate('/dashboard/discussions')}>
                    <FiMessageSquare size={15} /> Ask in discussions
                  </button>
                </div>
              </div>

              <div className="top-side-col">
                <div className="top-side-card">
                  <div className="top-side-title">{topic.learningPathTitle}</div>
                  {pathProgress && (
                    <div className="top-side-prog-wrap">
                      <div className="top-side-prog-lbl">
                        <span>Path progress</span>
                        <span>{pathProgress.progressPercentage}%</span>
                      </div>
                      <div className="top-side-prog-bar-bg">
                        <div className="top-side-prog-bar-fill" style={{ width: `${pathProgress.progressPercentage}%` }} />
                      </div>
                    </div>
                  )}
                  <div className="top-roadmap-list">
                    {siblings.map((step) => (
                      <button
                        type="button"
                        key={step.id}
                        className={`top-step-item ${step.slug === topic.slug ? 'active' : ''}`}
                        onClick={() => navigate(`/dashboard/resources/topics/${step.slug}`)}
                      >
                        <span className="top-step-title">{step.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
                {nextTopic && (
                  <div className="top-side-card">
                    <div className="top-upcoming-tag">Next topic</div>
                    <h5 className="top-upcoming-title">{nextTopic.title}</h5>
                    <button
                      type="button"
                      className="top-side-btn-outline"
                      onClick={() => navigate(`/dashboard/resources/topics/${nextTopic.slug}`)}
                    >
                      Open →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
