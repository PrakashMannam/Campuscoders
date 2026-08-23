import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiLogIn } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import AuthShell from '../components/AuthShell';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      if (result.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else if (result.needsVerification) {
      navigate(`/verify-email?email=${encodeURIComponent(email)}`);
    } else {
      setError(result.error || 'Invalid email or password.');
    }
  };

  return (
    <AuthShell backTo="/" backLabel="Back to Home">
      <div className="auth-card">
        <h2>Welcome back</h2>
        <p className="subtitle">Sign in with your email and password.</p>

        {error && <div className="inline-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email</label>
            <div className="input-wrapper">
              <span className="input-icon-left"><FiMail size={18} /></span>
              <input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="form-label-row">
              <label className="form-label" htmlFor="login-password">Password</label>
              <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
            </div>
            <div className="input-wrapper">
              <span className="input-icon-left"><FiLock size={18} /></span>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Your password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="input-icon-right"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Show password"
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-dark btn-full"
            style={{ padding: '14px', marginTop: '12px', gap: '10px' }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : (<>Sign in <FiLogIn size={18} /></>)}
          </button>
        </form>

        <p className="auth-footer-text">
          Don't have an account? <Link to="/register">Create account</Link>
        </p>
      </div>
    </AuthShell>
  );
}
