import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import AuthShell from "../components/AuthShell";

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
      if (result.requiresEmailVerification) {
        navigate(`/verify-email?email=${encodeURIComponent(result.email || email)}`);
        return;
      }
      setSuccess(true);
      setTimeout(() => {
        if (result.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      }, 1000);
    } else {
      setError(result.error || "Registration failed.");
    }
  };

  return (
    <AuthShell backTo="/" backLabel="Back to Home">
      <div className="auth-card">
        <h2>Create your account</h2>
        <p className="subtitle">
          Name, email, and password. We’ll email a verification code when mail is configured.
        </p>

        {error && <div className="inline-error">{error}</div>}

        {success && (
          <div className="inline-error" style={{ background: "#ECFDF5", color: "#059669", borderColor: "#A7F3D0" }}>
            Account created. Opening your dashboard…
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="register-name">Full name</label>
            <div className="input-wrapper">
              <span className="input-icon-left"><FiUser size={18} /></span>
              <input
                id="register-name"
                type="text"
                placeholder="First and last name"
                className="form-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-email">Email</label>
            <div className="input-wrapper">
              <span className="input-icon-left"><FiMail size={18} /></span>
              <input
                id="register-email"
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
            <label className="form-label" htmlFor="register-password">Password</label>
            <div className="input-wrapper">
              <span className="input-icon-left"><FiLock size={18} /></span>
              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                minLength={6}
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
            <span className="field-hint">At least 6 characters</span>
          </div>

          <button
            type="submit"
            className="btn btn-dark btn-full"
            style={{ padding: "14px", marginTop: "12px", gap: "10px" }}
            disabled={loading}
          >
            {loading ? "Creating account..." : <>Create account <FiArrowRight size={18} /></>}
          </button>
        </form>

        <p className="auth-footer-text" style={{ marginTop: "20px" }}>
          Already have an account?{" "}
          <Link to="/login">Sign in</Link>
        </p>
      </div>
    </AuthShell>
  );
}
