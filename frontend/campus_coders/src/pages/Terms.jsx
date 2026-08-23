import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

export default function Terms() {
  return (
    <div className="legal-page">
      <div className="legal-inner">
        <Link to="/" className="back-link">← Back to Home</Link>
        <div className="auth-brand" style={{ margin: '24px 0' }}>
          <Logo size={36} showText layout="inline" theme="light" />
        </div>
        <h1>Terms of Use</h1>
        <p className="legal-updated">Last updated: August 23, 2026</p>
        <p>
          By using Campus Coders you agree to use the platform respectfully and for learning purposes.
        </p>
        <h2>Accounts</h2>
        <ul>
          <li>You are responsible for keeping your login credentials private.</li>
          <li>Provide accurate information and do not impersonate others.</li>
          <li>Admins may disable accounts that abuse the community or break these terms.</li>
        </ul>
        <h2>Content</h2>
        <ul>
          <li>Learning resources are curated links to third-party sites. Those sites have their own terms.</li>
          <li>Do not post illegal, harassing, or plagiarized content in discussions.</li>
          <li>Problem of the Day links send you to external practice platforms — submissions happen there.</li>
        </ul>
        <h2>Availability</h2>
        <p>
          The service is provided as-is for education. Features may change as the product grows.
          We are not liable for downtime or for outcomes on external coding platforms.
        </p>
        <h2>Contact</h2>
        <p>
          For account or content issues, contact a Campus Coders administrator.
        </p>
      </div>
    </div>
  );
}
