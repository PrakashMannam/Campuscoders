import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Toast from '../../components/Toast';
import api from '../../api/client';

export default function AdminManageResources() {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });

  const showToast = useCallback((type, message) => setToast({ show: true, type, message }), []);
  const hideToast = useCallback(() => setToast((p) => ({ ...p, show: false })), []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/resources');
      setResources(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Could not load resources.');
      setResources([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const toggleActive = async (item) => {
    try {
      await api.patch(`/admin/resources/${item.id}/${item.active ? 'deactivate' : 'activate'}`);
      await load();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Could not update status.');
    }
  };

  return (
    <div>
      <Toast type={toast.type} message={toast.message} show={toast.show} onClose={hideToast} />
      <div className="ap-header" style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 className="ap-page-title">Resources</h1>
          <p className="ap-page-sub">Links students open inside a topic. Create a path and topic first.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => navigate('/admin/resources/create')}>New resource</button>
      </div>

      <div className="ap-card-solid">
        {loading ? <p className="ap-page-sub">Loading...</p> : resources.length === 0 ? (
          <p className="ap-page-sub">No resources yet.</p>
        ) : (
          <table className="ap-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Path</th>
                <th>Topic</th>
                <th>Type</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {resources.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 700 }}>{r.title}</td>
                  <td>{r.learningPathTitle || '-'}</td>
                  <td>{r.topicTitle || '-'}</td>
                  <td>{r.type}</td>
                  <td>{r.active ? 'Live' : 'Hidden'}</td>
                  <td>
                    <button
                      type="button"
                      className="sd-text-link"
                      onClick={() => navigate('/admin/resources/create', { state: { editResource: r } })}
                    >
                      Edit
                    </button>
                    {' - '}
                    <button type="button" className="sd-text-link" onClick={() => toggleActive(r)}>
                      {r.active ? 'Hide' : 'Show'}
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
