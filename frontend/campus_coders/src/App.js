import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import { ProgressProvider } from './context/ProgressContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Resources from './pages/Resources';
import AllLearningPaths from './pages/AllLearningPaths';
import LearningPathDetail from './pages/LearningPathDetail';
import TopicDetail from './pages/TopicDetail';
import CourseResources from './pages/CourseResources';
import Discussions from './pages/Discussions';
import Announcements from './pages/Announcements';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import ChangePassword from './pages/ChangePassword';
import Leaderboard from './pages/Leaderboard';
import Notifications from './pages/Notifications';

/* Hide main Navbar + Footer when inside the student dashboard (it has its own sidebar) */
function LayoutWrapper({ children }) {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!isDashboard && <Navbar />}
      <main style={{ flex: '1 0 auto' }}>{children}</main>
      {!isDashboard && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ProgressProvider>
        <Router>
        <LayoutWrapper>
          <Routes>
            {/* Public Pages */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected Student Dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requiredRole="student">
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            {/* Resources Hub */}
            <Route
              path="/dashboard/resources"
              element={
                <ProtectedRoute requiredRole="student">
                  <Resources />
                </ProtectedRoute>
              }
            />
            {/* All Learning Paths */}
            <Route
              path="/dashboard/resources/paths"
              element={
                <ProtectedRoute requiredRole="student">
                  <AllLearningPaths />
                </ProtectedRoute>
              }
            />
            {/* Learning Path Detail */}
            <Route
              path="/dashboard/resources/paths/:pathId"
              element={
                <ProtectedRoute requiredRole="student">
                  <LearningPathDetail />
                </ProtectedRoute>
              }
            />
            {/* Topic Detail */}
            <Route
              path="/dashboard/resources/topics/:topicId"
              element={
                <ProtectedRoute requiredRole="student">
                  <TopicDetail />
                </ProtectedRoute>
              }
            />
            {/* Legacy Course Resources fallback */}
            <Route
              path="/dashboard/resources/:courseId"
              element={
                <ProtectedRoute requiredRole="student">
                  <CourseResources />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/discussions"
              element={
                <ProtectedRoute requiredRole="student">
                  <Discussions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/announcements"
              element={
                <ProtectedRoute requiredRole="student">
                  <Announcements />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/profile"
              element={
                <ProtectedRoute requiredRole="student">
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/settings"
              element={
                <ProtectedRoute requiredRole="student">
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/change-password"
              element={
                <ProtectedRoute requiredRole="student">
                  <ChangePassword />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/leaderboard"
              element={
                <ProtectedRoute requiredRole="student">
                  <Leaderboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/notifications"
              element={
                <ProtectedRoute requiredRole="student">
                  <Notifications />
                </ProtectedRoute>
              }
            />

            {/* Protected Admin Dashboard */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Fallback routing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </LayoutWrapper>
      </Router>
      </ProgressProvider>
    </AuthProvider>
  );
}

export default App;
