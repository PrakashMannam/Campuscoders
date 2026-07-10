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
import { FaFingerprint } from "react-icons/fa";
import Logo from "../components/Logo";

export default function Register() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [department, setDepartment] = useState("Computer Science");
  const [year, setYear] = useState("First Year");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!fullName || !email || !rollNumber || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 12) {
      setError("Password must be at least 12 characters.");
      return;
    }

    setLoading(true);

    // Simulate account registration
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);

      // Store temporary signup email and info to simulate OTP verification
      sessionStorage.setItem("pending-login-email", email);
      sessionStorage.setItem("pending-login-password", password);
      sessionStorage.setItem("pending-login-role", "student");
      sessionStorage.setItem("pending-login-name", fullName);

      setTimeout(() => {
        navigate("/verify-otp");
      }, 1000);
    }, 1200);
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
        <div style={{ width: "90px" }}></div> {/* Spacer for symmetry */}
      </div>

      {/* Main Card */}
      <div className="auth-card" style={{ maxWidth: "520px" }}>
        <h2>Join the Cohort</h2>
        <p className="subtitle" style={{ marginBottom: "28px" }}>
          Create your engineer profile to access documentation and peer reviews.
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
            Profile created successfully! Redirecting to Login Page...
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

          {/* Email & College Roll Number Row */}
          <div className="form-group-row">
            <div className="form-group">
              <label className="form-label">Email</label>
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

            <div className="form-group">
              <label className="form-label">College Roll Number</label>
              <div className="input-wrapper">
                <span className="input-icon-left">
                  <FaFingerprint size={18} />
                </span>
                <input
                  type="text"
                  placeholder="2024CS101"
                  className="form-input"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Department & Year Dropdowns Row */}
          <div className="form-group-row">
            <div className="form-group">
              <label className="form-label">Department</label>
              <select
                className="form-select"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">
                  Information Technology
                </option>
                <option value="Electronics & Communication">
                  Electronics & Communication
                </option>
                <option value="Mechanical Engineering">
                  Mechanical Engineering
                </option>
                <option value="Civil Engineering">Civil Engineering</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Year</label>
              <select
                className="form-select"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              >
                <option value="First Year">First Year</option>
                <option value="Second Year">Second Year</option>
                <option value="Third Year">Third Year</option>
                <option value="Fourth Year">Fourth Year</option>
              </select>
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
