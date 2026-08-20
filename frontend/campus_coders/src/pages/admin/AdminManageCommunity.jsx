import React, { useState, useCallback } from 'react';
import { FiCheck, FiTrash2, FiAlertTriangle, FiFlag } from 'react-icons/fi';
import Toast from '../../components/Toast';
import { MOCK_FLAGS, loadStore, saveStore } from './adminMockData';

export default function AdminManageCommunity() {
  const [flags, setFlags] = useState(() => loadStore('flags', MOCK_FLAGS));
  const [filter, setFilter] = useState('pending');

  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });
  const showToast = useCallback((type, message) => setToast({ show: true, type, message }), []);
  const hideToast = useCallback(() => setToast(prev => ({ ...prev, show: false })), []);

  const persist = (next) => { setFlags(next); saveStore('flags', next); };

  const act = (id, status, message) => {
    persist(flags.map(f => f.id === id ? { ...f, status } : f));
    showToast(status === 'deleted' ? 'info' : 'success', message);
  };

  const typeColor = (t) => t === 'POST' ? { bg: '#EEF2FF', color: '#4F46E5' } : t === 'COMMENT' ? { bg: '#FEF3C7', color: '#D97706' } : { bg: '#FCE7F3', color: '#DB2777' };
  const visible = flags.filter(f => filter === 'all' || f.status === filter);

  return (
    <div>
      <Toast type={toast.type} message={toast.message} show={toast.show} onClose={hideToast} />
      <div style={{ marginBottom: '20px' }}>
        <h1 className="ap-page-title">Community moderation</h1>
        <p className="ap-page-sub">Review flagged posts, comments and solutions in one queue</p>
      </div>

      <div className="ap-tabs">
        {['pending', 'approved', 'warned', 'deleted', 'all'].map(key => (
          <button key={key} className={`ap-tab ${filter === key ? 'active' : ''}`} onClick={() => setFilter(key)}>
            {key[0].toUpperCase() + key.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gap: '14px' }}>
        {visible.length === 0 && (
          <div className="ap-card-solid" style={{ textAlign: 'center', color: '#94a3b8', padding: '48px' }}>
            Queue is clear for this filter.
          </div>
        )}
        {visible.map(item => {
          const col = typeColor(item.type);
          return (
            <div key={item.id} className="ap-flag-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span className="ap-badge" style={{ background: col.bg, color: col.color }}>{item.type}</span>
                  <h3 style={{ margin: 0, fontSize: '1.05rem' }}>{item.title}</h3>
                </div>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{new Date(item.createdAt).toLocaleString()}</span>
              </div>
              <p style={{ margin: 0, color: '#4b5563', lineHeight: 1.55 }}>{item.excerpt}</p>
              <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: '#64748b', flexWrap: 'wrap' }}>
                <span>Author <strong style={{ color: '#111827' }}>{item.author}</strong></span>
                <span>Reported by <strong style={{ color: '#111827' }}>{item.reportedBy}</strong></span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><FiFlag color="#d97706" /> {item.reason}</span>
              </div>
              {item.status === 'pending' ? (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button className="ap-success-btn" onClick={() => act(item.id, 'approved', 'Content approved and restored.')}><FiCheck /> Approve</button>
                  <button className="ap-danger-btn" onClick={() => act(item.id, 'deleted', 'Content deleted from the feed.')}><FiTrash2 /> Delete content</button>
                  <button className="ap-ghost-btn" onClick={() => act(item.id, 'warned', `Warning issued to ${item.author}.`)}><FiAlertTriangle /> Issue warning</button>
                </div>
              ) : (
                <span className="ap-badge" style={{ background: '#F1F5F9', color: '#475569', width: 'fit-content' }}>{item.status.toUpperCase()}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
