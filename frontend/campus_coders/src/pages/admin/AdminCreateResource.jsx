import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiUploadCloud, FiInfo, FiX } from 'react-icons/fi';
import Toast from '../../components/Toast';
import api from '../../api/client';
import { MOCK_PATHS, MOCK_TOPICS, MOCK_RESOURCES, loadStore, saveStore } from './adminMockData';

export default function AdminCreateResource() {
  const navigate = useNavigate();
  const location = useLocation();
  const editing = location.state?.editResource || null;

  const [learningPathId, setLearningPathId] = useState(editing?.learningPathId || '');
  const [topicId, setTopicId] = useState(editing?.topicId || '');
  const [title, setTitle] = useState(editing?.title || '');
  const [description, setDescription] = useState(editing?.description || '');
  const [type, setType] = useState(editing?.type || '');
  const [difficulty, setDifficulty] = useState(editing?.difficulty || 'BEGINNER');
  const [resourceLink, setResourceLink] = useState(editing?.resourceLink || '');
  const [isPremium, setIsPremium] = useState(!!editing?.isPremium);
  const [status, setStatus] = useState(editing?.active === false ? 'Inactive' : 'Active');
  const [tags, setTags] = useState(editing?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [descMode, setDescMode] = useState('write');
  const [fileName, setFileName] = useState('');

  const [learningPaths, setLearningPaths] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loadingPaths, setLoadingPaths] = useState(true);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });
  const showToast = useCallback((type, message) => setToast({ show: true, type, message }), []);
  const hideToast = useCallback(() => setToast(prev => ({ ...prev, show: false })), []);

  useEffect(() => {
    const fetchPaths = async () => {
      setLoadingPaths(true);
      try {
        const res = await api.get('/admin/learning-paths/options');
        setLearningPaths(res.data?.length ? res.data : MOCK_PATHS);
      } catch {
        setLearningPaths(MOCK_PATHS);
      } finally {
        setLoadingPaths(false);
      }
    };
    fetchPaths();
  }, []);

  useEffect(() => {
    if (!learningPathId) {
      setTopics([]);
      setTopicId('');
      return;
    }
    const fetchTopics = async () => {
      setLoadingTopics(true);
      try {
        const res = await api.get(`/admin/topics/options?learningPathId=${learningPathId}`);
        const data = res.data?.length ? res.data : MOCK_TOPICS.filter(t => String(t.pathId) === String(learningPathId));
        setTopics(data);
      } catch {
        setTopics(MOCK_TOPICS.filter(t => String(t.pathId) === String(learningPathId)));
      } finally {
        setLoadingTopics(false);
      }
    };
    fetchTopics();
  }, [learningPathId]);

  const addTag = (e) => {
    if (e.key !== 'Enter' && e.key !== ',') return;
    e.preventDefault();
    const value = tagInput.replace(',', '').trim().toLowerCase();
    if (value && !tags.includes(value)) setTags([...tags, value]);
    setTagInput('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!learningPathId || !topicId || !title || !type || !resourceLink) {
      showToast('error', 'Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    const pathName = learningPaths.find(p => String(p.id) === String(learningPathId))?.name || '';
    const topicName = topics.find(t => String(t.id) === String(topicId))?.name || '';
    const payload = {
      id: editing?.id || Date.now(),
      learningPathId: Number(learningPathId),
      topicId: Number(topicId),
      learningPathName: pathName,
      topicName,
      title,
      description,
      type,
      difficulty,
      resourceLink,
      tags,
      isPremium,
      active: status === 'Active',
      fileName,
    };

    try {
      if (editing) {
        await api.put(`/admin/resources/${editing.id}`, payload);
      } else {
        await api.post('/admin/resources', payload);
      }
    } catch { /* persist locally */ }

    const current = loadStore('resources', MOCK_RESOURCES);
    const next = editing
      ? current.map(r => r.id === editing.id ? { ...r, ...payload } : r)
      : [payload, ...current];
    saveStore('resources', next);
    showToast('success', editing ? 'Resource updated successfully!' : 'Resource created successfully!');
    setTimeout(() => navigate('/admin/resources'), 900);
    setSubmitting(false);
  };

  return (
    <div>
      <Toast type={toast.type} message={toast.message} show={toast.show} onClose={hideToast} />

      <div className="ap-header">
        <div>
          <h1 className="ap-page-title">{editing ? 'Edit Resource' : 'Create Resource'}</h1>
          <p className="ap-page-sub">{editing ? 'Update details and access rules' : 'Add a resource with topic, difficulty and tags'}</p>
        </div>
      </div>

      <div className="ap-grid-2 ap-grid-form">
        <form onSubmit={handleSubmit} className="ap-card-solid" style={{ padding: '32px' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>
              Learning Path <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select className="form-select" value={learningPathId} onChange={e => setLearningPathId(e.target.value)} required
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #d1d5db' }}>
              <option value="">Select Learning Path</option>
              {loadingPaths ? <option disabled>Loading...</option> : learningPaths.map(lp => (
                <option key={lp.id} value={lp.id}>{lp.name}</option>
              ))}
            </select>
          </div>

          {learningPathId && (
            <div style={{
              background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)', border: '1px solid #FDE68A', borderRadius: '10px',
              padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px'
            }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FDE68A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#92400E' }}>
                <FiInfo size={16} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#92400E' }}>Topics are scoped to the selected learning path</div>
                <div style={{ fontSize: '0.78rem', color: '#A16207' }}>Changing the path refreshes available topics and curriculum tags.</div>
              </div>
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>
              Topic <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select className="form-select" value={topicId} onChange={e => setTopicId(e.target.value)} required disabled={!learningPathId}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: learningPathId ? '2px solid #d97706' : '1px solid #d1d5db', background: !learningPathId ? '#f3f4f6' : '#fff' }}>
              <option value="">Select Topic</option>
              {loadingTopics ? <option disabled>Loading topics...</option> : topics.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }} className="ap-grid-2">
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>Type *</label>
              <select className="form-select" value={type} onChange={e => setType(e.target.value)} required style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #d1d5db' }}>
                <option value="">Select type</option>
                <option value="VIDEO">Video</option>
                <option value="ARTICLE">Article</option>
                <option value="PDF">PDF</option>
                <option value="DOCUMENTATION">Documentation</option>
                <option value="COURSE">Course</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>Difficulty *</label>
              <select className="form-select" value={difficulty} onChange={e => setDifficulty(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #d1d5db' }}>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>Title *</label>
            <input type="text" className="form-input" placeholder="Enter resource title" value={title} onChange={e => setTitle(e.target.value)} required
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #d1d5db' }} />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827' }}>Description (Markdown) *</label>
              <div className="ap-tabs" style={{ margin: 0 }}>
                <button type="button" className={`ap-tab ${descMode === 'write' ? 'active' : ''}`} onClick={() => setDescMode('write')}>Write</button>
                <button type="button" className={`ap-tab ${descMode === 'preview' ? 'active' : ''}`} onClick={() => setDescMode('preview')}>Preview</button>
              </div>
            </div>
            {descMode === 'write' ? (
              <textarea className="form-input" rows={6} placeholder={'Supports **bold**, `code`, and lists.\nExplain what the student will learn…'} value={description} onChange={e => setDescription(e.target.value)} required
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #d1d5db', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }} />
            ) : (
              <div className="ap-md-preview">{description || 'Nothing to preview yet.'}</div>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>Tags</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
              {tags.map(tag => (
                <span key={tag} className="ap-chip">
                  {tag}
                  <button type="button" onClick={() => setTags(tags.filter(t => t !== tag))} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#92400e', padding: 0 }}><FiX size={12} /></button>
                </span>
              ))}
            </div>
            <input className="form-input" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={addTag}
              placeholder="Type a tag and press Enter" style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #d1d5db' }} />
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>Resource Link *</label>
            <input type="url" className="form-input" placeholder="https://" value={resourceLink} onChange={e => setResourceLink(e.target.value)} required
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #d1d5db' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
            <button type="button" onClick={() => navigate('/admin/resources')} className="ap-ghost-btn" style={{ padding: '10px 24px' }}>Cancel</button>
            <button type="submit" disabled={submitting} className="btn btn-primary" style={{ padding: '10px 24px', fontWeight: 700 }}>
              {submitting ? 'Saving…' : editing ? 'Save Changes' : 'Create Resource'}
            </button>
          </div>
        </form>

        <div className="ap-card-solid" style={{ position: 'sticky', top: '100px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Asset details <FiInfo size={16} color="#d97706" />
          </h3>

          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginBottom: '8px' }}>File upload (mocked)</label>
          <label className="ap-drop-zone">
            <input type="file" hidden onChange={e => setFileName(e.target.files?.[0]?.name || '')} />
            <FiUploadCloud size={28} color="#94a3b8" />
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '8px 0 0' }}>{fileName || 'Drop a PDF, video or slide deck'}</p>
            <p style={{ fontSize: '0.72rem', color: '#cbd5e1', margin: '4px 0 0' }}>PNG, JPG, PDF, MP4 up to 50MB — stored locally for now</p>
          </label>

          {resourceLink && (
            <div style={{ margin: '20px 0' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginBottom: '6px' }}>Live link</label>
              <a href={resourceLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.82rem', color: '#d97706', wordBreak: 'break-all' }}>{resourceLink}</a>
            </div>
          )}

          <div style={{ margin: '20px 0' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginBottom: '8px' }}>Premium only</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label className="ap-toggle">
                <input type="checkbox" checked={isPremium} onChange={e => setIsPremium(e.target.checked)} />
                <i />
              </label>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Restrict to premium campus members</span>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginBottom: '6px' }}>Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)}
              style={{
                width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontWeight: 600,
                color: status === 'Active' ? '#059669' : '#DC2626',
                background: status === 'Active' ? '#ECFDF5' : '#FEF2F2'
              }}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
