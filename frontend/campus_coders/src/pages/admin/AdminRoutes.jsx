import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import AdminDashboardHome from './AdminDashboardHome';
import AdminManageResources from './AdminManageResources';
import AdminCreateResource from './AdminCreateResource';

export default function AdminRoutes() {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<AdminDashboardHome />} />
        <Route path="/resources" element={<AdminManageResources />} />
        <Route path="/resources/create" element={<AdminCreateResource />} />
        {/* Placeholder routes for future pages */}
        <Route path="/learning-paths" element={<PlaceholderPage title="Learning Paths" />} />
        <Route path="/topics" element={<PlaceholderPage title="Topics" />} />
        <Route path="/announcements" element={<PlaceholderPage title="Announcements" />} />
        <Route path="/challenges" element={<PlaceholderPage title="Daily Challenges" />} />
        <Route path="/users" element={<PlaceholderPage title="Users" />} />
        <Route path="/community" element={<PlaceholderPage title="Community" />} />
        <Route path="/leaderboard" element={<PlaceholderPage title="Leaderboard" />} />
        <Route path="/reports" element={<PlaceholderPage title="Reports" />} />
        <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  );
}

function PlaceholderPage({ title }) {
  return (
    <div style={{ padding: '0' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#111827', margin: '0 0 8px' }}>{title}</h1>
      <p style={{ color: '#64748b', margin: 0 }}>This page is coming soon. The admin module for {title} is under development.</p>
      <div style={{
        marginTop: '40px', padding: '60px', textAlign: 'center',
        background: '#ffffff', border: '2px dashed #e2e8f0', borderRadius: '16px'
      }}>
        <span style={{ fontSize: '3rem' }}>🚧</span>
        <p style={{ color: '#94a3b8', marginTop: '16px', fontSize: '1rem', fontWeight: 600 }}>Under Construction</p>
      </div>
    </div>
  );
}
