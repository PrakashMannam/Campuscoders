import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiArrowLeft, FiMail, FiSend, FiShield,
  FiLock, FiEye, FiEyeOff, FiCheckCircle
} from 'react-icons/fi';
import DashboardLayout from '../components/DashboardLayout';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';

export default function ChangePassword() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Step: 'otp' | 'verify' | 'reset' | 'done'
  const [step, setStep] = useState('otp');

  // OTP state
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];

  // Password state
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Shared
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Toast
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });
  const showToast = useCallback((type, message) => {
    setToast({ show: true, type, message });
  }, []);
  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, show: false }));
  }, []);

  // ── Send OTP ──
  const handleSendOtp = () => {
    setLoading(true);
    setError('');
    setTimeout(() => {
      setLoading(false);
      setStep('verify');
      showToast('info', `OTP sent to ${user?.email || 'your email'}`);
      setTimeout(() => inputRefs[0].current?.focus(), 200);
    }, 1200);
  };

  // ── OTP input handlers ──
  const handleOtpChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');
    if (value && index < 5) inputRefs[index + 1].current?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const data = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(data)) return;
    const newOtp = [...otp];
    for (let i = 0; i < data.length; i++) newOtp[i] = data[i];
    setOtp(newOtp);
    const focusIndex = Math.min(data.length, 5);
    inputRefs[focusIndex].current?.focus();
  };

  // ── Verify OTP ──
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setError('');
    const code = otp.join('');
    if (code.length < 6) {
      setError('Please enter the complete 6-digit OTP.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('reset');
      showToast('success', 'OTP verified successfully!');
    }, 1000);
  };

  // ── Resend OTP ──
  const handleResend = (e) => {
    e.preventDefault();
    setOtp(['', '', '', '', '', '']);
    setError('');
    showToast('info', 'OTP resent to your email. (Demo: use any 6 digits)');
    setTimeout(() => inputRefs[0].current?.focus(), 50);
  };

  // ── Password strength ──
  const getStrength = (pwd) => {
    if (!pwd) return { label: '', color: '', width: '0%' };
    if (pwd.length < 6) return { label: 'Weak', color: '#ef4444', width: '25%' };
    if (pwd.length < 8) return { label: 'Fair', color: '#f97316', width: '50%' };
    if (/[A-Z]/.test(pwd) && /\d/.test(pwd)) return { label: 'Strong', color: '#10b981', width: '100%' };
    return { label: 'Good', color: '#3b82f6', width: '75%' };
  };

  const strength = getStrength(password);

  // ── Reset Password ──
  const handleResetSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('done');
      showToast('success', 'Password changed successfully!');
      setTimeout(() => navigate('/dashboard/settings'), 3000);
    }, 1200);
  };

  // ── Step indicator ──
  const steps = [
    { key: 'otp', label: 'Send OTP' },
    { key: 'verify', label: 'Verify' },
    { key: 'reset', label: 'New Password' },
  ];
  const stepIndex = { otp: 0, verify: 1, reset: 2, done: 2 };

  const StepIndicator = () => (
    <div className="cpw-steps">
      {steps.map((s, i) => {
        const current = stepIndex[step];
        const isCompleted = i < current;
        const isActive = i === current;
        return (
          <React.Fragment key={s.key}>
            <div className="cpw-step">
              <div className={`cpw-step-circle ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                {isCompleted ? '✓' : i + 1}
              </div>
              <span className={`cpw-step-label ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`cpw-step-line ${i < current ? 'completed' : ''}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="cpw-page">
        <button className="cpw-back" onClick={() => navigate('/dashboard/settings')}>
          <FiArrowLeft size={16} /> Back to Settings
        </button>

        <Toast type={toast.type} message={toast.message} show={toast.show} onClose={hideToast} />

        <div className="cpw-card">
          <StepIndicator />

          {/* ── DONE ── */}
          {step === 'done' && (
            <div className="cpw-done">
              <div className="cpw-done-icon">
                <FiCheckCircle size={40} />
              </div>
              <h2>Password Changed!</h2>
              <p>Your password has been updated successfully. Redirecting to settings…</p>
            </div>
          )}

          {/* ── STEP 1: Send OTP ── */}
          {step === 'otp' && (
            <div className="cpw-step-content">
              <div className="cpw-icon-badge">
                <FiMail size={28} />
              </div>
              <h2>Verify Your Identity</h2>
              <p>We'll send a 6-digit OTP to <strong>{user?.email}</strong> to verify it's you.</p>
              <button
                className="cpw-primary-btn"
                id="send-otp-btn"
                onClick={handleSendOtp}
                disabled={loading}
              >
                {loading ? 'Sending OTP…' : <><FiSend size={15} /> Send OTP</>}
              </button>
            </div>
          )}

          {/* ── STEP 2: Verify OTP ── */}
          {step === 'verify' && (
            <div className="cpw-step-content">
              <div className="cpw-icon-badge">
                <FiShield size={28} />
              </div>
              <h2>Enter Verification Code</h2>
              <p>
                We've sent a 6-digit code to <strong>{user?.email}</strong>.
                <br /><span className="cpw-hint">(Demo: enter any 6 digits)</span>
              </p>

              {error && <div className="cpw-error">{error}</div>}

              <form onSubmit={handleVerifyOtp}>
                <div className="cpw-otp-container">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={inputRefs[idx]}
                      type="text"
                      inputMode="numeric"
                      maxLength="1"
                      className="cpw-otp-input"
                      value={digit}
                      onChange={e => handleOtpChange(idx, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(idx, e)}
                      onPaste={idx === 0 ? handleOtpPaste : undefined}
                    />
                  ))}
                </div>
                <button type="submit" className="cpw-primary-btn" disabled={loading}>
                  {loading ? 'Verifying…' : 'Verify & Continue'}
                </button>
              </form>

              <p className="cpw-resend">
                Didn't get the code?{' '}
                <a href="#resend" onClick={handleResend}>Resend OTP</a>
              </p>
            </div>
          )}

          {/* ── STEP 3: New Password ── */}
          {step === 'reset' && (
            <div className="cpw-step-content">
              <h2>Set New Password</h2>
              <p>Create a new password for your account.</p>

              {error && <div className="cpw-error">{error}</div>}

              <form onSubmit={handleResetSubmit} className="cpw-form">
                <div className="cpw-field">
                  <label>NEW PASSWORD</label>
                  <div className="cpw-input-wrap">
                    <span className="cpw-input-icon"><FiLock size={16} /></span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min. 8 characters"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                    />
                    <button type="button" className="cpw-toggle-pw" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                  {password.length > 0 && (
                    <div className="cpw-strength">
                      <div className="cpw-strength-bar">
                        <div className="cpw-strength-fill" style={{ width: strength.width, background: strength.color }} />
                      </div>
                      <span style={{ color: strength.color }}>{strength.label}</span>
                    </div>
                  )}
                </div>

                <div className="cpw-field">
                  <label>CONFIRM PASSWORD</label>
                  <div className="cpw-input-wrap">
                    <span className="cpw-input-icon"><FiLock size={16} /></span>
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button type="button" className="cpw-toggle-pw" onClick={() => setShowConfirm(!showConfirm)}>
                      {showConfirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                  {confirmPassword.length > 0 && (
                    <span className="cpw-match" style={{ color: confirmPassword === password ? '#10b981' : '#ef4444' }}>
                      {confirmPassword === password ? '✓ Passwords match' : 'Passwords do not match'}
                    </span>
                  )}
                </div>

                <button type="submit" className="cpw-primary-btn" disabled={loading}>
                  {loading ? 'Updating…' : 'Change Password'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
