import React, { useCallback, useEffect, useState } from 'react';
import Toast from '../../components/Toast';
import api from '../../api/client';

const DIFFICULTIES = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const emptyForm = {
  title: '',
  slug: '',
  category: '',
  shortDescription: '',
  description: '',
  difficulty: 'BEGINNER',
  estimatedHours: 0,
  iconName: '',
  active: true,
};

export default function AdminManageLearningPaths() {
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
      const res = await api.get('/admin/learning-paths');
      setPaths(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Could not load paths.');
      setPaths([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const payload = () => ({
    title: form.title.trim(),
    slug: (form.slug.trim() || slugify(form.title)),
    description: form.description || '',
    shortDescription: form.shortDescription || '',
    iconName: form.iconName || '',
    category: form.category || '',
    difficulty: form.difficulty,
    estimatedHours: Number(form.estimatedHours) || 0,
  });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/admin/learning-paths/${editingId}`, { ...payload(), active: form.active });
        showToast('success', 'Path updated.');
      } else {
        await api.post('/admin/learning-paths', payload());
        showToast('success', 'Path created.');
      }
      setForm(emptyForm);
      setEditingId(null);
      await load();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Could not save path.');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setForm({
      title: p.title || '',
      slug: p.slug || '',
      category: p.category || '',
      shortDescription: p.shortDescription || '',
      description: p.description || '',
      difficulty: p.difficulty || 'BEGINNER',
      estimatedHours: p.estimatedHours ?? 0,
      iconName: p.iconName || '',
      active: p.active !== false,
    });
  };

  const toggleActive = async (p) => {
    try {
      await api.patch(`/admin/learning-paths/${p.id}/${p.active ? 'deactivate' : 'activate'}`);
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
          <h1 className="ap-page-title">Learning paths</h1>
          <p className="ap-page-sub">Catalog students see in Learning. Add topics and resources after you create a path.</p>
        </div>
      </div>

      <form className="ap-card-solid" onSubmit={submit} style={{ marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 14px' }}>{editingId ? 'Edit path' : 'New path'}</h3>
        <label className="form-label">Title</label>
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
        <p className="ap-page-sub" style={{ margin: '4px 0 0' }}>Students open this inside Campus Coders as /learning/{'{slug}'}. External links belong on resources only.</p>
        <div className="ap-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
          <div>
            <label className="form-label">Category</label>
            <input className="form-input" placeholder="DSA, Web, Java..." value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </div>
          <div>
            <label className="form-label">Difficulty</label>
            <select className="form-select" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
              {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
        <label className="form-label" style={{ marginTop: 12 }}>Estimated hours</label>
        <input className="form-input" type="number" min="0" value={form.estimatedHours} onChange={(e) => setForm({ ...form, estimatedHours: e.target.value })} />
        <label className="form-label" style={{ marginTop: 12 }}>Short description</label>
        <input className="form-input" value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} />
        <label className="form-label" style={{ marginTop: 12 }}>Description</label>
        <textarea className="form-input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : (editingId ? 'Update' : 'Create')}</button>
          {editingId && <button type="button" className="btn btn-secondary" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancel</button>}
        </div>
      </form>

      <div className="ap-card-solid">
        {loading ? <p className="ap-page-sub">Loading...</p> : paths.length === 0 ? (
          <p className="ap-page-sub">No paths yet. Create one so the student Learning hub has a catalog.</p>
        ) : (
          <table className="ap-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Difficulty</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {paths.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 700 }}>{p.title}</td>
                  <td>{p.category || '-'}</td>
                  <td>{p.difficulty}</td>
                  <td>{p.active ? 'Live' : 'Hidden'}</td>
                  <td>
                    <button type="button" className="sd-text-link" onClick={() => startEdit(p)}>Edit</button>
                    {' - '}
                    <button type="button" className="sd-text-link" onClick={() => toggleActive(p)}>{p.active ? 'Hide' : 'Show'}</button>
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
