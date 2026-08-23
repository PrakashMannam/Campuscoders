import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Toast from '../../components/Toast';
import api from '../../api/client';

const TYPES = ['VIDEO', 'ARTICLE', 'DOCUMENTATION', 'PDF', 'INTERACTIVE', 'PRACTICE'];
const DIFFICULTIES = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

export default function AdminCreateResource() {
  const navigate = useNavigate();
  const editing = useLocation().state?.editResource || null;

  const [learningPaths, setLearningPaths] = useState([]);
  const [topics, setTopics] = useState([]);
  const [learningPathId, setLearningPathId] = useState(editing?.learningPathId ? String(editing.learningPathId) : '');
  const [topicId, setTopicId] = useState(editing?.topicId ? String(editing.topicId) : '');
  const [title, setTitle] = useState(editing?.title || '');
  const [description, setDescription] = useState(editing?.description || '');
  const [type, setType] = useState(editing?.type || 'ARTICLE');
  const [difficulty, setDifficulty] = useState(editing?.difficulty || 'BEGINNER');
  const [url, setUrl] = useState(editing?.url || '');
  const [provider, setProvider] = useState(editing?.provider || '');
  const [estimatedMinutes, setEstimatedMinutes] = useState(editing?.estimatedMinutes ?? 0);
  const [sortOrder, setSortOrder] = useState(editing?.sortOrder ?? 0);
  const [active, setActive] = useState(editing?.active !== false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });

  const showToast = useCallback((type, message) => setToast({ show: true, type, message }), []);
  const hideToast = useCallback(() => setToast((p) => ({ ...p, show: false })), []);

  useEffect(() => {
    api.get('/admin/learning-paths/options')
      .then((res) => setLearningPaths(Array.isArray(res.data) ? res.data : []))
      .catch(() => setLearningPaths([]));
  }, []);

  useEffect(() => {
    if (!learningPathId) {
      setTopics([]);
      return;
    }
    api.get(`/admin/topics/options?learningPathId=${learningPathId}`)
      .then((res) => setTopics(Array.isArray(res.data) ? res.data : []))
      .catch(() => setTopics([]));
  }, [learningPathId]);

  const submit = async (e) => {
    e.preventDefault();
    if (!topicId || !title.trim() || !url.trim()) {
      showToast('error', 'Topic, title, and https URL are required.');
      return;
    }
    const body = {
      topicId: Number(topicId),
      title: title.trim(),
      description: description || '',
      type,
      difficulty,
      url: url.trim(),
      provider: provider || '',
      thumbnailUrl: '',
      estimatedMinutes: Number(estimatedMinutes) || 0,
      sortOrder: Number(sortOrder) || 0,
    };
    setSubmitting(true);
    try {
      if (editing?.id) {
        await api.put(`/admin/resources/${editing.id}`, { ...body, active });
        showToast('success', 'Resource updated.');
      } else {
        await api.post('/admin/resources', body);
        showToast('success', 'Resource created.');
      }
      navigate('/admin/resources');
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Could not save resource.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Toast type={toast.type} message={toast.message} show={toast.show} onClose={hideToast} />
      <div className="ap-header">
        <h1 className="ap-page-title">{editing ? 'Edit resource' : 'New resource'}</h1>
        <p className="ap-page-sub">
          This is the only place you paste an external link (YouTube, docs, GFG, etc.). Paths and topics only need an in-app name/slug.
        </p>
      </div>

      <form className="ap-card-solid" onSubmit={submit} style={{ maxWidth: 640 }}>
        <label className="form-label">Learning path</label>
        <select className="form-select" value={learningPathId} onChange={(e) => { setLearningPathId(e.target.value); setTopicId(''); }} required>
          <option value="">Select path</option>
          {learningPaths.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
        <label className="form-label" style={{ marginTop: 12 }}>Topic</label>
        <select className="form-select" value={topicId} onChange={(e) => setTopicId(e.target.value)} required disabled={!learningPathId}>
          <option value="">Select topic</option>
          {topics.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
        </select>
        <label className="form-label" style={{ marginTop: 12 }}>Title</label>
        <input className="form-input" required value={title} onChange={(e) => setTitle(e.target.value)} />
        <div className="ap-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
          <div>
            <label className="form-label">Type</label>
            <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Difficulty</label>
            <select className="form-select" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
        <label className="form-label" style={{ marginTop: 12 }}>External content URL (required)</label>
        <input className="form-input" type="url" required placeholder="https://youtube.com/... or https://docs..." value={url} onChange={(e) => setUrl(e.target.value)} />
        <p className="ap-page-sub" style={{ margin: '4px 0 0' }}>When a student clicks Open, this link opens in a new tab.</p>
        <label className="form-label" style={{ marginTop: 12 }}>Provider (optional)</label>
        <input className="form-input" value={provider} onChange={(e) => setProvider(e.target.value)} />
        <label className="form-label" style={{ marginTop: 12 }}>Estimated minutes</label>
        <input className="form-input" type="number" min="0" value={estimatedMinutes} onChange={(e) => setEstimatedMinutes(e.target.value)} />
        <label className="form-label" style={{ marginTop: 12 }}>Sort order</label>
        <input className="form-input" type="number" min="0" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
        <label className="form-label" style={{ marginTop: 12 }}>Description</label>
        <textarea className="form-input" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
        {editing && (
          <label className="form-label" style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> Active
          </label>
        )}
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/resources')}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
