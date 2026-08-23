import React, { useCallback, useEffect, useState } from 'react';
import { FiCalendar, FiExternalLink } from 'react-icons/fi';
import DashboardLayout from '../components/DashboardLayout';
import EmptyState from '../components/EmptyState';
import Toast from '../components/Toast';
import api from '../api/client';
import { humanize } from '../utils/label';

function formatEventWhen(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString(undefined, {
    weekday: 'short',
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
  if (end && end < now) return 'Ended';
  return 'Upcoming';
}

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/events/upcoming?limit=40');
      setEvents(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setEvents([]);
      setToast({ show: true, type: 'error', message: err.response?.data?.message || 'Could not load events.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <DashboardLayout>
      <div className="jp-page">
        <Toast type={toast.type} message={toast.message} show={toast.show} onClose={() => setToast((t) => ({ ...t, show: false }))} />

        <header className="jp-header">
          <div>
            <p className="jp-sub">Contests, workshops, and sessions.</p>
          </div>
        </header>

        {loading ? (
          <div className="jp-skel-stack" aria-busy="true">
            <div className="skeleton jp-skel-row" />
            <div className="skeleton jp-skel-row" />
          </div>
        ) : events.length === 0 ? (
          <EmptyState
            title="No events scheduled"
            description="When admins publish contests or sessions, they will show up here."
          />
        ) : (
          <ul className="jp-event-grid">
            {events.map((ev) => {
              const status = eventStatus(ev);
              return (
                <li key={ev.id} className="jp-event-card">
                  <div className="jp-event-badges">
                    <span className="sd-chip">{humanize(ev.type)}</span>
                    <span className={`sd-chip ${status === 'Live' ? 'sd-chip-live' : ''}`}>{status}</span>
                  </div>
                  <h3>{ev.title}</h3>
                  {ev.description && <p className="jp-event-desc">{ev.description}</p>}
                  <p className="sd-muted">
                    <FiCalendar size={14} style={{ verticalAlign: '-2px', marginRight: 6 }} />
                    {ev.platform ? `${ev.platform} - ` : ''}{formatEventWhen(ev.startsAt)}
                  </p>
                  {ev.actionUrl && (
                    <a href={ev.actionUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary jp-event-cta">
                      {ev.actionLabel || 'Open'} <FiExternalLink size={14} />
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </DashboardLayout>
  );
}
