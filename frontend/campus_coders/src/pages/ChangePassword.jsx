import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiLock, FiEye, FiEyeOff, FiCheckCircle } from 'react-icons/fi';
import DashboardLayout from '../components/DashboardLayout';
import Toast from '../components/Toast';
import api from '../api/client';

export default function ChangePassword() {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ── Toast ── */
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });
  const showToast = useCallback((type, message) => {
    setToast({ show: true, type, message });
  }, []);
  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, show: false }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.put('/profile/me/password', {
        currentPassword,
        newPassword,
      });
      setLoading(false);
      setSuccess(true);
      showToast('success', 'Password updated successfully!');
      setTimeout(() => navigate('/dashboard/profile'), 2500);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || err.response?.data || 'Failed to update password. Please check your current password.');
    }
  };

  return (
    <DashboardLayout>
      <div className="cpw-page" style={{ padding: '32px', maxWidth: '600px' }}>
        <button className="cpw-back" onClick={() => navigate('/dashboard/profile')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#6b7280', marginBottom: '20px' }}>
          <FiArrowLeft size={16} /> Back to Profile
        </button>

        <Toast type={toast.type} message={toast.message} show={toast.show} onClose={hideToast} />

        <div className="cpw-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '32px' }}>
          {success ? (
            <div className="cpw-done" style={{ textAlign: 'center', padding: '20px 0' }}>
              <FiCheckCircle size={48} color="#10b981" style={{ marginBottom: '16px' }} />
              <h2>Password Changed!</h2>
              <p style={{ color: '#6b7280' }}>Your password has been updated successfully. Redirecting to profile...</p>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', margin: '0 0 8px' }}>Change Account Password</h2>
              <p style={{ fontSize: '0.9rem', color: '#6b7280', margin: '0 0 24px' }}>Ensure your account is using a long, secure password.</p>

              {error && (
                <div style={{ backgroundColor: '#FEF2F2', color: '#DC2626', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '20px', border: '1px solid #FCA5A5' }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">Current Password</label>
                  <div className="input-wrapper">
                    <span className="input-icon-left"><FiLock size={18} /></span>
                    <input
                      type={showCurrent ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="form-input"
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      required
                    />
                    <button type="button" className="input-icon-right" onClick={() => setShowCurrent(!showCurrent)}>
                      {showCurrent ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">New Password</label>
                  <div className="input-wrapper">
                    <span className="input-icon-left"><FiLock size={18} /></span>
                    <input
                      type={showNew ? 'text' : 'password'}
                      placeholder="Min. 6 characters"
                      className="form-input"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      required
                    />
                    <button type="button" className="input-icon-right" onClick={() => setShowNew(!showNew)}>
                      {showNew ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label className="form-label">Confirm New Password</label>
                  <div className="input-wrapper">
                    <span className="input-icon-left"><FiLock size={18} /></span>
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Re-enter new password"
                      className="form-input"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button type="button" className="input-icon-right" onClick={() => setShowConfirm(!showConfirm)}>
                      {showConfirm ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-full"
                  style={{ padding: '14px' }}
                  disabled={loading}
                >
                  {loading ? 'Updating Password...' : 'Change Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
