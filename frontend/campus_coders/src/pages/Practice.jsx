import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FiExternalLink, FiCode, FiTarget } from 'react-icons/fi';
import DashboardLayout from '../components/DashboardLayout';
import BrandMark from '../components/BrandMark';
import EmptyState from '../components/EmptyState';
import Toast from '../components/Toast';
import api from '../api/client';
import { humanize } from '../utils/label';

const PRACTICE_PLATFORMS = [
  { name: 'LeetCode', href: 'https://leetcode.com/problemset/', hint: 'Interview-style problems' },
  { name: 'GeeksforGeeks', href: 'https://www.geeksforgeeks.org/explore', hint: 'Articles + practice' },
  { name: 'HackerRank', href: 'https://www.hackerrank.com/dashboard', hint: 'Skills and contests' },
  { name: 'CodeChef', href: 'https://www.codechef.com/practice', hint: 'Weekly contests' },
];

function formatWhen(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function Practice() {
  const [today, setToday] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });
  const showToast = useCallback((type, message) => setToast({ show: true, type, message }), []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [todayRes, histRes] = await Promise.all([
        api.get('/daily-challenge/today').catch(() => ({ data: null })),
        api.get('/daily-challenge/history').catch(() => ({ data: [] })),
      ]);
      setToday(todayRes.data || null);
      setHistory(Array.isArray(histRes.data) ? histRes.data : []);
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Could not load practice.');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const problem = today?.codingProblem || null;
  const past = useMemo(
    () => history.filter((h) => h.id !== today?.id).slice(0, 12),
    [history, today]
  );

  return (
    <DashboardLayout>
      <div className="jp-page">
        <Toast type={toast.type} message={toast.message} show={toast.show} onClose={() => setToast((t) => ({ ...t, show: false }))} />

        {loading ? (
          <div className="jp-skel-stack" aria-busy="true">
            <div className="skeleton jp-skel-hero" />
            <div className="skeleton jp-skel-row" />
          </div>
        ) : (
          <>
            <section className="jp-hero-card">
              <div className="jp-hero-top">
                <span className="sd-potd-badge">Problem of the day</span>
                {problem?.platform && (
                  <span className="sd-chip jp-platform-chip">
                    <BrandMark name={problem.platform} size={13} />
                    {problem.platform}
                  </span>
                )}
              </div>
              {problem ? (
                <>
                  <h3>{problem.title}</h3>
                  <p className="jp-meta">
                    {humanize(problem.difficulty)}
                    {today?.challengeDate ? ` - ${formatWhen(today.challengeDate)}` : ''}
                  </p>
                  {problem.tags && (
                    <div className="sd-potd-tags">
                      {problem.tags.split(',').map((t) => t.trim()).filter(Boolean).map((tag) => (
                        <span key={tag} className="sd-potd-tag">{tag}</span>
                      ))}
                    </div>
                  )}
                  {problem.problemUrl && (
                    <a href={problem.problemUrl} target="_blank" rel="noopener noreferrer" className="btn btn-dark">
                      Open problem <FiExternalLink size={14} />
                    </a>
                  )}
                </>
              ) : (
                <EmptyState
                  title="No challenge today"
                  description="A problem will appear here once an admin schedules one."
                />
              )}
            </section>

            <section className="jp-grid-2">
              <article className="jp-panel">
                <div className="jp-panel-head">
                  <h3><FiCode size={16} /> Recent challenges</h3>
                </div>
                {past.length === 0 ? (
                  <p className="sd-muted">Past problems will list here after more days are scheduled.</p>
                ) : (
                  <ul className="jp-list">
                    {past.map((item) => {
                      const p = item.codingProblem;
                      return (
                        <li key={item.id}>
                          <div className="jp-list-item-copy">
                            <strong>{p?.title || 'Challenge'}</strong>
                            <span className="sd-muted">
                              {formatWhen(item.challengeDate)}
                              {p?.difficulty ? ` - ${humanize(p.difficulty)}` : ''}
                            </span>
                          </div>
                          {p?.problemUrl && (
                            <a href={p.problemUrl} target="_blank" rel="noopener noreferrer" className="sd-text-link">
                              Open <FiExternalLink size={12} />
                            </a>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </article>

              <article className="jp-panel">
                <div className="jp-panel-head">
                  <h3><FiTarget size={16} /> Where to practice</h3>
                </div>
                <ul className="jp-platform-list">
                  {PRACTICE_PLATFORMS.map((site) => (
                    <li key={site.name}>
                      <a href={site.href} target="_blank" rel="noopener noreferrer" className="jp-platform-row">
                        <span className="jp-platform-icon">
                          <BrandMark name={site.name} size={18} />
                        </span>
                        <span className="jp-list-item-copy">
                          <strong>{site.name}</strong>
                          <span className="sd-muted">{site.hint}</span>
                        </span>
                        <FiExternalLink size={14} className="jp-platform-go" />
                      </a>
                    </li>
                  ))}
                </ul>
              </article>
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
