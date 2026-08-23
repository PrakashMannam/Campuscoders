import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

export default function Privacy() {
  return (
    <div className="legal-page">
      <div className="legal-inner">
        <Link to="/" className="back-link">← Back to Home</Link>
        <div className="auth-brand" style={{ margin: '24px 0' }}>
          <Logo size={36} showText layout="inline" theme="light" />
        </div>
        <h1>Privacy Policy</h1>
        <p className="legal-updated">Last updated: August 23, 2026</p>
        <p>
          Campus Coders (“we”) provides a learning workspace for students. This page explains what we collect
          and how we use it.
        </p>
        <h2>What we collect</h2>
        <ul>
          <li>Account details you provide (name, email, password hash).</li>
          <li>Optional profile fields (university, bio, public coding profile links, avatar URL).</li>
          <li>Learning activity such as completed resources, bookmarks, and discussion posts you create.</li>
          <li>Technical basics needed to run the service (authentication tokens stored in your browser).</li>
        </ul>
        <h2>How we use it</h2>
        <ul>
          <li>To sign you in and protect your account.</li>
          <li>To show your dashboard, progress, and community features.</li>
          <li>To send password-reset email when you request it (if mail is configured).</li>
          <li>To show public profile pages only when you enable public visibility.</li>
        </ul>
        <h2>What we do not do</h2>
        <ul>
          <li>We do not sell your personal data.</li>
          <li>We do not run an in-app code judge that stores your solutions for ranking.</li>
          <li>Linked platform calendars (LeetCode, GitHub) are fetched only when you add those profile URLs.</li>
        </ul>
        <h2>Your choices</h2>
        <ul>
          <li>Turn off public profile visibility in Settings.</li>
          <li>Edit or clear optional profile links anytime.</li>
          <li>Contact an admin if you need your account disabled.</li>
        </ul>
        <p>
          Questions: reach your Campus Coders admin, or email the address published by your deployment.
        </p>
      </div>
    </div>
  );
}
