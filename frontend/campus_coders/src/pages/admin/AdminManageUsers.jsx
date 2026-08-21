import React, { useMemo, useState, useCallback } from 'react';
import { FiSearch, FiMoreVertical, FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';
import Toast from '../../components/Toast';
import { MOCK_USERS, loadStore, saveStore } from './adminMockData';

export default function AdminManageUsers() {
  const [users, setUsers] = useState(() => loadStore('users', MOCK_USERS));
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [page, setPage] = useState(0);
  const [menuId, setMenuId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [pointsDelta, setPointsDelta] = useState(50);
  const pageSize = 6;

  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });
  const showToast = useCallback((type, message) => setToast({ show: true, type, message }), []);
  const hideToast = useCallback(() => setToast(prev => ({ ...prev, show: false })), []);

  const persist = (next) => { setUsers(next); saveStore('users', next); };

  const filtered = useMemo(() => users.filter(u => {
    const q = search.toLowerCase();
    if (q && !`${u.fullName} ${u.email}`.toLowerCase().includes(q)) return false;
    if (role !== 'ALL' && u.role !== role) return false;
    if (status === 'ACTIVE' && (!u.enabled || u.banned)) return false;
    if (status === 'SUSPENDED' && u.enabled) return false;
    if (status === 'BANNED' && !u.banned) return false;
    return true;
  }), [users, search, role, status]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const rows = filtered.slice(page * pageSize, page * pageSize + pageSize);

  const patch = (id, changes, message) => {
    persist(users.map(u => u.id === id ? { ...u, ...changes } : u));
    setDetail(prev => prev && prev.id === id ? { ...prev, ...changes } : prev);
    setMenuId(null);
    if (message) showToast('success', message);
  };

  return (
    <div>
      <Toast type={toast.type} message={toast.message} show={toast.show} onClose={hideToast} />
      <div style={{ marginBottom: '20px' }}>
        <h1 className="ap-page-title">Users</h1>
        <p className="ap-page-sub">Search, filter and moderate every campus account</p>
      </div>

      <div className="ap-card-solid" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr', gap: '12px' }} className="ap-grid-3">
          <div style={{ position: 'relative' }}>
            <FiSearch style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
            <input className="form-input" value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} placeholder="Search name or email"
              style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '10px', border: '1px solid #d1d5db' }} />
          </div>
          <select className="form-select" value={role} onChange={e => { setRole(e.target.value); setPage(0); }} style={{ padding: '10px', borderRadius: '10px' }}>
            <option value="ALL">All roles</option>
            <option value="STUDENT">Student</option>
            <option value="ADMIN">Admin</option>
          </select>
          <select className="form-select" value={status} onChange={e => { setStatus(e.target.value); setPage(0); }} style={{ padding: '10px', borderRadius: '10px' }}>
            <option value="ALL">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="BANNED">Banned</option>
          </select>
        </div>
      </div>

      <div className="ap-card-solid">
        <div className="ap-table-wrap">
          <table className="ap-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Points</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 700, color: '#111827' }}>{u.fullName}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className="ap-badge" style={{ background: u.role === 'ADMIN' ? '#EEF2FF' : '#F3F4F6', color: u.role === 'ADMIN' ? '#4F46E5' : '#374151' }}>{u.role}</span>
                  </td>
                  <td style={{ fontWeight: 700 }}>{u.totalXp.toLocaleString()} XP</td>
                  <td>
                    <span className="ap-badge" style={{
                      background: u.banned ? '#FEF2F2' : u.enabled ? '#ECFDF5' : '#FFF7ED',
                      color: u.banned ? '#DC2626' : u.enabled ? '#059669' : '#C2410C'
                    }}>
                      {u.banned ? 'BANNED' : u.enabled ? 'ACTIVE' : 'SUSPENDED'}
                    </span>
                  </td>
                  <td style={{ position: 'relative' }}>
                    <button className="ap-icon-btn" onClick={() => setMenuId(menuId === u.id ? null : u.id)}><FiMoreVertical /></button>
                    {menuId === u.id && (
                      <div className="ap-menu">
                        <button onClick={() => { setDetail(u); setMenuId(null); }}>View progress</button>
                        <button onClick={() => { setDetail({ ...u, _points: true }); setMenuId(null); }}>Adjust points</button>
                        <button onClick={() => patch(u.id, { role: u.role === 'ADMIN' ? 'STUDENT' : 'ADMIN' }, `${u.fullName} is now ${u.role === 'ADMIN' ? 'STUDENT' : 'ADMIN'}`)}>
                          {u.role === 'ADMIN' ? 'Demote to student' : 'Promote to admin'}
                        </button>
                        <button onClick={() => patch(u.id, { enabled: !u.enabled }, u.enabled ? `${u.fullName} suspended` : `${u.fullName} reactivated`)}>
                          {u.enabled ? 'Suspend' : 'Reactivate'}
                        </button>
                        <button onClick={() => patch(u.id, { banned: !u.banned, enabled: u.banned }, u.banned ? `${u.fullName} unbanned` : `${u.fullName} banned`)} style={{ color: '#dc2626' }}>
                          {u.banned ? 'Lift ban' : 'Ban user'}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', color: '#64748b', fontSize: '0.85rem' }}>
          <span>{filtered.length} users</span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button className="ap-ghost-btn" disabled={page === 0} onClick={() => setPage(p => p - 1)}><FiChevronLeft /></button>
            <button className="ap-ghost-btn" disabled={page >= pages - 1} onClick={() => setPage(p => p + 1)}><FiChevronRight /></button>
          </div>
        </div>
      </div>

      {detail && (
        <div className="ap-overlay" onClick={() => setDetail(null)}>
          <div className="ap-modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0 }}>{detail.fullName}</h3>
              <button className="ap-icon-btn" onClick={() => setDetail(null)}><FiX /></button>
            </div>
            <p style={{ color: '#64748b' }}>{detail.email} · last active {detail.lastActive}</p>
            <div className="ap-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', margin: '16px 0' }}>
              <div className="ap-stat" style={{ padding: '14px' }}><div><div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>XP</div><strong>{detail.totalXp}</strong></div></div>
              <div className="ap-stat" style={{ padding: '14px' }}><div><div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>Streak</div><strong>{detail.dailyStreak} days</strong></div></div>
              <div className="ap-stat" style={{ padding: '14px' }}><div><div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>Solved</div><strong>{detail.problemsSolved}</strong></div></div>
            </div>
            {detail._points && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input type="number" className="form-input" value={pointsDelta} onChange={e => setPointsDelta(Number(e.target.value))}
                  style={{ width: '120px', padding: '8px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                <button className="ap-success-btn" onClick={() => patch(detail.id, { totalXp: detail.totalXp + pointsDelta }, `Awarded ${pointsDelta} XP`)}>+ Award</button>
                <button className="ap-danger-btn" onClick={() => patch(detail.id, { totalXp: Math.max(0, detail.totalXp - pointsDelta) }, `Removed ${pointsDelta} XP`)}>− Deduct</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
