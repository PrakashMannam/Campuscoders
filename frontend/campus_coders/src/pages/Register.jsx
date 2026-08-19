import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiArrowRight,
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!fullName || !email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const result = await register(fullName, email, password);
    setLoading(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        if (result.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }, 1000);
    } else {
      setError(result.error || 'Registration failed.');
    }
  };

  return (
    <div className="dotted-bg">
      {/* Upper header navigation */}
      <div className="auth-header">
        <Link to="/" className="back-link">
          <FiArrowLeft size={16} />
          BACK TO HOME
        </Link>
        <Logo size={38} showText={true} layout="inline" theme="light" />
        <div style={{ width: "90px" }}></div>
      </div>

      {/* Main Card */}
      <div className="auth-card" style={{ maxWidth: "520px" }}>
        <h2>Join the Cohort</h2>
        <p className="subtitle" style={{ marginBottom: "28px" }}>
          Create your engineer profile to access resources and peer discussions.
        </p>

        {error && (
          <div
            style={{
              backgroundColor: "#FEF2F2",
              color: "#DC2626",
              padding: "12px",
              borderRadius: "8px",
              fontSize: "0.85rem",
              fontWeight: 500,
              marginBottom: "20px",
              textAlign: "left",
              border: "1px solid #FCA5A5",
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              backgroundColor: "#ECFDF5",
              color: "#059669",
              padding: "12px",
              borderRadius: "8px",
              fontSize: "0.85rem",
              fontWeight: 500,
              marginBottom: "20px",
              textAlign: "left",
              border: "1px solid #A7F3D0",
            }}
          >
            Account created successfully! Redirecting to Dashboard...
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="input-wrapper">
              <span className="input-icon-left">
                <FiUser size={18} />
              </span>
              <input
                type="text"
                placeholder="e.g. Alan Turing"
                className="form-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-wrapper">
              <span className="input-icon-left">
                <FiMail size={18} />
              </span>
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
            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <span className="input-icon-left">
                <FiLock size={18} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ letterSpacing: showPassword ? "normal" : "0.2em" }}
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

          {/* Create Account Button */}
          <button
            type="submit"
            className="btn btn-primary btn-full"
            style={{ padding: "14px", marginTop: "12px", gap: "10px" }}
            disabled={loading}
          >
            {loading ? (
              "Creating Account..."
            ) : (
              <>
                Create Account
                <FiArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <p className="auth-footer-text" style={{ marginTop: "20px" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#8C701B", fontWeight: 700 }}>
            Login
          </Link>
        </p>
      </div>

      {/* Footer links */}
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
