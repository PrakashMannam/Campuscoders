import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft, FiMail, FiSend,
  FiLock, FiEye, FiEyeOff, FiCheckCircle
} from 'react-icons/fi';
import Logo from '../components/Logo';
import api from '../api/client';

export default function ForgotPassword() {
  const navigate = useNavigate();

  // Step: 'email' | 'reset' | 'done'
  const [step, setStep] = useState('email');

  // Step 1 - Email
  const [email, setEmail] = useState('');

  // Step 2 - Token & New Password
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Shared state
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // ─────────────────────────────────────────────
  // STEP 1 — Submit Email to Backend
  // ─────────────────────────────────────────────
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email) {
      setError('Please enter your registered email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setLoading(false);
      setSuccessMsg(res.data.message || 'If an account exists, a reset token has been generated.');
      setStep('reset');
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to process forgot password request.');
    }
  };

  // ─────────────────────────────────────────────
  // STEP 2 — Reset Password with Token
  // ─────────────────────────────────────────────
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token || !password) {
      setError('Please fill in both the reset token and new password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        token: token.trim(),
        newPassword: password,
      });
      setLoading(false);
      setStep('done');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || err.response?.data || 'Failed to reset password. Token may be expired or invalid.');
    }
  };

  return (
    <div className="dotted-bg">
      {/* Header */}
      <div className="auth-header">
        <Link to="/login" className="back-link">
          <FiArrowLeft size={16} />
          Back to Login
        </Link>
        <Logo size={38} showText={true} layout="inline" theme="light" />
        <div style={{ width: '90px' }}></div>
      </div>

      {/* Card */}
      <div className="auth-card">

        {/* ── DONE ── */}
        {step === 'done' && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: '#ECFDF5', display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 20px'
            }}>
              <FiCheckCircle size={36} color="#10b981" />
            </div>
            <h2>Password Reset Successful!</h2>
            <p className="subtitle" style={{ marginTop: '10px' }}>
              Your password has been updated.<br />
              Redirecting to login...
            </p>
          </div>
        )}

        {/* ── EMAIL STEP ── */}
        {step === 'email' && (
          <>
            <h2>Reset Password</h2>
            <p className="subtitle">Enter your registered email to generate a password reset token.</p>
            {error && <div className="inline-error">{error}</div>}
            <form onSubmit={handleEmailSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-wrapper">
                  <span className="input-icon-left"><FiMail size={18} /></span>
                  <input
                    type="email"
                    placeholder="name@college.edu"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-full"
                style={{ padding: '14px', marginTop: '8px', gap: '10px' }}
                disabled={loading}
              >
                {loading ? 'Sending Request...' : <><FiSend size={15} /> Generate Reset Token</>}
              </button>
            </form>
          </>
        )}

        {/* ── RESET STEP ── */}
        {step === 'reset' && (
          <>
            <h2>Set New Password</h2>
            <p className="subtitle">
              Enter your reset token and new password for <strong style={{ color: '#1F2937' }}>{email}</strong>.
            </p>
            {successMsg && (
              <div style={{
                backgroundColor: '#ECFDF5', color: '#059669', padding: '12px',
                borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px', border: '1px solid #A7F3D0'
              }}>
                {successMsg}
              </div>
            )}
            {error && <div className="inline-error">{error}</div>}
            <form onSubmit={handleResetSubmit}>

              {/* Reset Token */}
              <div className="form-group">
                <label className="form-label">Reset Token</label>
                <input
                  type="text"
                  placeholder="Paste your reset token here"
                  className="form-input"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                />
              </div>

              {/* New Password */}
              <div className="form-group">
                <label className="form-label">New Password</label>
                <div className="input-wrapper">
                  <span className="input-icon-left"><FiLock size={18} /></span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 6 characters"
                    className="form-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ letterSpacing: showPassword ? 'normal' : '0.2em' }}
                  />
                  <button type="button" className="input-icon-right" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div className="input-wrapper">
                  <span className="input-icon-left"><FiLock size={18} /></span>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Re-enter new password"
                    className="form-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    style={{ letterSpacing: showConfirm ? 'normal' : '0.2em' }}
                  />
                  <button type="button" className="input-icon-right" onClick={() => setShowConfirm(!showConfirm)}>
                    {showConfirm ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full"
                style={{ padding: '14px', marginTop: '8px' }}
                disabled={loading}
              >
                {loading ? 'Updating Password...' : 'Reset Password'}
              </button>
            </form>
          </>
        )}
      </div>

      <div className="auth-page-footer">
        <div className="auth-page-footer-links">
          <a href="#support">Support</a>
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
        </div>
        <div>© 2024 Campus Coders. All rights reserved.</div>
      </div>
    </div>
  );
}
