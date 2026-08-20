import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUploadCloud, FiInfo } from 'react-icons/fi';
import Toast from '../../components/Toast';
import api from '../../api/client';

export default function AdminCreateResource() {
  const navigate = useNavigate();

  // Form state
  const [learningPathId, setLearningPathId] = useState('');
  const [topicId, setTopicId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('');
  const [resourceLink, setResourceLink] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [status, setStatus] = useState('Active');

  // Dropdown data
  const [learningPaths, setLearningPaths] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loadingPaths, setLoadingPaths] = useState(true);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /* ── Toast ── */
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });
  const showToast = useCallback((type, message) => {
    setToast({ show: true, type, message });
  }, []);
  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, show: false }));
  }, []);

  // Fetch Learning Paths
  useEffect(() => {
    const fetchPaths = async () => {
      setLoadingPaths(true);
      try {
        const res = await api.get('/admin/learning-paths/options');
        setLearningPaths(res.data || []);
      } catch (err) {
        setLearningPaths([
          { id: 1, name: 'Java Full Stack' },
          { id: 2, name: 'Python Full Stack' },
          { id: 3, name: 'DSA Intensive' },
          { id: 4, name: 'Spring Boot' },
        ]);
      } finally {
        setLoadingPaths(false);
      }
    };
    fetchPaths();
  }, []);

  // Fetch Topics (dependent on Learning Path)
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
        setTopics(res.data || []);
      } catch (err) {
        setTopics([
          { id: 10, name: 'Python Basics' },
          { id: 11, name: 'Python OOP' },
          { id: 12, name: 'Django Basics' },
          { id: 13, name: 'REST APIs with Django' },
        ]);
      } finally {
        setLoadingTopics(false);
      }
    };
    fetchTopics();
  }, [learningPathId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!learningPathId || !topicId || !title || !type || !resourceLink) {
      showToast('error', 'Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/admin/resources', {
        learningPathId: Number(learningPathId),
        topicId: Number(topicId),
        title,
        description,
        type,
        resourceLink,
        isPremium,
        active: status === 'Active',
      });
      showToast('success', 'Resource created successfully!');
      setTimeout(() => navigate('/admin/resources'), 1200);
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to create resource.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedPathName = learningPaths.find(p => String(p.id) === String(learningPathId))?.name || '';

  return (
    <div>
      <Toast type={toast.type} message={toast.message} show={toast.show} onClose={hideToast} />

      {/* Breadcrumb */}
      <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '8px' }}>
        <span style={{ cursor: 'pointer', color: '#d97706' }} onClick={() => navigate('/admin/resources')}>Resources</span>
        <span style={{ margin: '0 6px' }}>›</span>
        <span>Create Resource</span>
      </div>

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#111827', margin: '0 0 6px' }}>Create Resource</h1>
        <p style={{ color: '#6B7280', margin: 0, fontSize: '0.9rem' }}>Add a new resource to the platform</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '28px', alignItems: 'start' }}>
        {/* Left: Form */}
        <form onSubmit={handleSubmit} style={{
          background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px',
          padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}>
          {/* Learning Path */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>
              Learning Path <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select className="form-select" value={learningPathId} onChange={e => setLearningPathId(e.target.value)} required
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '0.9rem' }}>
              <option value="">Select Learning Path</option>
              {loadingPaths ? (
                <option disabled>Loading...</option>
              ) : learningPaths.map(lp => (
                <option key={lp.id} value={lp.id}>{lp.name}</option>
              ))}
            </select>
          </div>

          {/* Topic Filter Info */}
          {learningPathId && (
            <div style={{
              background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '10px',
              padding: '12px 16px', marginBottom: '20px',
              display: 'flex', alignItems: 'center', gap: '10px'
            }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px', background: '#FDE68A',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                color: '#92400E'
              }}>
                <FiInfo size={16} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#92400E' }}>Topic list is filtered based on the selected Learning Path</div>
                <div style={{ fontSize: '0.78rem', color: '#A16207' }}>Selecting a different learning path will update the available topics.</div>
              </div>
            </div>
          )}

          {/* Topic */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>
              Topic <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select className="form-select" value={topicId} onChange={e => setTopicId(e.target.value)} required
              disabled={!learningPathId}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: '10px',
                border: learningPathId ? '2px solid #d97706' : '1px solid #d1d5db',
                fontSize: '0.9rem', background: !learningPathId ? '#f3f4f6' : '#fff'
              }}>
              <option value="">Select Topic</option>
              {loadingTopics ? (
                <option disabled>Loading topics...</option>
              ) : topics.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>
              Title <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input type="text" className="form-input" placeholder="Enter resource title" value={title} onChange={e => setTitle(e.target.value)} required
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '0.9rem' }} />
          </div>

          {/* Type */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>
              Type <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select className="form-select" value={type} onChange={e => setType(e.target.value)} required
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '0.9rem' }}>
              <option value="">Select type</option>
              <option value="VIDEO">Video</option>
              <option value="ARTICLE">Article</option>
              <option value="PDF">PDF</option>
              <option value="DOCUMENTATION">Documentation</option>
              <option value="COURSE">Course</option>
            </select>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>
              Description <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea className="form-input" rows={4} placeholder="Enter resource description" value={description} onChange={e => setDescription(e.target.value)} required
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '0.9rem', resize: 'vertical' }} />
          </div>

          {/* Resource Link */}
          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>
              Resource Link <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input type="url" className="form-input" placeholder="Enter resource link (URL)" value={resourceLink} onChange={e => setResourceLink(e.target.value)} required
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '0.9rem' }} />
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
            <button type="button" onClick={() => navigate('/admin/resources')}
              style={{ padding: '10px 24px', borderRadius: '10px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary"
              style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.9rem' }}>
              {submitting ? 'Creating...' : '🚀 Create Resource'}
            </button>
          </div>
        </form>

        {/* Right: Resource Details Sidebar */}
        <div style={{
          background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px',
          padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', position: 'sticky', top: '100px'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Resource Details <FiInfo size={16} color="#d97706" />
          </h3>

          {/* Thumbnail */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginBottom: '8px' }}>Thumbnail</label>
            <div style={{
              border: '2px dashed #e2e8f0', borderRadius: '12px', padding: '32px',
              textAlign: 'center', cursor: 'pointer', background: '#f8fafc',
              transition: 'border-color 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#d97706'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}>
              <FiUploadCloud size={28} color="#94a3b8" />
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '8px 0 0' }}>Click to upload thumbnail</p>
              <p style={{ fontSize: '0.72rem', color: '#cbd5e1', margin: '4px 0 0' }}>PNG, JPG up to 2MB</p>
            </div>
          </div>

          {/* Resource Link preview */}
          {resourceLink && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginBottom: '6px' }}>Resource Link</label>
              <a href={resourceLink} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: '0.82rem', color: '#d97706', wordBreak: 'break-all' }}>{resourceLink}</a>
            </div>
          )}

          {/* Is Premium */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginBottom: '8px' }}>Is Premium</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px', cursor: 'pointer' }}>
                <input type="checkbox" checked={isPremium} onChange={e => setIsPremium(e.target.checked)}
                  style={{ opacity: 0, width: 0, height: 0 }} />
                <span style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  background: isPremium ? '#d97706' : '#cbd5e1',
                  borderRadius: '24px', transition: 'background 0.3s',
                }}>
                  <span style={{
                    position: 'absolute', height: '18px', width: '18px',
                    left: isPremium ? '22px' : '3px', bottom: '3px',
                    background: '#ffffff', borderRadius: '50%', transition: 'left 0.3s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                  }}></span>
                </span>
              </label>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Only premium users can access this resource</span>
            </div>
          </div>

          {/* Status */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginBottom: '6px' }}>Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)}
              style={{
                width: '100%', padding: '8px 12px', borderRadius: '8px',
                border: '1px solid #d1d5db', fontSize: '0.85rem', fontWeight: 600,
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
