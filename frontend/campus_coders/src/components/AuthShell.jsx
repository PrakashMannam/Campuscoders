import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import Logo from './Logo';

export default function AuthShell({ backTo = '/', backLabel = 'Back to Home', children }) {
  return (
    <div className="dotted-bg">
      <div className="auth-stack">
        <Link to={backTo} className="back-link">
          <FiArrowLeft size={16} />
          {backLabel}
        </Link>
        <div className="auth-brand">
          <Logo size={38} showText={true} layout="inline" theme="light" />
        </div>
        {children}
        <div className="auth-page-footer">
          © {new Date().getFullYear()} Campus Coders
        </div>
      </div>
    </div>
  );
}
