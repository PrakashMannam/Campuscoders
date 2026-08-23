import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBriefcase, FiCalendar, FiChevronRight, FiExternalLink, FiUser } from 'react-icons/fi';
import DashboardLayout from '../components/DashboardLayout';
import EmptyState from '../components/EmptyState';
import Toast from '../components/Toast';
import api from '../api/client';
import { difficultyClass, humanize } from '../utils/label';

export const PLACEMENT_CATEGORY = 'Placement';

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

export default function Placement() {
  const navigate = useNavigate();
  const [paths, setPaths] = useState([]);
  const [events, setEvents] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pathRes, eventRes, profileRes] = await Promise.all([
        api.get(`/learning-paths?category=${encodeURIComponent(PLACEMENT_CATEGORY)}&page=0&size=50`),
        api.get('/events/upcoming?limit=6').catch(() => ({ data: [] })),
        api.get('/profile/me').catch(() => ({ data: null })),
      ]);
      setPaths(pathRes.data?.content || []);
      setEvents(Array.isArray(eventRes.data) ? eventRes.data : []);
      setProfile(profileRes.data || null);
    } catch (err) {
      setPaths([]);
      setToast({ show: true, type: 'error', message: err.response?.data?.message || 'Could not load placement.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const missingLinks = !profile?.leetcodeUrl || !profile?.githubUrl || !profile?.linkedinUrl;

  return (
    <DashboardLayout>
      <div className="jp-page">
        <Toast type={toast.type} message={toast.message} show={toast.show} onClose={() => setToast((t) => ({ ...t, show: false }))} />

        <section className="jp-callout">
          <FiBriefcase size={20} />
          <div>
            <strong>Interview tracks, contests, and your public links</strong>
            <p>Use this page to prep - not to rank. University is optional.</p>
          </div>
        </section>

        {loading ? (
          <div className="jp-skel-stack" aria-busy="true">
            <div className="skeleton jp-skel-row" />
            <div className="skeleton jp-skel-row" />
          </div>
        ) : (
          <>
            <section className="jp-grid-2" style={{ marginBottom: 20 }}>
              <article className="jp-panel">
                <div className="jp-panel-head">
                  <h3><FiUser size={16} /> Your showcase</h3>
                </div>
                <p className="sd-muted" style={{ marginTop: 0 }}>
                  {missingLinks
                    ? 'Add LeetCode, GitHub, and LinkedIn so people can find your work.'
                    : 'Your coding links are on your profile. Keep them current.'}
                </p>
                <button type="button" className="btn btn-dark" onClick={() => navigate('/dashboard/profile')}>
                  Open profile
                </button>
              </article>

              <article className="jp-panel">
                <div className="jp-panel-head">
                  <h3><FiCalendar size={16} /> Contests & sessions</h3>
                </div>
                {events.length === 0 ? (
                  <p className="sd-muted">When a contest or workshop is published, it shows up here.</p>
                ) : (
                  <ul className="jp-list">
                    {events.slice(0, 4).map((ev) => (
                      <li key={ev.id}>
                        <div className="jp-list-item-copy">
                          <strong>{ev.title}</strong>
                          <span className="sd-muted">{formatEventWhen(ev.startsAt)}{ev.platform ? ` - ${ev.platform}` : ''}</span>
                        </div>
                        {ev.actionUrl && (
                          <a href={ev.actionUrl} target="_blank" rel="noopener noreferrer" className="sd-text-link">
                            Open <FiExternalLink size={12} />
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            </section>

            <h3 className="jp-section-title">Interview tracks</h3>
            {paths.length === 0 ? (
              <EmptyState
                title="No interview tracks yet"
                description="Admins can publish learning paths with category Placement."
                action={(
                  <button type="button" className="btn btn-primary" onClick={() => navigate('/dashboard/resources')}>
                    Browse Learning
                  </button>
                )}
              />
            ) : (
              <div className="jp-path-grid">
                {paths.map((path) => (
                  <button
                    key={path.id}
                    type="button"
                    className="jp-path-card"
                    onClick={() => navigate(`/dashboard/resources/paths/${path.slug}`)}
                  >
                    <div className="jp-path-card-top">
                      {path.category && <span className="sd-chip">{path.category}</span>}
                      {path.difficulty && (
                        <span className={`res-diff ${difficultyClass(path.difficulty)}`}>{humanize(path.difficulty)}</span>
                      )}
                    </div>
                    <h3>{path.title}</h3>
                    <p>{path.shortDescription || path.description || 'Open this track.'}</p>
                    <span className="jp-path-cta">
                      Open track <FiChevronRight size={16} />
                    </span>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
