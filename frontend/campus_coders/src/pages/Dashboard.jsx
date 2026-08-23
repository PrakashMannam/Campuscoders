import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiExternalLink,
  FiCode, FiVolume2, FiMessageSquare, FiCalendar, FiBookOpen, FiBriefcase
} from 'react-icons/fi';
import DashboardLayout from '../components/DashboardLayout';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

function greetingForHour(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function humanize(value) {
  if (!value) return '';
  return String(value)
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function formatWhen(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function formatEventWhen(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function eventStatus(event, now = new Date()) {
  const start = event.startsAt ? new Date(event.startsAt) : null;
  const end = event.endsAt ? new Date(event.endsAt) : null;
  if (start && start <= now && (!end || end >= now)) return 'Live';
  return 'Upcoming';
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [events, setEvents] = useState([]);
  const [inProgress, setInProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });

  const showToast = useCallback((type, message) => {
    setToast({ show: true, type, message });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, show: false }));
  }, []);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [sumRes, annRes] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get('/announcements?page=0&size=3'),
      ]);
      setSummary(sumRes.data);
      setAnnouncements(annRes.data.content || []);
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to load dashboard.');
    } finally {
      setLoading(false);
    }

    try {
      const discRes = await api.get('/discussions?page=0&size=3');
      setDiscussions(discRes.data?.content || []);
    } catch {
      setDiscussions([]);
    }

    try {
      const eventRes = await api.get('/events/upcoming?limit=5');
      setEvents(Array.isArray(eventRes.data) ? eventRes.data : []);
    } catch {
      setEvents([]);
    }

    try {
      const progressRes = await api.get('/learning-progress/in-progress');
      setInProgress(Array.isArray(progressRes.data) ? progressRes.data : []);
    } catch {
      setInProgress([]);
    }
  }, [showToast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const firstName = summary?.fullName?.split(' ')[0] || user?.name?.split(' ')[0] || 'there';
  const potdChallenge = summary?.todayChallenge;
  const potd = potdChallenge?.codingProblem || null;

  return (
    <DashboardLayout>
      <div className="sd-page sd-home">
        <Toast type={toast.type} message={toast.message} show={toast.show} onClose={hideToast} />

        {loading && !summary ? (
          <div className="sd-skel-stack" aria-busy="true">
            <div className="sd-skel sd-skel-hero" />
            <div className="sd-skel-row">
              <div className="sd-skel" />
              <div className="sd-skel" />
              <div className="sd-skel" />
            </div>
            <div className="sd-skel sd-skel-wide" />
          </div>
        ) : (
          <>
            <section className="sd-welcome-banner">
              <div className="sd-welcome-text">
                <p className="sd-kicker">{greetingForHour()}</p>
                <h1>{firstName}.</h1>
                <p>Learn → Practice → Discuss → Prepare. Your workspace for today.</p>
              </div>
              <div className="sd-welcome-mark" aria-hidden="true">
                <FiCode size={36} />
              </div>
            </section>

            <section className="sd-quick-links">
              <button type="button" className="sd-quick-link" onClick={() => navigate('/dashboard/practice')}>
                <FiCode size={16} /> Practice
              </button>
              <button type="button" className="sd-quick-link" onClick={() => navigate('/dashboard/resources')}>
                <FiBookOpen size={16} /> Learning
              </button>
              <button type="button" className="sd-quick-link" onClick={() => navigate('/dashboard/discussions')}>
                <FiMessageSquare size={16} /> Discuss
              </button>
              <button type="button" className="sd-quick-link" onClick={() => navigate('/dashboard/placement')}>
                <FiBriefcase size={16} /> Placement
              </button>
            </section>

            <section className="sd-mid sd-mid-three">
              <article className="sd-potd">
                <div className="sd-potd-top">
                  <span className="sd-potd-badge">Today's challenge</span>
                  {potd?.platform && <span className="sd-chip">{potd.platform}</span>}
                </div>
                {potdChallenge && potd ? (
                  <>
                    <h2>{potd.title}</h2>
                    <p className="sd-potd-meta">{humanize(potd.difficulty)}</p>
                    {potd.tags && (
                      <div className="sd-potd-tags">
                        {potd.tags.split(',').map((tag) => tag.trim()).filter(Boolean).map((tag) => (
                          <span key={tag} className="sd-potd-tag">{tag}</span>
                        ))}
                      </div>
                    )}
                    <p className="sd-muted" style={{ margin: '0 0 12px', fontSize: '0.82rem' }}>
                      Curated link only - open and practice on the host platform.
                    </p>
                    <div className="sd-potd-actions">
                      {potd.problemUrl && (
                        <a href={potd.problemUrl} target="_blank" rel="noopener noreferrer" className="btn btn-dark">
                          Open problem <FiExternalLink size={14} />
                        </a>
                      )}
                      <button type="button" className="btn btn-secondary" onClick={() => navigate('/dashboard/practice')}>
                        Practice hub
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="sd-empty">
                    <p>No challenge posted today.</p>
                    <button type="button" className="sd-text-link" onClick={() => navigate('/dashboard/practice')}>
                      Open Practice
                    </button>
                  </div>
                )}
              </article>

              <article className="sd-panel">
                <div className="sd-panel-head">
                  <h3><FiVolume2 size={16} /> Announcements</h3>
                  <button type="button" className="sd-text-link" onClick={() => navigate('/dashboard/announcements')}>
                    View all
                  </button>
                </div>
                {announcements.length === 0 ? (
                  <p className="sd-muted">No announcements yet.</p>
                ) : (
                  <ul className="sd-list">
                    {announcements.map((a) => (
                      <li key={a.id}>
                        <span className="sd-chip">{humanize(a.category)}</span>
                        <strong>{a.title}</strong>
                        <span className="sd-muted">{formatWhen(a.createdAt)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </article>

              <article className="sd-panel">
                <div className="sd-panel-head">
                  <h3><FiCalendar size={16} /> Events</h3>
                  <button type="button" className="sd-text-link" onClick={() => navigate('/dashboard/events')}>
                    View all
                  </button>
                </div>
                {events.length === 0 ? (
                  <p className="sd-muted">No contests or sessions scheduled yet.</p>
                ) : (
                  <ul className="sd-list">
                    {events.map((ev) => (
                      <li key={ev.id}>
                        <div className="sd-event-row">
                          <span className="sd-chip">{humanize(ev.type)}</span>
                          <span className={`sd-chip ${eventStatus(ev) === 'Live' ? 'sd-chip-live' : ''}`}>{eventStatus(ev)}</span>
                        </div>
                        <strong>{ev.title}</strong>
                        <span className="sd-muted">
                          {ev.platform ? `${ev.platform} - ` : ''}{formatEventWhen(ev.startsAt)}
                        </span>
                        {ev.actionUrl && (
                          <a href={ev.actionUrl} target="_blank" rel="noopener noreferrer" className="sd-text-link">
                            {ev.actionLabel || 'Open'}
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            </section>

            <section className="sd-panel sd-continue">
              <div className="sd-panel-head">
                <h3><FiBookOpen size={16} /> Continue learning</h3>
                <button type="button" className="sd-text-link" onClick={() => navigate('/dashboard/my-learning')}>
                  My Learning
                </button>
              </div>
              {inProgress.length === 0 ? (
                <p className="sd-muted">Complete a resource in a learning path to see progress here.</p>
              ) : (
                <ul className="sd-continue-list">
                  {inProgress.map((path) => (
                    <li key={path.learningPathId}>
                      <div className="sd-continue-copy">
                        <strong>{path.title}</strong>
                        <span className="sd-muted">
                          {path.completedResources}/{path.totalResources} resources
                          {path.difficulty ? ` - ${humanize(path.difficulty)}` : ''}
                        </span>
                        <div className="sd-continue-bar" aria-hidden="true">
                          <div className="sd-continue-fill" style={{ width: `${Math.min(100, path.progressPercentage)}%` }} />
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => navigate(`/dashboard/resources/paths/${path.slug}`)}
                      >
                        Continue
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="sd-mid sd-mid-bottom">
              <article className="sd-panel">
                <div className="sd-panel-head">
                  <h3><FiMessageSquare size={16} /> Recent discussions</h3>
                  <button type="button" className="sd-text-link" onClick={() => navigate('/dashboard/discussions')}>
                    View all
                  </button>
                </div>
                {discussions.length === 0 ? (
                  <p className="sd-muted">No threads yet. Start one in Discussions.</p>
                ) : (
                  <ul className="sd-list">
                    {discussions.map((d) => (
                      <li key={d.id} className="sd-list-click" onClick={() => navigate(`/dashboard/discussions/${d.id}`)}>
                        {d.categoryName && (
                          <span
                            className="sd-chip"
                            style={d.categoryColor ? { background: `${d.categoryColor}22`, color: d.categoryColor } : undefined}
                          >
                            {d.categoryName}
                          </span>
                        )}
                        <strong>{d.title}</strong>
                        <span className="sd-muted">{d.repliesCount ?? 0} replies</span>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
