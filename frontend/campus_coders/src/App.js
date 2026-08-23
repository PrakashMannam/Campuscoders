import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import './dark-theme.css';
import { AuthProvider } from './context/AuthContext';
import { ProgressProvider } from './context/ProgressContext';
import { ThemeProvider, ThemeRouteSync } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Dashboard from './pages/Dashboard';
import Resources from './pages/Resources';
import AllLearningPaths from './pages/AllLearningPaths';
import LearningPathDetail from './pages/LearningPathDetail';
import TopicDetail from './pages/TopicDetail';
import Discussions from './pages/Discussions';
import Announcements from './pages/Announcements';
import Profile from './pages/Profile';
import PublicProfile from './pages/PublicProfile';
import Settings from './pages/Settings';
import ChangePassword from './pages/ChangePassword';
import Notifications from './pages/Notifications';
import Practice from './pages/Practice';
import Events from './pages/Events';
import MyLearning from './pages/MyLearning';
import Placement from './pages/Placement';
import PageTransition from './components/PageTransition';
import { AnimatePresence } from 'framer-motion';
import AdminRoutes from './pages/admin/AdminRoutes';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProgressProvider>
          <Router>
            <AppContent />
          </Router>
        </ProgressProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

function AppContent() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <ThemeRouteSync />
      {!isDashboard && <Navbar />}
      <main style={{ flex: '1 0 auto' }}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><Home /></PageTransition>} />
            <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
            <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
            <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
            <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
            <Route path="/verify-email" element={<PageTransition><VerifyEmail /></PageTransition>} />
            <Route path="/privacy" element={<PageTransition><Privacy /></PageTransition>} />
            <Route path="/terms" element={<PageTransition><Terms /></PageTransition>} />

            {/* Protected Student Dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requiredRole="student">
                  <PageTransition><Dashboard /></PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/practice"
              element={
                <ProtectedRoute requiredRole="student">
                  <PageTransition><Practice /></PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/events"
              element={
                <ProtectedRoute requiredRole="student">
                  <PageTransition><Events /></PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/my-learning"
              element={
                <ProtectedRoute requiredRole="student">
                  <PageTransition><MyLearning /></PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/placement"
              element={
                <ProtectedRoute requiredRole="student">
                  <PageTransition><Placement /></PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/profile/:userId"
              element={
                <ProtectedRoute requiredRole="student">
                  <PageTransition><PublicProfile /></PageTransition>
                </ProtectedRoute>
              }
            />
            {/* Resources Hub */}
            <Route
              path="/dashboard/resources"
              element={
                <ProtectedRoute requiredRole="student">
                  <PageTransition><Resources /></PageTransition>
                </ProtectedRoute>
              }
            />
            {/* All Learning Paths */}
            <Route
              path="/dashboard/resources/paths"
              element={
                <ProtectedRoute requiredRole="student">
                  <PageTransition><AllLearningPaths /></PageTransition>
                </ProtectedRoute>
              }
            />
            {/* Learning Path Detail */}
            <Route
              path="/dashboard/resources/paths/:pathId"
              element={
                <ProtectedRoute requiredRole="student">
                  <PageTransition><LearningPathDetail /></PageTransition>
                </ProtectedRoute>
              }
            />
            {/* Topic Detail */}
            <Route
              path="/dashboard/resources/topics/:topicId"
              element={
                <ProtectedRoute requiredRole="student">
                  <PageTransition><TopicDetail /></PageTransition>
                </ProtectedRoute>
              }
            />
            {/* Legacy course URLs → real catalog */}
            <Route
              path="/dashboard/resources/:courseId"
              element={<Navigate to="/dashboard/resources/paths" replace />}
            />

            <Route
              path="/dashboard/discussions"
              element={
                <ProtectedRoute requiredRole="student">
                  <PageTransition><Discussions /></PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/discussions/:postId"
              element={
                <ProtectedRoute requiredRole="student">
                  <PageTransition><Discussions /></PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/announcements"
              element={
                <ProtectedRoute requiredRole="student">
                  <PageTransition><Announcements /></PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/profile"
              element={
                <ProtectedRoute requiredRole="student">
                  <PageTransition><Profile /></PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/settings"
              element={
                <ProtectedRoute requiredRole="student">
                  <PageTransition><Settings /></PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/change-password"
              element={
                <ProtectedRoute requiredRole="student">
                  <PageTransition><ChangePassword /></PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/notifications"
              element={
                <ProtectedRoute requiredRole="student">
                  <PageTransition><Notifications /></PageTransition>
                </ProtectedRoute>
              }
            />

            {/* Protected Admin Routes */}
            <Route path="/admin/*" element={
              <ProtectedRoute requiredRole="admin">
                <AdminRoutes />
              </ProtectedRoute>
            } />

            {/* Fallback routing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </main>
      {!isDashboard && <Footer />}
    </div>
  );
}

export default App;
