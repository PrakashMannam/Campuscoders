import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiPlus, FiRefreshCw, FiEye, FiEdit2, FiTrash2,
  FiChevronLeft, FiChevronRight, FiCopy, FiFilter
} from 'react-icons/fi';
import Toast from '../../components/Toast';
import api from '../../api/client';

const TYPES = ['All Types', 'VIDEO', 'ARTICLE', 'PDF', 'DOCUMENTATION', 'COURSE'];
const DIFFICULTIES = ['All Difficulties', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
const STATUSES = ['All Statuses', 'Active', 'Inactive'];

export default function AdminManageResources() {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalResources, setTotalResources] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [learningPaths, setLearningPaths] = useState([]);
  const [topics, setTopics] = useState([]);
  const [filterPath, setFilterPath] = useState('');
  const [filterTopic, setFilterTopic] = useState('');
  const [filterType, setFilterType] = useState('All Types');
  const [filterDifficulty, setFilterDifficulty] = useState('All Difficulties');
  const [filterStatus, setFilterStatus] = useState('All Statuses');

  /* ── Toast ── */
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });
  const showToast = useCallback((type, message) => {
    setToast({ show: true, type, message });
  }, []);
  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, show: false }));
  }, []);

  // Fetch learning paths for the filter dropdown
  useEffect(() => {
    const fetchPaths = async () => {
      try {
        const res = await api.get('/admin/learning-paths/options');
        setLearningPaths(res.data || []);
      } catch (err) {
        // Fallback: use mock data
        setLearningPaths([
          { id: 1, name: 'Java Full Stack' },
          { id: 2, name: 'Python Full Stack' },
          { id: 3, name: 'DSA Intensive' },
          { id: 4, name: 'Spring Boot' },
        ]);
      }
    };
    fetchPaths();
  }, []);

  // Fetch topics based on selected learning path
  useEffect(() => {
    if (!filterPath) {
      setTopics([]);
      setFilterTopic('');
      return;
    }
    const fetchTopics = async () => {
      try {
        const res = await api.get(`/admin/topics/options?learningPathId=${filterPath}`);
        setTopics(res.data || []);
      } catch (err) {
        setTopics([]);
      }
    };
    fetchTopics();
  }, [filterPath]);

  // Fetch resources
  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/admin/resources?page=${currentPage}&size=${pageSize}`;
      if (filterPath) url += `&learningPathId=${filterPath}`;
      if (filterTopic) url += `&topicId=${filterTopic}`;
      if (filterType !== 'All Types') url += `&type=${filterType}`;
      if (filterDifficulty !== 'All Difficulties') url += `&difficulty=${filterDifficulty}`;
      if (filterStatus === 'Active') url += `&active=true`;
      else if (filterStatus === 'Inactive') url += `&active=false`;

      const res = await api.get(url);
      setResources(res.data.content || []);
      setTotalResources(res.data.totalElements || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      // Use empty state on error
      setResources([]);
      setTotalResources(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, filterPath, filterTopic, filterType, filterDifficulty, filterStatus]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const handleApplyFilters = () => {
    setCurrentPage(0);
    fetchResources();
  };

  const handleClearFilters = () => {
    setFilterPath('');
    setFilterTopic('');
    setFilterType('All Types');
    setFilterDifficulty('All Difficulties');
    setFilterStatus('All Statuses');
    setCurrentPage(0);
  };

  const handleToggleActive = async (resource) => {
    try {
      await api.patch(`/admin/resources/${resource.id}/toggle-active`);
      showToast('success', `Resource ${resource.active ? 'deactivated' : 'activated'} successfully.`);
      fetchResources();
    } catch (err) {
      showToast('error', 'Failed to toggle resource status.');
    }
  };

  const handleDelete = async (resource) => {
    if (!window.confirm(`Delete "${resource.title}"? This action cannot be undone.`)) return;
    try {
      await api.delete(`/admin/resources/${resource.id}`);
      showToast('success', 'Resource deleted successfully.');
      fetchResources();
    } catch (err) {
      showToast('error', 'Failed to delete resource.');
    }
  };

  const buildApiUrl = () => {
    let url = `/api/admin/resources?`;
    const params = [];
    if (filterTopic) params.push(`topicId=${filterTopic}`);
    if (filterType !== 'All Types') params.push(`type=${filterType}`);
    if (filterDifficulty !== 'All Difficulties') params.push(`difficulty=${filterDifficulty}`);
    if (filterStatus === 'Active') params.push(`active=true`);
    else if (filterStatus === 'Inactive') params.push(`active=false`);
    return url + params.join('&');
  };

  const copyApiUrl = () => {
    navigator.clipboard.writeText(buildApiUrl());
    showToast('success', 'API URL copied to clipboard!');
  };

  const typeBadgeColor = (type) => {
    switch (type) {
      case 'VIDEO': return { bg: '#FEF3C7', color: '#92400E' };
      case 'ARTICLE': return { bg: '#DBEAFE', color: '#1E40AF' };
      case 'PDF': return { bg: '#FCE7F3', color: '#9D174D' };
      case 'DOCUMENTATION': return { bg: '#E0E7FF', color: '#3730A3' };
      default: return { bg: '#F3F4F6', color: '#374151' };
    }
  };

  const diffBadgeColor = (diff) => {
    switch (diff) {
      case 'BEGINNER': return { bg: '#ECFDF5', color: '#059669' };
      case 'INTERMEDIATE': return { bg: '#FEF3C7', color: '#D97706' };
      case 'ADVANCED': return { bg: '#FEF2F2', color: '#DC2626' };
      default: return { bg: '#F3F4F6', color: '#374151' };
    }
  };

  const startItem = currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalResources);

  return (
    <div>
      <Toast type={toast.type} message={toast.message} show={toast.show} onClose={hideToast} />

      {/* Breadcrumb */}
      <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '8px' }}>
        <span style={{ cursor: 'pointer', color: '#d97706' }} onClick={() => navigate('/admin')}>Resources</span>
        <span style={{ margin: '0 6px' }}>›</span>
        <span>Manage Resources</span>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#111827', margin: '0 0 6px' }}>Manage Resources</h1>
          <p style={{ color: '#6B7280', margin: 0, fontSize: '0.9rem' }}>View, filter and manage all resources in the platform</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/admin/resources/create')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontWeight: 700 }}
        >
          <FiPlus size={16} /> Create Resource
        </button>
      </div>

      {/* API URL Preview */}
      <div style={{
        background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px',
        padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '24px', fontSize: '0.85rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
          <span style={{
            background: '#16A34A', color: '#fff', padding: '3px 10px', borderRadius: '6px',
            fontSize: '0.72rem', fontWeight: 800
          }}>GET</span>
          <code style={{ color: '#166534', fontFamily: 'monospace', fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {buildApiUrl()}
          </code>
        </div>
        <button onClick={copyApiUrl} style={{
          background: 'none', border: '1px solid #BBF7D0', borderRadius: '6px',
          padding: '4px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
          fontSize: '0.8rem', color: '#166534', fontWeight: 600
        }}>
          <FiCopy size={14} /> Copy
        </button>
      </div>

      {/* Filters */}
      <div style={{
        background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px',
        padding: '24px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginBottom: '6px' }}>Learning Path</label>
            <select className="form-select" value={filterPath} onChange={e => { setFilterPath(e.target.value); setFilterTopic(''); }}>
              <option value="">All Learning Paths</option>
              {learningPaths.map(lp => <option key={lp.id} value={lp.id}>{lp.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginBottom: '6px' }}>Topic</label>
            <select className="form-select" value={filterTopic} onChange={e => setFilterTopic(e.target.value)} disabled={!filterPath}>
              <option value="">All Topics</option>
              {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginBottom: '6px' }}>Type</label>
            <select className="form-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginBottom: '6px' }}>Difficulty</label>
            <select className="form-select" value={filterDifficulty} onChange={e => setFilterDifficulty(e.target.value)}>
              {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginBottom: '6px' }}>Active Status</label>
            <select className="form-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handleApplyFilters} className="btn btn-primary" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
            <FiFilter size={14} /> Apply Filters
          </button>
          <button onClick={handleClearFilters} style={{
            background: 'none', border: '1px solid #d1d5db', borderRadius: '8px',
            padding: '8px 16px', cursor: 'pointer', fontSize: '0.85rem', color: '#4b5563', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: '6px'
          }}>
            Clear Filters
          </button>
        </div>
      </div>

      {/* Resource Table */}
      <div style={{
        background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px',
        padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        {/* Table Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>
            Total Resources: <strong style={{ color: '#111827' }}>{totalResources}</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={fetchResources} style={{
              background: 'none', border: '1px solid #d1d5db', borderRadius: '8px',
              padding: '6px 14px', cursor: 'pointer', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px'
            }}>
              <FiRefreshCw size={14} /> Refresh
            </button>
            <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(0); }}
              style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.82rem' }}>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #f1f5f9', textAlign: 'left' }}>
              <th style={{ padding: '12px', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', cursor: 'pointer' }}>Title ↕</th>
              <th style={{ padding: '12px', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', cursor: 'pointer' }}>Learning Path ↕</th>
              <th style={{ padding: '12px', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', cursor: 'pointer' }}>Topic ↕</th>
              <th style={{ padding: '12px', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', cursor: 'pointer' }}>Type ↕</th>
              <th style={{ padding: '12px', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', cursor: 'pointer' }}>Difficulty ↕</th>
              <th style={{ padding: '12px', fontSize: '0.78rem', fontWeight: 700, color: '#64748b' }}>Active ↕</th>
              <th style={{ padding: '12px', fontSize: '0.78rem', fontWeight: 700, color: '#64748b' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                <div className="admin-loading-spinner"></div>Loading resources...
              </td></tr>
            ) : resources.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                No resources found. Try adjusting your filters or create a new resource.
              </td></tr>
            ) : resources.map(r => {
              const tColor = typeBadgeColor(r.type);
              const dColor = diffBadgeColor(r.difficulty);
              return (
                <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '16px 12px' }}>
                    <div style={{ fontWeight: 700, color: '#111827', fontSize: '0.9rem' }}>{r.title}</div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>{r.description?.substring(0, 50)}</div>
                  </td>
                  <td style={{ padding: '16px 12px' }}>
                    <span style={{ color: '#d97706', fontWeight: 600, fontSize: '0.85rem' }}>{r.learningPathName || '—'}</span>
                  </td>
                  <td style={{ padding: '16px 12px', color: '#4b5563', fontSize: '0.85rem' }}>{r.topicName || '—'}</td>
                  <td style={{ padding: '16px 12px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700,
                      background: tColor.bg, color: tColor.color
                    }}>{r.type}</span>
                  </td>
                  <td style={{ padding: '16px 12px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700,
                      background: dColor.bg, color: dColor.color
                    }}>{r.difficulty}</span>
                  </td>
                  <td style={{ padding: '16px 12px' }}>
                    <label className="admin-toggle-switch" style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
                      <input type="checkbox" checked={r.active !== false} onChange={() => handleToggleActive(r)}
                        style={{ opacity: 0, width: 0, height: 0 }} />
                      <span className="admin-toggle-slider" style={{
                        position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                        background: r.active !== false ? '#d97706' : '#cbd5e1',
                        borderRadius: '24px', transition: 'background 0.3s',
                      }}>
                        <span style={{
                          position: 'absolute', content: '""', height: '18px', width: '18px',
                          left: r.active !== false ? '22px' : '3px', bottom: '3px',
                          background: '#ffffff', borderRadius: '50%', transition: 'left 0.3s',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                        }}></span>
                      </span>
                    </label>
                  </td>
                  <td style={{ padding: '16px 12px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button title="View" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}>
                        <FiEye size={16} />
                      </button>
                      <button title="Edit" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d97706', padding: '4px' }}>
                        <FiEdit2 size={16} />
                      </button>
                      <button title="Delete" onClick={() => handleDelete(r)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}>
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Showing {totalResources > 0 ? startItem : 0} to {endItem} of {totalResources} resources
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)}
              style={{
                padding: '6px 10px', borderRadius: '8px', border: '1px solid #d1d5db',
                background: currentPage === 0 ? '#f8fafc' : '#fff', cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
                color: currentPage === 0 ? '#cbd5e1' : '#374151'
              }}>
              <FiChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
              <button key={i} onClick={() => setCurrentPage(i)}
                style={{
                  padding: '6px 12px', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem',
                  border: currentPage === i ? 'none' : '1px solid #d1d5db',
                  background: currentPage === i ? '#d97706' : '#fff',
                  color: currentPage === i ? '#fff' : '#374151',
                  cursor: 'pointer'
                }}>
                {i + 1}
              </button>
            ))}
            <button disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage(p => p + 1)}
              style={{
                padding: '6px 10px', borderRadius: '8px', border: '1px solid #d1d5db',
                background: currentPage >= totalPages - 1 ? '#f8fafc' : '#fff',
                cursor: currentPage >= totalPages - 1 ? 'not-allowed' : 'pointer',
                color: currentPage >= totalPages - 1 ? '#cbd5e1' : '#374151'
              }}>
              <FiChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
