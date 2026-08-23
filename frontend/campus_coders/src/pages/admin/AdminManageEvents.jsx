import React, { useCallback, useEffect, useState } from 'react';
import Toast from '../../components/Toast';
import api from '../../api/client';

const TYPES = ['CONTEST', 'WORKSHOP', 'SESSION', 'HACKATHON', 'OTHER'];

const emptyForm = {
  title: '',
  description: '',
  type: 'CONTEST',
  platform: '',
  startsAt: '',
  endsAt: '',
  actionLabel: 'Open',
  actionUrl: '',
};

function toLocalInput(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toIso(local) {
  if (!local) return null;
  const d = new Date(local);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export default function AdminManageEvents() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });

  const showToast = useCallback((type, message) => setToast({ show: true, type, message }), []);
  const hideToast = useCallback(() => setToast((prev) => ({ ...prev, show: false })), []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/events');
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Could not load events.');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const payload = () => ({
    title: form.title,
    description: form.description || '',
    type: form.type,
    platform: form.platform || '',
    startsAt: toIso(form.startsAt),
    endsAt: toIso(form.endsAt),
    actionLabel: form.actionLabel || '',
    actionUrl: form.actionUrl || '',
  });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.startsAt) {
      showToast('error', 'Start time is required.');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/admin/events/${editingId}`, payload());
        showToast('success', 'Event updated.');
      } else {
        await api.post('/admin/events', payload());
        showToast('success', 'Event created.');
      }
      setForm(emptyForm);
      setEditingId(null);
      await load();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Could not save event.');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setForm({
      title: item.title || '',
      description: item.description || '',
      type: item.type || 'CONTEST',
      platform: item.platform || '',
      startsAt: toLocalInput(item.startsAt),
      endsAt: toLocalInput(item.endsAt),
      actionLabel: item.actionLabel || 'Open',
      actionUrl: item.actionUrl || '',
    });
  };

  const toggleActive = async (item) => {
    try {
      await api.patch(`/admin/events/${item.id}/${item.active ? 'deactivate' : 'activate'}`);
      await load();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Could not update status.');
    }
  };

  return (
    <div>
      <Toast type={toast.type} message={toast.message} show={toast.show} onClose={hideToast} />
      <div className="ap-header">
        <div>
          <h1 className="ap-page-title">Contests & events</h1>
          <p className="ap-page-sub">
            LeetCode contests, campus workshops, and sessions students see on the dashboard. Links go out to the platform - nothing is scraped.
          </p>
        </div>
      </div>

      <form className="ap-card-solid" onSubmit={submit} style={{ marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 14px' }}>{editingId ? 'Edit event' : 'New event'}</h3>
        <label className="form-label">Title</label>
        <input className="form-input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <div className="ap-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
          <div>
            <label className="form-label">Type</label>
            <select className="form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Platform</label>
            <input className="form-input" placeholder="LeetCode, CodeChef, Campus..." value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} />
          </div>
        </div>
        <div className="ap-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
          <div>
            <label className="form-label">Starts</label>
            <input className="form-input" type="datetime-local" required value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} />
          </div>
          <div>
            <label className="form-label">Ends (optional)</label>
            <input className="form-input" type="datetime-local" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} />
          </div>
        </div>
        <label className="form-label" style={{ marginTop: 12 }}>Link URL (optional)</label>
        <input className="form-input" placeholder="https://leetcode.com/contest/..." value={form.actionUrl} onChange={(e) => setForm({ ...form, actionUrl: e.target.value })} />
        <label className="form-label" style={{ marginTop: 12 }}>Link label</label>
        <input className="form-input" value={form.actionLabel} onChange={(e) => setForm({ ...form, actionLabel: e.target.value })} />
        <label className="form-label" style={{ marginTop: 12 }}>Description</label>
        <textarea className="form-input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : (editingId ? 'Update' : 'Create')}</button>
          {editingId && (
            <button type="button" className="btn btn-secondary" onClick={() => { setEditingId(null); setForm(emptyForm); }}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="ap-card-solid">
        {loading ? (
          <p className="ap-page-sub">Loading...</p>
        ) : items.length === 0 ? (
          <p className="ap-page-sub">No events yet. Create a contest or session above.</p>
        ) : (
          <div className="ap-table-wrap">
            <table className="ap-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Platform</th>
                  <th>Starts</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 700 }}>{item.title}</td>
                    <td>{item.type}</td>
                    <td>{item.platform || '-'}</td>
                    <td>{item.startsAt ? new Date(item.startsAt).toLocaleString() : '-'}</td>
                    <td>{item.active ? 'Active' : 'Inactive'}</td>
                    <td>
                      <button type="button" className="sd-text-link" onClick={() => startEdit(item)}>Edit</button>
                      {' - '}
                      <button type="button" className="sd-text-link" onClick={() => toggleActive(item)}>
                        {item.active ? 'Hide' : 'Show'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
