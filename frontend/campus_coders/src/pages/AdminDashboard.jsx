import React, { useState, useEffect, useCallback } from 'react';
import {
  FiUsers, FiCheck, FiX, FiShield, FiBell
} from 'react-icons/fi';
import Toast from '../components/Toast';
import api from '../api/client';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Announcement Form State
  const [announceTitle, setAnnounceTitle] = useState('');
  const [announceMessage, setAnnounceMessage] = useState('');
  const [announceCategory, setAnnounceCategory] = useState('SYSTEM');

  /* ── Toast ── */
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });
  const showToast = useCallback((type, message) => {
    setToast({ show: true, type, message });
  }, []);
  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, show: false }));
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.content || []);
    } catch (err) {
      showToast('error', 'Failed to load user management list.');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleActivate = async (user) => {
    try {
      if (user.enabled) {
        await api.patch(`/admin/users/${user.id}/deactivate`);
        showToast('info', `Deactivated ${user.fullName}`);
      } else {
        await api.patch(`/admin/users/${user.id}/activate`);
        showToast('success', `Activated ${user.fullName}`);
      }
      fetchUsers();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Action failed.');
    }
  };

  const handleToggleRole = async (user) => {
    const newRole = user.role === 'ADMIN' ? 'STUDENT' : 'ADMIN';
    try {
      await api.patch(`/admin/users/${user.id}/role`, { role: newRole });
      showToast('success', `Updated ${user.fullName} role to ${newRole}`);
      fetchUsers();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to update role.');
    }
  };

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!announceTitle.trim() || !announceMessage.trim()) return;

    try {
      await api.post('/admin/announcements', {
        title: announceTitle.trim(),
        message: announceMessage.trim(),
        category: announceCategory,
      });
      setAnnounceTitle('');
      setAnnounceMessage('');
      showToast('success', 'Platform Announcement broadcasted successfully!');
    } catch (err) {
      showToast('error', 'Failed to post announcement.');
    }
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      <Toast type={toast.type} message={toast.message} show={toast.show} onClose={hideToast} />

      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#111827', margin: '0 0 6px' }}>
          Platform Administrative Console
        </h1>
        <p style={{ color: '#6B7280', margin: 0 }}>
          Manage student accounts, system security, roles, and campus broadcasts.
        </p>
      </div>

      {/* User Management Table */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', marginBottom: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiUsers size={20} color="#6366f1" /> Registered Platform Users ({users.length})
          </h3>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #f1f5f9', textAlign: 'left' }}>
              <th style={{ padding: '12px', fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>USER</th>
              <th style={{ padding: '12px', fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>EMAIL</th>
              <th style={{ padding: '12px', fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>ROLE</th>
              <th style={{ padding: '12px', fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>STATUS</th>
              <th style={{ padding: '12px', fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>XP & STREAK</th>
              <th style={{ padding: '12px', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>Loading users...</td>
              </tr>
            ) : users.map((u) => (
              <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '16px 12px', fontWeight: 700, color: '#111827' }}>{u.fullName}</td>
                <td style={{ padding: '16px 12px', color: '#4b5563' }}>{u.email}</td>
                <td style={{ padding: '16px 12px' }}>
                  <span style={{
                    padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700,
                    background: u.role === 'ADMIN' ? '#EEF2FF' : '#F3F4F6',
                    color: u.role === 'ADMIN' ? '#4F46E5' : '#374151'
                  }}>
                    {u.role}
                  </span>
                </td>
                <td style={{ padding: '16px 12px' }}>
                  <span style={{
                    padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700,
                    background: u.enabled ? '#ECFDF5' : '#FEF2F2',
                    color: u.enabled ? '#059669' : '#DC2626'
                  }}>
                    {u.enabled ? 'ACTIVE' : 'DEACTIVATED'}
                  </span>
                </td>
                <td style={{ padding: '16px 12px', fontSize: '0.85rem', color: '#64748b' }}>
                  {u.totalXp} XP • 🔥 {u.dailyStreak} Days
                </td>
                <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                  <button
                    onClick={() => handleToggleRole(u)}
                    style={{ background: 'none', border: '1px solid #d1d5db', borderRadius: '6px', padding: '4px 8px', fontSize: '0.75rem', cursor: 'pointer', marginRight: '8px' }}
                  >
                    <FiShield size={12} /> {u.role === 'ADMIN' ? 'Demote' : 'Make Admin'}
                  </button>
                  <button
                    onClick={() => handleToggleActivate(u)}
                    style={{
                      background: u.enabled ? '#FEF2F2' : '#ECFDF5',
                      color: u.enabled ? '#DC2626' : '#059669',
                      border: 'none', borderRadius: '6px', padding: '6px 10px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer'
                    }}
                  >
                    {u.enabled ? <><FiX size={12} /> Deactivate</> : <><FiCheck size={12} /> Activate</>}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Broadcast Announcement */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiBell size={20} color="#d4af37" /> Broadcast Platform Announcement
        </h3>
        <form onSubmit={handlePostAnnouncement}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: '16px', marginBottom: '16px' }}>
            <input
              type="text"
              placeholder="Announcement Title"
              className="form-input"
              value={announceTitle}
              onChange={(e) => setAnnounceTitle(e.target.value)}
              required
            />
            <select
              className="form-select"
              value={announceCategory}
              onChange={(e) => setAnnounceCategory(e.target.value)}
            >
              <option value="SYSTEM">SYSTEM</option>
              <option value="ACADEMIC">ACADEMIC</option>
              <option value="EVENT">EVENT</option>
              <option value="HACKATHON">HACKATHON</option>
            </select>
          </div>
          <textarea
            placeholder="Write announcement broadcast message..."
            className="form-input"
            rows={3}
            value={announceMessage}
            onChange={(e) => setAnnounceMessage(e.target.value)}
            style={{ marginBottom: '16px' }}
            required
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }}>
            Broadcast to Campus
          </button>
        </form>
      </div>
    </div>
  );
}
