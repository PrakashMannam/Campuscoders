import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiMail, FiLock, FiEye, FiEyeOff, FiLogIn } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      // Determine role from email for demo
      const role = email.toLowerCase().includes('admin') ? 'admin' : 'student';
      const result = login(email, password, role);

      setLoading(false);

      if (result.success) {
        if (result.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError('Invalid email or password. Try: student@campus.com / student123');
      }
    }, 800);
  };

  return (
    <div className="dotted-bg">
      {/* Upper header navigation */}
      <div className="auth-header">
        <Link to="/" className="back-link">
          <FiArrowLeft size={16} />
          Back to Home
        </Link>
        <Logo size={38} showText={true} layout="inline" theme="light" />
        <div style={{ width: '90px' }}></div>
      </div>

      {/* Main card */}
      <div className="auth-card">
        <h2>Welcome Back</h2>
        <p className="subtitle">Enter your credentials to access your workspace.</p>

        {error && (
          <div className="inline-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email */}
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

          {/* Password */}
          <div className="form-group">
            <div className="form-label-row">
              <label className="form-label">Password</label>
              <Link to="/forgot-password" className="forgot-link">Forgot Password?</Link>
            </div>
            <div className="input-wrapper">
              <span className="input-icon-left"><FiLock size={18} /></span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ letterSpacing: showPassword ? 'normal' : '0.2em' }}
              />
              <button
                type="button"
                className="input-icon-right"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            style={{ padding: '14px', marginTop: '12px', gap: '10px' }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : (<>Login <FiLogIn size={18} /></>)}
          </button>
        </form>

        <p className="auth-footer-text">
          Don't have an account? <Link to="/register">Sign Up</Link>
        </p>
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
