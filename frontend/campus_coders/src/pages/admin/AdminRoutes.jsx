import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import AdminDashboardHome from './AdminDashboardHome';
import AdminManageResources from './AdminManageResources';
import AdminCreateResource from './AdminCreateResource';
import AdminManageLearningPaths from './AdminManageLearningPaths';
import AdminManageTopics from './AdminManageTopics';
import AdminManageAnnouncements from './AdminManageAnnouncements';
import AdminManageChallenges from './AdminManageChallenges';
import AdminManageUsers from './AdminManageUsers';
import AdminManageCommunity from './AdminManageCommunity';
import AdminManageLeaderboard from './AdminManageLeaderboard';
import AdminReports from './AdminReports';
import AdminSettings from './AdminSettings';

export default function AdminRoutes() {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<AdminDashboardHome />} />
        <Route path="/resources" element={<AdminManageResources />} />
        <Route path="/resources/create" element={<AdminCreateResource />} />
        <Route path="/learning-paths" element={<AdminManageLearningPaths />} />
        <Route path="/topics" element={<AdminManageTopics />} />
        <Route path="/announcements" element={<AdminManageAnnouncements />} />
        <Route path="/challenges" element={<AdminManageChallenges />} />
        <Route path="/users" element={<AdminManageUsers />} />
        <Route path="/community" element={<AdminManageCommunity />} />
        <Route path="/leaderboard" element={<AdminManageLeaderboard />} />
        <Route path="/reports" element={<AdminReports />} />
        <Route path="/settings" element={<AdminSettings />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  );
}
