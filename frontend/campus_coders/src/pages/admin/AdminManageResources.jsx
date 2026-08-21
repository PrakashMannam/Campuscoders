import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiPlus, FiRefreshCw, FiEye, FiEdit2, FiTrash2,
  FiChevronLeft, FiChevronRight, FiFilter, FiX
} from 'react-icons/fi';
import Toast from '../../components/Toast';
import api from '../../api/client';
import { MOCK_RESOURCES, MOCK_PATHS, MOCK_TOPICS, loadStore, saveStore } from './adminMockData';

const TYPES = ['All Types', 'VIDEO', 'ARTICLE', 'PDF', 'DOCUMENTATION', 'COURSE'];
const DIFFICULTIES = ['All Difficulties', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
const STATUSES = ['All Statuses', 'Active', 'Inactive'];

export default function AdminManageResources() {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [learningPaths, setLearningPaths] = useState([]);
  const [topics, setTopics] = useState([]);
  const [filterPath, setFilterPath] = useState('');
  const [filterTopic, setFilterTopic] = useState('');
  const [filterType, setFilterType] = useState('All Types');
  const [filterDifficulty, setFilterDifficulty] = useState('All Difficulties');
  const [filterStatus, setFilterStatus] = useState('All Statuses');
  const [search, setSearch] = useState('');
  const [viewing, setViewing] = useState(null);

  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });
  const showToast = useCallback((type, message) => setToast({ show: true, type, message }), []);
  const hideToast = useCallback(() => setToast(prev => ({ ...prev, show: false })), []);

  useEffect(() => {
    const fetchPaths = async () => {
      try {
        const res = await api.get('/admin/learning-paths/options');
        setLearningPaths(res.data?.length ? res.data : MOCK_PATHS);
      } catch {
        setLearningPaths(MOCK_PATHS);
      }
    };
    fetchPaths();
  }, []);

  useEffect(() => {
    if (!filterPath) {
      setTopics([]);
      setFilterTopic('');
      return;
    }
    const fetchTopics = async () => {
      try {
        const res = await api.get(`/admin/topics/options?learningPathId=${filterPath}`);
        setTopics(res.data?.length ? res.data : MOCK_TOPICS.filter(t => String(t.pathId) === String(filterPath)));
      } catch {
        setTopics(MOCK_TOPICS.filter(t => String(t.pathId) === String(filterPath)));
      }
    };
    fetchTopics();
  }, [filterPath]);

  const fetchResources = useCallback(async () => {
    setLoading(true);
    const local = loadStore('resources', MOCK_RESOURCES);
    try {
      let url = `/admin/resources?page=${currentPage}&size=${pageSize}`;
      if (filterPath) url += `&learningPathId=${filterPath}`;
      if (filterTopic) url += `&topicId=${filterTopic}`;
      if (filterType !== 'All Types') url += `&type=${filterType}`;
      if (filterDifficulty !== 'All Difficulties') url += `&difficulty=${filterDifficulty}`;
      if (filterStatus === 'Active') url += `&active=true`;
      else if (filterStatus === 'Inactive') url += `&active=false`;
      const res = await api.get(url);
      const content = res.data.content || [];
      setResources(content.length ? content : local);
    } catch {
      setResources(local);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, filterPath, filterTopic, filterType, filterDifficulty, filterStatus]);

  useEffect(() => { fetchResources(); }, [fetchResources]);

  const persist = (next) => {
    setResources(next);
    saveStore('resources', next);
  };

  const filtered = useMemo(() => {
    return resources.filter(r => {
      if (search && !`${r.title} ${r.description} ${(r.tags || []).join(' ')}`.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterPath && String(r.learningPathId) !== String(filterPath)) return false;
      if (filterTopic && String(r.topicId) !== String(filterTopic)) return false;
      if (filterType !== 'All Types' && r.type !== filterType) return false;
      if (filterDifficulty !== 'All Difficulties' && r.difficulty !== filterDifficulty) return false;
      if (filterStatus === 'Active' && r.active === false) return false;
      if (filterStatus === 'Inactive' && r.active !== false) return false;
      return true;
    });
  }, [resources, search, filterPath, filterTopic, filterType, filterDifficulty, filterStatus]);

  const totalResources = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalResources / pageSize));
  const pageItems = filtered.slice(currentPage * pageSize, currentPage * pageSize + pageSize);

  const handleClearFilters = () => {
    setFilterPath('');
    setFilterTopic('');
    setFilterType('All Types');
    setFilterDifficulty('All Difficulties');
    setFilterStatus('All Statuses');
    setSearch('');
    setCurrentPage(0);
  };

  const handleToggleActive = async (resource) => {
    try {
      await api.patch(`/admin/resources/${resource.id}/toggle-active`);
    } catch { /* mock */ }
    persist(resources.map(r => r.id === resource.id ? { ...r, active: !r.active } : r));
    showToast('success', `Resource ${resource.active ? 'deactivated' : 'activated'} successfully.`);
  };

  const handleDelete = async (resource) => {
    if (!window.confirm(`Delete "${resource.title}"? This action cannot be undone.`)) return;
    try {
      await api.delete(`/admin/resources/${resource.id}`);
    } catch { /* mock */ }
    persist(resources.filter(r => r.id !== resource.id));
    showToast('success', 'Resource deleted successfully.');
  };

  const typeBadgeColor = (type) => {
    switch (type) {
      case 'VIDEO': return { bg: '#FEF3C7', color: '#92400E' };
      case 'ARTICLE': return { bg: '#DBEAFE', color: '#1E40AF' };
      case 'PDF': return { bg: '#FCE7F3', color: '#9D174D' };
      case 'DOCUMENTATION': return { bg: '#E0E7FF', color: '#3730A3' };
      default: return { bg: '#ECFDF5', color: '#047857' };
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

  const startItem = totalResources === 0 ? 0 : currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalResources);

  return (
    <div>
      <Toast type={toast.type} message={toast.message} show={toast.show} onClose={hideToast} />

      <div className="ap-header">
        <div>
          <h1 className="ap-page-title">Resources</h1>
          <p className="ap-page-sub">Filter, edit and archive learning assets</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/admin/resources/create')}>
          <FiPlus size={16} /> Create Resource
        </button>
      </div>

      <div className="ap-card-solid" style={{ marginBottom: '16px' }}>
        <input
          className="ap-input"
          placeholder="Search title, description or tags…"
          value={search}
          onChange={e => { setSearch(e.target.value); setCurrentPage(0); }}
          style={{ marginBottom: '16px' }}
        />
        <div className="ap-grid-filters">
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginBottom: '6px' }}>Learning Path</label>
            <select className="form-select" value={filterPath} onChange={e => { setFilterPath(e.target.value); setFilterTopic(''); setCurrentPage(0); }}>
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
          <button onClick={() => { setCurrentPage(0); fetchResources(); }} className="btn btn-primary" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
            <FiFilter size={14} /> Apply Filters
          </button>
          <button onClick={handleClearFilters} className="ap-ghost-btn">Clear Filters</button>
        </div>
      </div>

      <div className="ap-card-solid">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>
            Total Resources: <strong style={{ color: '#111827' }}>{totalResources}</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={fetchResources} className="ap-ghost-btn"><FiRefreshCw size={14} /> Refresh</button>
            <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(0); }}
              style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.82rem' }}>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        </div>

        <div className="ap-table-wrap">
          <table className="ap-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Learning Path</th>
                <th>Topic</th>
                <th>Type</th>
                <th>Difficulty</th>
                <th>Tags</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  <div className="admin-loading-spinner"></div>Loading resources...
                </td></tr>
              ) : pageItems.length === 0 ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  No resources found. Try adjusting your filters or create a new resource.
                </td></tr>
              ) : pageItems.map(r => {
                const tColor = typeBadgeColor(r.type);
                const dColor = diffBadgeColor(r.difficulty);
                return (
                  <tr key={r.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#111827', fontSize: '0.9rem' }}>{r.title}</div>
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>{r.description?.substring(0, 50)}</div>
                    </td>
                    <td><span style={{ color: '#d97706', fontWeight: 600, fontSize: '0.85rem' }}>{r.learningPathName || '—'}</span></td>
                    <td>{r.topicName || '—'}</td>
                    <td><span className="ap-badge" style={{ background: tColor.bg, color: tColor.color }}>{r.type}</span></td>
                    <td><span className="ap-badge" style={{ background: dColor.bg, color: dColor.color }}>{r.difficulty}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {(r.tags || []).slice(0, 2).map(tag => <span key={tag} className="ap-chip">{tag}</span>)}
                      </div>
                    </td>
                    <td>
                    <label className="ap-toggle">
                      <input type="checkbox" checked={r.active !== false} onChange={() => handleToggleActive(r)} />
                      <i />
                    </label>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button title="View" className="ap-icon-btn" onClick={() => setViewing(r)}><FiEye size={16} /></button>
                        <button title="Edit" className="ap-icon-btn accent" onClick={() => navigate('/admin/resources/create', { state: { editResource: r } })}>
                          <FiEdit2 size={16} />
                        </button>
                        <button title="Delete" className="ap-icon-btn danger" onClick={() => handleDelete(r)}>
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Showing {startItem} to {endItem} of {totalResources} resources
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)}
              style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #d1d5db', background: currentPage === 0 ? '#f8fafc' : '#fff', cursor: currentPage === 0 ? 'not-allowed' : 'pointer', color: currentPage === 0 ? '#cbd5e1' : '#374151' }}>
              <FiChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
              <button key={i} onClick={() => setCurrentPage(i)}
                style={{
                  padding: '6px 12px', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem',
                  border: currentPage === i ? 'none' : '1px solid #d1d5db',
                  background: currentPage === i ? '#d97706' : '#fff',
                  color: currentPage === i ? '#fff' : '#374151', cursor: 'pointer'
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

      {viewing && (
        <div className="ap-overlay" onClick={() => setViewing(null)}>
          <div className="ap-modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.35rem' }}>{viewing.title}</h2>
                <p style={{ color: '#64748b', margin: '6px 0 0' }}>{viewing.learningPathName} · {viewing.topicName}</p>
              </div>
              <button className="ap-icon-btn" onClick={() => setViewing(null)}><FiX size={18} /></button>
            </div>
            <p style={{ color: '#374151', lineHeight: 1.6 }}>{viewing.description}</p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '16px 0' }}>
              <span className="ap-badge" style={typeBadgeColor(viewing.type)}>{viewing.type}</span>
              <span className="ap-badge" style={diffBadgeColor(viewing.difficulty)}>{viewing.difficulty}</span>
              {(viewing.tags || []).map(t => <span key={t} className="ap-chip">{t}</span>)}
            </div>
            <a href={viewing.resourceLink} target="_blank" rel="noreferrer" style={{ color: '#d97706', fontWeight: 700, wordBreak: 'break-all' }}>{viewing.resourceLink}</a>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px' }}>
              <button className="ap-ghost-btn" onClick={() => setViewing(null)}>Close</button>
              <button className="btn btn-primary" onClick={() => navigate('/admin/resources/create', { state: { editResource: viewing } })}>Edit Resource</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
