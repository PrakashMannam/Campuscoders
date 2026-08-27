import React, { useCallback, useEffect, useState } from 'react';
import Toast from '../../components/Toast';
import api from '../../api/client';

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const emptyForm = {
  learningPathId: '',
  title: '',
  slug: '',
  description: '',
  estimatedMinutes: 0,
  sortOrder: 0,
  active: true,
};

export default function AdminManageTopics() {
  const [topics, setTopics] = useState([]);
  const [paths, setPaths] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });

  const showToast = useCallback((type, message) => setToast({ show: true, type, message }), []);
  const hideToast = useCallback(() => setToast((p) => ({ ...p, show: false })), []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [topicRes, pathRes] = await Promise.all([
        api.get('/admin/topics'),
        api.get('/admin/learning-paths/options'),
      ]);
      const pathList = Array.isArray(pathRes.data) ? pathRes.data : [];
      setTopics(Array.isArray(topicRes.data) ? topicRes.data : []);
      setPaths(pathList);
      setForm((f) => (f.learningPathId || !pathList[0] ? f : { ...f, learningPathId: String(pathList[0].id) }));
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Could not load topics.');
      setTopics([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.learningPathId) {
      showToast('error', 'Create a learning path first.');
      return;
    }
    const body = {
      learningPathId: Number(form.learningPathId),
      title: form.title.trim(),
      slug: form.slug.trim() || slugify(form.title),
      description: form.description || '',
      estimatedMinutes: Number(form.estimatedMinutes) || 0,
      sortOrder: Number(form.sortOrder) || 0,
    };
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/admin/topics/${editingId}`, { ...body, active: form.active });
        showToast('success', 'Topic updated.');
      } else {
        await api.post('/admin/topics', body);
        showToast('success', 'Topic created.');
      }
      setForm({ ...emptyForm, learningPathId: form.learningPathId });
      setEditingId(null);
      await load();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Could not save topic.');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (t) => {
    setEditingId(t.id);
    setForm({
      learningPathId: String(t.learningPathId),
      title: t.title || '',
      slug: t.slug || '',
      description: t.description || '',
      estimatedMinutes: t.estimatedMinutes ?? 0,
      sortOrder: t.sortOrder ?? 0,
      active: t.active !== false,
    });
  };

  const toggleActive = async (t) => {
    try {
      await api.patch(`/admin/topics/${t.id}/${t.active ? 'deactivate' : 'activate'}`);
      await load();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Could not update status.');
    }
  };

  const deleteTopic = async (t) => {
    const ok = window.confirm(
      `Are you sure you want to delete "${t.title}"?\n\nThis permanently removes the topic and its resources. This cannot be undone.`
    );
    if (!ok) return;
    try {
      await api.delete(`/admin/topics/${t.id}`);
      if (editingId === t.id) {
        setEditingId(null);
        setForm({ ...emptyForm, learningPathId: form.learningPathId });
      }
      showToast('success', 'Topic deleted.');
      await load();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Could not delete topic.');
    }
  };

  const pathTitle = (id) => paths.find((p) => Number(p.id) === Number(id))?.title || `#${id}`;

  return (
    <div>
      <Toast type={toast.type} message={toast.message} show={toast.show} onClose={hideToast} />
      <div className="ap-header">
        <div>
          <h1 className="ap-page-title">Topics</h1>
          <p className="ap-page-sub">Topics belong to a learning path. Attach resources after you create them.</p>
        </div>
      </div>

      {paths.length === 0 && !loading && (
        <p className="ap-page-sub">No learning paths yet. Create a path first.</p>
      )}

      <form className="ap-card-solid" onSubmit={submit} style={{ marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 14px' }}>{editingId ? 'Edit topic' : 'New topic'}</h3>
        <label className="form-label">Learning path</label>
        <select className="form-select" required value={form.learningPathId} onChange={(e) => setForm({ ...form, learningPathId: e.target.value })}>
          <option value="">Select path</option>
          {paths.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
        <label className="form-label" style={{ marginTop: 12 }}>Title</label>
        <input
          className="form-input"
          required
          value={form.title}
          onChange={(e) => setForm({
            ...form,
            title: e.target.value,
            slug: editingId ? form.slug : slugify(e.target.value),
          })}
        />
        <label className="form-label" style={{ marginTop: 12 }}>App path (auto from title - not a website URL)</label>
        <input className="form-input" required value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} />
        <p className="ap-page-sub" style={{ margin: '4px 0 0' }}>Used only for in-app navigation. Topics do not need YouTube/docs links - put those on resources.</p>
        <label className="form-label" style={{ marginTop: 12 }}>Estimated minutes</label>
        <input className="form-input" type="number" min="0" value={form.estimatedMinutes} onChange={(e) => setForm({ ...form, estimatedMinutes: e.target.value })} />
        <label className="form-label" style={{ marginTop: 12 }}>Sort order</label>
        <input className="form-input" type="number" min="0" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
        <label className="form-label" style={{ marginTop: 12 }}>Description</label>
        <textarea className="form-input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button type="submit" className="btn btn-primary" disabled={saving || paths.length === 0}>{saving ? 'Saving...' : (editingId ? 'Update' : 'Create')}</button>
          {editingId && <button type="button" className="btn btn-secondary" onClick={() => { setEditingId(null); setForm({ ...emptyForm, learningPathId: form.learningPathId }); }}>Cancel</button>}
        </div>
      </form>

      <div className="ap-card-solid">
        {loading ? <p className="ap-page-sub">Loading...</p> : topics.length === 0 ? (
          <p className="ap-page-sub">No topics yet.</p>
        ) : (
          <table className="ap-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Path</th>
                <th>Order</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {topics.map((t) => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 700 }}>{t.title}</td>
                  <td>{t.learningPathTitle || pathTitle(t.learningPathId)}</td>
                  <td>{t.sortOrder ?? '-'}</td>
                  <td>{t.active ? 'Live' : 'Hidden'}</td>
                  <td>
                    <button type="button" className="sd-text-link" onClick={() => startEdit(t)}>Edit</button>
                    {' · '}
                    <button type="button" className="sd-text-link" onClick={() => toggleActive(t)}>{t.active ? 'Hide' : 'Show'}</button>
                    {' · '}
                    <button type="button" className="sd-text-link ap-danger-link" onClick={() => deleteTopic(t)}>Delete</button>
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
