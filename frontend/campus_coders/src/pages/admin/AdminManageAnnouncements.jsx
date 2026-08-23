import React, { useCallback, useEffect, useState } from 'react';
import Toast from '../../components/Toast';
import api from '../../api/client';

const CATEGORIES = [
  { value: 'PLATFORM_UPDATE', label: 'Platform update' },
  { value: 'EVENT', label: 'Event' },
  { value: 'ACADEMIC_NEWS', label: 'Academic' },
  { value: 'SYSTEM_MAINTENANCE', label: 'Maintenance' },
  { value: 'CAREER_CENTER', label: 'Career' },
];

const emptyForm = {
  title: '',
  message: '',
  category: 'PLATFORM_UPDATE',
  actionLabel: '',
  actionUrl: '',
};

export default function AdminManageAnnouncements() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [editingActive, setEditingActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });

  const showToast = useCallback((type, message) => setToast({ show: true, type, message }), []);
  const hideToast = useCallback(() => setToast((p) => ({ ...p, show: false })), []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/announcements?page=0&size=50');
      setItems(res.data?.content || []);
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Could not load announcements.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const submit = async (e) => {
    e.preventDefault();
    const body = {
      title: form.title.trim(),
      message: form.message.trim(),
      category: form.category,
      actionLabel: form.actionLabel.trim() || null,
      actionUrl: form.actionUrl.trim() || null,
    };
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/admin/announcements/${editingId}`, { ...body, active: editingActive });
        showToast('success', 'Announcement updated.');
      } else {
        await api.post('/admin/announcements', body);
        showToast('success', 'Announcement published.');
      }
      setForm(emptyForm);
      setEditingId(null);
      await load();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Could not save.');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditingActive(item.active !== false);
    setForm({
      title: item.title || '',
      message: item.message || '',
      category: item.category || 'PLATFORM_UPDATE',
      actionLabel: item.actionLabel || '',
      actionUrl: item.actionUrl || '',
    });
  };

  const toggleActive = async (item) => {
    try {
      await api.patch(`/admin/announcements/${item.id}/${item.active ? 'deactivate' : 'activate'}`);
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
          <h1 className="ap-page-title">Announcements</h1>
          <p className="ap-page-sub">These posts appear on the student announcements page. No fake audiences or push queue.</p>
        </div>
      </div>

      <form className="ap-card-solid" onSubmit={submit} style={{ marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 14px' }}>{editingId ? 'Edit announcement' : 'New announcement'}</h3>
        <label className="form-label">Title</label>
        <input className="form-input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <label className="form-label" style={{ marginTop: 12 }}>Category</label>
        <select className="form-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
          {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <label className="form-label" style={{ marginTop: 12 }}>Message</label>
        <textarea className="form-input" rows={4} required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
        <label className="form-label" style={{ marginTop: 12 }}>Link label (optional)</label>
        <input className="form-input" value={form.actionLabel} onChange={(e) => setForm({ ...form, actionLabel: e.target.value })} />
        <label className="form-label" style={{ marginTop: 12 }}>Link URL (optional, https)</label>
        <input className="form-input" placeholder="https://" value={form.actionUrl} onChange={(e) => setForm({ ...form, actionUrl: e.target.value })} />
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : (editingId ? 'Update' : 'Publish')}</button>
          {editingId && (
            <button type="button" className="btn btn-secondary" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancel</button>
          )}
        </div>
      </form>

      <div className="ap-card-solid">
        {loading ? <p className="ap-page-sub">Loading...</p> : items.length === 0 ? (
          <p className="ap-page-sub">None yet. Publish one above and students will see it.</p>
        ) : (
          <table className="ap-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 700 }}>{item.title}</td>
                  <td>{item.category}</td>
                  <td>{item.active ? 'Active' : 'Hidden'}</td>
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
        )}
      </div>
    </div>
  );
}
