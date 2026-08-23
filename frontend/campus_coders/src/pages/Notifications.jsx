import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheck, FiCheckCircle, FiBell } from 'react-icons/fi';
import DashboardLayout from '../components/DashboardLayout';
import Toast from '../components/Toast';
import api from '../api/client';

function notifyUnreadChanged() {
  window.dispatchEvent(new Event('campuscoders:notifications-changed'));
}

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });
  const showToast = useCallback((type, message) => {
    setToast({ show: true, type, message });
  }, []);
  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, show: false }));
  }, []);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications', {
        params: { page: currentPage, size: 10 },
      });
      const pageData = res.data;
      setNotifications(pageData.content || []);
      setTotalPages(pageData.totalPages || 1);
      setHasNext(pageData.hasNext || false);
      setHasPrevious(pageData.hasPrevious || false);
    } catch {
      showToast('error', 'Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, showToast]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      showToast('success', 'All notifications marked as read.');
      await fetchNotifications();
      notifyUnreadChanged();
    } catch {
      showToast('error', 'Failed to mark notifications as read.');
    }
  };

  const handleMarkOneRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, readStatus: true } : n))
      );
      notifyUnreadChanged();
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.readStatus).length;

  return (
    <DashboardLayout>
      <div className="nt-page">
        <Toast
          type={toast.type}
          message={toast.message}
          show={toast.show}
          onClose={hideToast}
        />

        <div className="nt-header">
          <div>
            <h2 className="nt-title">Notifications Hub</h2>
            <p className="nt-subtitle">
              Replies, challenges, and announcements from the platform.
            </p>
          </div>
          {unreadCount > 0 && (
            <button type="button" className="nt-mark-all" onClick={handleMarkAllRead}>
              <FiCheck size={14} /> Mark all as read
            </button>
          )}
        </div>

        <div className="nt-list">
          {loading ? (
            <p className="nt-muted">Loading notifications...</p>
          ) : notifications.length === 0 ? (
            <div className="nt-empty">
              <FiCheckCircle size={42} className="nt-empty-icon" />
              <h3>You&apos;re all caught up!</h3>
              <p>No new notifications found in your inbox.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <button
                type="button"
                key={n.id}
                className={`nt-item ${n.readStatus ? 'is-read' : 'is-unread'}`}
                onClick={async () => {
                  if (!n.readStatus) await handleMarkOneRead(n.id);
                  if (n.targetUrl) navigate(n.targetUrl);
                }}
              >
                <div className="nt-item-icon" aria-hidden>
                  <FiBell size={18} />
                </div>
                <div className="nt-item-body">
                  <div className="nt-item-title-row">
                    <h4>{n.title}</h4>
                    {!n.readStatus && <span className="nt-unread-dot" />}
                  </div>
                  <p>{n.message}</p>
                  <span className="nt-time">
                    {n.createdAt ? new Date(n.createdAt).toLocaleString() : 'Recent'}
                  </span>
                </div>
              </button>
            ))
          )}

          {totalPages > 1 && (
            <div className="nt-pagination">
              <button
                type="button"
                className="nt-page-btn"
                disabled={!hasPrevious}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Previous
              </button>
              <span className="nt-muted">
                Page {currentPage + 1} of {totalPages}
              </span>
              <button
                type="button"
                className="nt-page-btn"
                disabled={!hasNext}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
