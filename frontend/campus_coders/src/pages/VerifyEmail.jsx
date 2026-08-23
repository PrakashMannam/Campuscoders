import React, { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FiMail, FiKey } from "react-icons/fi";
import AuthShell from "../components/AuthShell";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { applyAuthSession } = useAuth();
  const initialEmail = useMemo(() => params.get("email") || "", [params]);

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const finishLogin = (data) => {
    applyAuthSession({
      token: data.token,
      fullName: data.fullName,
      email: data.email,
      role: data.role,
      id: data.id,
    });
    const role = String(data.role || "").toLowerCase();
    navigate(role === "admin" ? "/admin" : "/dashboard");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    if (!email || code.length !== 6) {
      setError("Enter your email and the 6-digit code.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/auth/verify-email", { email: email.trim(), code: code.trim() });
      finishLogin(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setInfo("");
    if (!email) {
      setError("Enter your email first.");
      return;
    }
    setResending(true);
    try {
      const res = await api.post("/auth/resend-verification", { email: email.trim() });
      setInfo(res.data?.message || "If needed, a new code was sent.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not resend code.");
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthShell backTo="/login" backLabel="Back to sign in">
      <div className="auth-card">
        <h2>Verify your email</h2>
        <p className="subtitle">
          Enter the 6-digit code from your inbox. If you just tried to sign in, a new code was sent.
          Otherwise use Resend code.
        </p>

        {error && <div className="inline-error">{error}</div>}
        {info && (
          <div className="inline-error" style={{ background: "#ECFDF5", color: "#059669", borderColor: "#A7F3D0" }}>
            {info}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="verify-email">Email</label>
            <div className="input-wrapper">
              <span className="input-icon-left"><FiMail size={18} /></span>
              <input
                id="verify-email"
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@gmail.com"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="verify-code">Verification code</label>
            <div className="input-wrapper">
              <span className="input-icon-left"><FiKey size={18} /></span>
              <input
                id="verify-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                className="form-input"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="6-digit code"
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-dark btn-full" disabled={loading}>
            {loading ? "Verifying…" : "Verify and continue"}
          </button>
        </form>

        <p className="subtitle" style={{ marginTop: 16 }}>
          Didn’t get it?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            style={{ background: "none", border: "none", color: "var(--gold-text)", fontWeight: 700, cursor: "pointer" }}
          >
            {resending ? "Sending…" : "Resend code"}
          </button>
        </p>

        <p className="subtitle">
          Already verified? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </AuthShell>
  );
}
