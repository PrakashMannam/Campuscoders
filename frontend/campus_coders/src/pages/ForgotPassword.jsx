import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft, FiMail, FiSend, FiShield,
  FiLock, FiEye, FiEyeOff, FiCheckCircle
} from 'react-icons/fi';
import Logo from '../components/Logo';

const REGISTERED_EMAILS = ['student@campus.com', 'admin@campus.com'];
const DEMO_OTP = '123456'; // In real app, this comes from backend

export default function ForgotPassword() {
  const navigate = useNavigate();

  // Step: 'email' | 'otp' | 'reset' | 'done'
  const [step, setStep] = useState('email');

  // Step 1 - Email
  const [email, setEmail] = useState('');

  // Step 2 - OTP
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];

  // Step 3 - New Password
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Shared
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState('');

  // ─────────────────────────────────────────────
  // STEP 1 — Submit Email
  // ─────────────────────────────────────────────
  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setError('');

    const isRegistered = REGISTERED_EMAILS.some(r => r.toLowerCase() === email.toLowerCase());
    if (!isRegistered) {
      setError('No account found with this email address.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
      // Focus first OTP input after render
      setTimeout(() => inputRefs[0].current?.focus(), 100);
    }, 1000);
  };

  // ─────────────────────────────────────────────
  // STEP 2 — OTP Input
  // ─────────────────────────────────────────────
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

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    setError('');
    const code = otp.join('');
    if (code.length < 6) {
      setError('Please enter the complete 6-digit OTP.');
      return;
    }
    // Demo: accept any 6-digit code (or match DEMO_OTP)
    if (code !== DEMO_OTP && code.length === 6) {
      // Accept any 6 digits for demo
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('reset');
    }, 1000);
  };

  const handleResend = (e) => {
    e.preventDefault();
    setOtp(['', '', '', '', '', '']);
    setError('');
    setResendMsg('OTP resent to your email. (Demo: use any 6 digits)');
    setTimeout(() => setResendMsg(''), 5000);
    setTimeout(() => inputRefs[0].current?.focus(), 50);
  };

  // ─────────────────────────────────────────────
  // STEP 3 — Reset Password
  // ─────────────────────────────────────────────
  const getStrength = (pwd) => {
    if (!pwd) return { label: '', color: '', width: '0%' };
    if (pwd.length < 6) return { label: 'Weak', color: '#ef4444', width: '25%' };
    if (pwd.length < 8) return { label: 'Fair', color: '#f97316', width: '50%' };
    if (/[A-Z]/.test(pwd) && /\d/.test(pwd)) return { label: 'Strong', color: '#10b981', width: '100%' };
    return { label: 'Good', color: '#3b82f6', width: '75%' };
  };

  const strength = getStrength(password);

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
      setTimeout(() => navigate('/login'), 2500);
    }, 1200);
  };

  // ─────────────────────────────────────────────
  // STEP INDICATOR
  // ─────────────────────────────────────────────
  const steps = [
    { key: 'email', label: 'Email' },
    { key: 'otp',   label: 'Verify' },
    { key: 'reset', label: 'Reset' },
  ];
  const stepIndex = { email: 0, otp: 1, reset: 2, done: 2 };

  const StepIndicator = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0', marginBottom: '28px' }}>
      {steps.map((s, i) => {
        const current = stepIndex[step];
        const isCompleted = i < current;
        const isActive = i === current;
        return (
          <React.Fragment key={s.key}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.78rem', fontWeight: 700,
                background: isCompleted ? '#10b981' : isActive ? '#D4AF37' : '#E5E7EB',
                color: isCompleted || isActive ? '#fff' : '#9CA3AF',
                transition: 'all 0.3s ease'
              }}>
                {isCompleted ? '✓' : i + 1}
              </div>
              <span style={{
                fontSize: '0.7rem', fontWeight: 600,
                color: isActive ? '#D4AF37' : isCompleted ? '#10b981' : '#9CA3AF'
              }}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                width: '48px', height: '2px', marginBottom: '18px',
                background: i < current ? '#10b981' : '#E5E7EB',
                transition: 'background 0.3s ease'
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
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
            <h2>Password Reset!</h2>
            <p className="subtitle" style={{ marginTop: '10px' }}>
              Your password has been updated successfully.<br />
              Redirecting to login…
            </p>
          </div>
        )}

        {/* ── EMAIL STEP ── */}
        {step === 'email' && (
          <>
            <StepIndicator />
            <h2>Reset Password</h2>
            <p className="subtitle">Enter your registered email to receive a verification OTP.</p>
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
                {loading ? 'Sending OTP…' : <><FiSend size={15} /> Send OTP</>}
              </button>
            </form>
          </>
        )}

        {/* ── OTP STEP ── */}
        {step === 'otp' && (
          <>
            <StepIndicator />
            <div className="otp-badge-wrapper">
              <FiShield size={26} />
            </div>
            <h2>Verify OTP</h2>
            <p className="subtitle" style={{ marginBottom: '24px' }}>
              We've sent a 6-digit code to <strong style={{ color: '#1F2937' }}>{email}</strong>. Enter it below.
              <br /><span style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>(Demo: enter any 6 digits)</span>
            </p>
            {error && <div className="inline-error">{error}</div>}
            {resendMsg && <div className="inline-success">{resendMsg}</div>}
            <form onSubmit={handleOtpSubmit}>
              <div className="otp-container">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={inputRefs[idx]}
                    type="text"
                    inputMode="numeric"
                    maxLength="1"
                    className="otp-input"
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    onPaste={idx === 0 ? handleOtpPaste : undefined}
                  />
                ))}
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-full"
                style={{ padding: '14px', gap: '10px' }}
                disabled={loading}
              >
                {loading ? 'Verifying…' : 'Verify & Continue'}
              </button>
            </form>
            <p className="auth-footer-text" style={{ marginTop: '20px' }}>
              Didn't get the code?{' '}
              <a href="#resend" style={{ color: '#8C701B', fontWeight: 700 }} onClick={handleResend}>
                Resend OTP
              </a>
            </p>
            <button
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: '0.85rem', marginTop: '12px', display: 'block', width: '100%' }}
              onClick={() => { setStep('email'); setOtp(['', '', '', '', '', '']); setError(''); }}
            >
              ← Change email
            </button>
          </>
        )}

        {/* ── RESET STEP ── */}
        {step === 'reset' && (
          <>
            <StepIndicator />
            <h2>Set New Password</h2>
            <p className="subtitle">
              Create a new password for <strong style={{ color: '#1F2937' }}>{email}</strong>.
            </p>
            {error && <div className="inline-error">{error}</div>}
            <form onSubmit={handleResetSubmit}>
              {/* New Password */}
              <div className="form-group">
                <label className="form-label">New Password</label>
                <div className="input-wrapper">
                  <span className="input-icon-left"><FiLock size={18} /></span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 8 characters"
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
                {password.length > 0 && (
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ height: '4px', background: '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: strength.width, background: strength.color, borderRadius: '4px', transition: 'all 0.3s ease' }} />
                    </div>
                    <span style={{ fontSize: '0.75rem', color: strength.color, fontWeight: 600, marginTop: '4px', display: 'block' }}>
                      {strength.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div className="input-wrapper">
                  <span className="input-icon-left"><FiLock size={18} /></span>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Re-enter your password"
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
                {confirmPassword.length > 0 && (
                  <span style={{ fontSize: '0.75rem', marginTop: '4px', display: 'block', color: confirmPassword === password ? '#10b981' : '#ef4444' }}>
                    {confirmPassword === password ? '✓ Passwords match' : 'Passwords do not match'}
                  </span>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full"
                style={{ padding: '14px', marginTop: '8px' }}
                disabled={loading}
              >
                {loading ? 'Updating…' : 'Reset Password'}
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
