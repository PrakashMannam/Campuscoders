import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FiLock, FiEye, FiEyeOff, FiCheckCircle } from 'react-icons/fi';
import AuthShell from '../components/AuthShell';
import api from '../api/client';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = (searchParams.get('token') || '').trim();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Open the link from your email to continue.');
      return;
    }
    if (password.length < 6) {
      setError('Use at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        token,
        newPassword: password,
      });
      setDone(true);
      setTimeout(() => navigate('/login'), 2200);
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(typeof msg === 'string' ? msg : 'This link has expired. Request a new email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell backTo="/login" backLabel="Back to Sign in">
      <div className="auth-card">
        {done ? (
          <div className="auth-done">
            <div className="auth-done-icon auth-done-icon-ok" aria-hidden>
              <FiCheckCircle size={32} />
            </div>
            <h2>Password updated</h2>
            <p className="subtitle">You can sign in with your new password.</p>
          </div>
        ) : !token ? (
          <div className="auth-done">
            <h2>Check your email</h2>
            <p className="subtitle">
              Use the link we sent you. If you don’t have it, request a new one.
            </p>
            <Link to="/forgot-password" className="btn btn-dark btn-full" style={{ justifyContent: 'center' }}>
              Send a new email
            </Link>
          </div>
        ) : (
          <>
            <h2>New password</h2>
            <p className="subtitle">Choose something you’ll remember.</p>
            {error && <div className="inline-error">{error}</div>}
            <form onSubmit={handleResetSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="new-password">New password</label>
                <div className="input-wrapper">
                  <span className="input-icon-left"><FiLock size={18} /></span>
                  <input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    className="form-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                  <button type="button" className="input-icon-right" onClick={() => setShowPassword(!showPassword)} aria-label="Show password">
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
                <span className="field-hint">At least 6 characters</span>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="confirm-password">Confirm password</label>
                <div className="input-wrapper">
                  <span className="input-icon-left"><FiLock size={18} /></span>
                  <input
                    id="confirm-password"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Type it again"
                    className="form-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                  <button type="button" className="input-icon-right" onClick={() => setShowConfirm(!showConfirm)} aria-label="Show confirm password">
                    {showConfirm ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-dark btn-full"
                style={{ padding: '14px', marginTop: '8px' }}
                disabled={loading}
              >
                {loading ? 'Saving…' : 'Save password'}
              </button>
            </form>
          </>
        )}
      </div>
    </AuthShell>
  );
}
