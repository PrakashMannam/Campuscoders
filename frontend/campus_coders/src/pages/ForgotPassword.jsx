import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiSend, FiInbox } from 'react-icons/fi';
import AuthShell from '../components/AuthShell';
import api from '../api/client';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter the email on your account.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send that email. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell backTo="/login" backLabel="Back to Sign in">
      <div className="auth-card">
        {submitted ? (
          <div className="auth-done">
            <div className="auth-done-icon" aria-hidden>
              <FiInbox size={32} />
            </div>
            <h2>Check your email</h2>
            <p className="subtitle">
              If that address is on an account, we sent a link to choose a new password.
            </p>
            <Link to="/login" className="btn btn-dark btn-full" style={{ justifyContent: 'center' }}>
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <h2>Forgot password</h2>
            <p className="subtitle">We’ll email you a link to choose a new password.</p>
            {error && <div className="inline-error">{error}</div>}
            <form onSubmit={handleEmailSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="forgot-email">Email</label>
                <div className="input-wrapper">
                  <span className="input-icon-left"><FiMail size={18} /></span>
                  <input
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-dark btn-full"
                style={{ padding: '14px', marginTop: '8px', gap: '10px' }}
                disabled={loading}
              >
                {loading ? 'Sending…' : <><FiSend size={15} /> Send email</>}
              </button>
            </form>
          </>
        )}
      </div>
    </AuthShell>
  );
}
