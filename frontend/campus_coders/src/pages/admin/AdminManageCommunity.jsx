import React, { useCallback, useEffect, useState } from 'react';
import { FiMessageCircle } from 'react-icons/fi';
import Toast from '../../components/Toast';
import EmptyState from '../../components/EmptyState';
import api from '../../api/client';

export default function AdminManageCommunity() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });
  const showToast = useCallback((type, message) => setToast({ show: true, type, message }), []);
  const hideToast = useCallback(() => setToast((prev) => ({ ...prev, show: false })), []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/discussions?page=0&size=20');
      setPosts(res.data?.content || []);
    } catch {
      // No flagging API yet - show honest empty if admin discussions unavailable
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const feature = async (id, featured) => {
    try {
      await api.patch(`/admin/discussions/${id}/${featured ? 'unfeature' : 'feature'}`);
      showToast('success', featured ? 'Unfeatured.' : 'Featured.');
      load();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Could not update thread.');
    }
  };

  const toggleActive = async (id, currentActive) => {
    try {
      const action = currentActive ? 'deactivate' : 'activate';
      await api.patch(`/admin/discussions/${id}/${action}`);
      showToast('success', `Thread ${currentActive ? 'deactivated' : 'activated'}.`);
      load();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Could not update thread status.');
    }
  };

  return (
    <div>
      <Toast type={toast.type} message={toast.message} show={toast.show} onClose={hideToast} />
      <div style={{ marginBottom: '20px' }}>
        <h1 className="ap-page-title">Community</h1>
        <p className="ap-page-sub">Moderate discussion threads. Flagging queue is not built yet - use feature / deactivate here.</p>
      </div>

      {loading ? (
        <p className="sd-muted">Loading threads...</p>
      ) : posts.length === 0 ? (
        <EmptyState
          title="No threads to moderate"
          description="When students post discussions, they will appear here for feature and deactivate actions."
        />
      ) : (
        <div style={{ display: 'grid', gap: '14px' }}>
          {posts.map((p) => (
            <div key={p.id} className="ap-card-solid" style={{ padding: 16 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <FiMessageCircle size={18} style={{ marginTop: 2, color: 'var(--gold)' }} />
                <div style={{ flex: 1 }}>
                  <strong>{p.title}</strong>
                  <p className="sd-muted" style={{ margin: '4px 0 10px' }}>
                    {p.authorName || p.authorFullName || 'Author'}
                    {p.categoryName ? ` - ${p.categoryName}` : ''}
                    {p.featured ? ' - Featured' : ''}
                  </p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button type="button" className="ap-ghost-btn" onClick={() => feature(p.id, p.featured)}>
                      {p.featured ? 'Unfeature' : 'Feature'}
                    </button>
                    <button type="button" className={p.active !== false ? 'ap-danger-btn' : 'ap-primary-btn'} onClick={() => toggleActive(p.id, p.active !== false)}>
                      {p.active !== false ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
