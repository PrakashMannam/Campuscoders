import React, { useCallback, useEffect, useState } from 'react';
import { FiSearch, FiMoreVertical, FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';
import Toast from '../../components/Toast';
import EmptyState from '../../components/EmptyState';
import api from '../../api/client';

export default function AdminManageUsers() {
  const [users, setUsers] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('ALL');
  const [enabledFilter, setEnabledFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [menuId, setMenuId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const pageSize = 10;

  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });
  const showToast = useCallback((type, message) => setToast({ show: true, type, message }), []);
  const hideToast = useCallback(() => setToast((prev) => ({ ...prev, show: false })), []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), size: String(pageSize) });
      if (role !== 'ALL') params.set('role', role);
      if (enabledFilter === 'ACTIVE') params.set('enabled', 'true');
      if (enabledFilter === 'SUSPENDED') params.set('enabled', 'false');
      if (search.trim()) params.set('search', search.trim());
      const res = await api.get(`/admin/users?${params.toString()}`);
      setUsers(res.data?.content || []);
      setTotalElements(res.data?.totalElements ?? 0);
    } catch (err) {
      setUsers([]);
      showToast('error', err.response?.data?.message || 'Could not load users.');
    } finally {
      setLoading(false);
    }
  }, [page, role, enabledFilter, search, showToast]);

  useEffect(() => { load(); }, [load]);

  const pages = Math.max(1, Math.ceil(totalElements / pageSize));

  const activate = async (id) => {
    try {
      await api.patch(`/admin/users/${id}/activate`);
      showToast('success', 'User activated.');
      setMenuId(null);
      load();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Could not activate user.');
    }
  };

  const deactivate = async (id) => {
    try {
      await api.patch(`/admin/users/${id}/deactivate`);
      showToast('success', 'User deactivated.');
      setMenuId(null);
      load();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Could not deactivate user.');
    }
  };

  const setRoleFor = async (id, nextRole) => {
    try {
      await api.patch(`/admin/users/${id}/role`, { role: nextRole });
      showToast('success', `Role updated to ${nextRole}.`);
      setMenuId(null);
      load();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Could not update role.');
    }
  };

  return (
    <div>
      <Toast type={toast.type} message={toast.message} show={toast.show} onClose={hideToast} />
      <div style={{ marginBottom: '20px' }}>
        <h1 className="ap-page-title">Users</h1>
        <p className="ap-page-sub">Search, filter, and manage accounts on the open platform</p>
      </div>

      <div className="ap-card-solid" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr', gap: '12px' }} className="ap-grid-3">
          <div style={{ position: 'relative' }}>
            <FiSearch style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
            <input
              className="form-input"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              placeholder="Search name or email"
              style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '10px', border: '1px solid #d1d5db' }}
            />
          </div>
          <select className="form-select" value={role} onChange={(e) => { setRole(e.target.value); setPage(0); }} style={{ padding: '10px', borderRadius: '10px' }}>
            <option value="ALL">All roles</option>
            <option value="STUDENT">Student</option>
            <option value="ADMIN">Admin</option>
          </select>
          <select className="form-select" value={enabledFilter} onChange={(e) => { setEnabledFilter(e.target.value); setPage(0); }} style={{ padding: '10px', borderRadius: '10px' }}>
            <option value="ALL">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </div>

      <div className="ap-card-solid">
        {loading ? (
          <p className="sd-muted" style={{ padding: 16 }}>Loading users...</p>
        ) : users.length === 0 ? (
          <EmptyState title="No users found" description="Try a different search or filter." />
        ) : (
          <>
            <div className="ap-table-wrap">
              <table className="ap-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>University</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 700, color: '#111827' }}>{u.fullName}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className="ap-badge" style={{ background: u.role === 'ADMIN' ? '#EEF2FF' : '#F3F4F6', color: u.role === 'ADMIN' ? '#4F46E5' : '#374151' }}>
                          {u.role}
                        </span>
                      </td>
                      <td>{u.university || '-'}</td>
                      <td>
                        <span className="ap-badge" style={{
                          background: u.enabled ? '#ECFDF5' : '#FFF7ED',
                          color: u.enabled ? '#059669' : '#C2410C',
                        }}>
                          {u.enabled ? 'ACTIVE' : 'SUSPENDED'}
                        </span>
                      </td>
                      <td style={{ position: 'relative' }}>
                        <button type="button" className="ap-icon-btn" onClick={() => setMenuId(menuId === u.id ? null : u.id)}>
                          <FiMoreVertical />
                        </button>
                        {menuId === u.id && (
                          <div className="ap-menu">
                            <button type="button" onClick={() => { setDetail(u); setMenuId(null); }}>View</button>
                            <button
                              type="button"
                              onClick={() => setRoleFor(u.id, u.role === 'ADMIN' ? 'STUDENT' : 'ADMIN')}
                            >
                              {u.role === 'ADMIN' ? 'Demote to student' : 'Promote to admin'}
                            </button>
                            {u.enabled ? (
                              <button type="button" onClick={() => deactivate(u.id)}>Suspend</button>
                            ) : (
                              <button type="button" onClick={() => activate(u.id)}>Reactivate</button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', color: '#64748b', fontSize: '0.85rem' }}>
              <span>{totalElements} users</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button type="button" className="ap-ghost-btn" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                  <FiChevronLeft />
                </button>
                <button type="button" className="ap-ghost-btn" disabled={page >= pages - 1} onClick={() => setPage((p) => p + 1)}>
                  <FiChevronRight />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {detail && (
        <div className="ap-overlay" onClick={() => setDetail(null)} role="presentation">
          <div className="ap-modal" onClick={(e) => e.stopPropagation()} role="dialog">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0 }}>{detail.fullName}</h3>
              <button type="button" className="ap-icon-btn" onClick={() => setDetail(null)}><FiX /></button>
            </div>
            <p style={{ color: '#64748b' }}>{detail.email}</p>
            <p style={{ color: '#64748b' }}>University: {detail.university || 'Not set'}</p>
            {detail.bio && <p>{detail.bio}</p>}
            <div className="ap-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', margin: '16px 0' }}>
              <div className="ap-stat" style={{ padding: '14px' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>Streak</div>
                <strong>{detail.dailyStreak ?? 0} days</strong>
              </div>
              <div className="ap-stat" style={{ padding: '14px' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>Role</div>
                <strong>{detail.role}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
