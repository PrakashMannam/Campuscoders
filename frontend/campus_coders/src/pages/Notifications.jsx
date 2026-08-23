import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheck, FiCheckCircle, FiBell } from 'react-icons/fi';
import DashboardLayout from '../components/DashboardLayout';
import Toast from '../components/Toast';
import api from '../api/client';

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  /* ── Toast ── */
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });
  const showToast = useCallback((type, message) => {
    setToast({ show: true, type, message });
  }, []);
  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, show: false }));
  }, []);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications', {
        params: { page: currentPage, size: 10 }
      });
      const pageData = res.data;
      setNotifications(pageData.content || []);
      setTotalPages(pageData.totalPages || 1);
      setHasNext(pageData.hasNext || false);
      setHasPrevious(pageData.hasPrevious || false);
    } catch (err) {
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
      fetchNotifications();
    } catch (err) {
      showToast('error', 'Failed to mark notifications as read.');
    }
  };

  const handleMarkOneRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.readStatus).length;

  return (
    <DashboardLayout>
      <div className="nt-page" style={{ padding: '32px', maxWidth: '850px' }}>
        {/* ── Toast ── */}
        <Toast
          type={toast.type}
          message={toast.message}
          show={toast.show}
          onClose={hideToast}
        />

        <div className="nt-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
          <div>
            <h2 className="nt-title" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#111827', margin: '0 0 6px' }}>
              Notifications Hub
            </h2>
            <p className="nt-subtitle" style={{ fontSize: '0.9rem', color: '#6B7280', margin: 0 }}>
              Replies, challenges, and announcements from the platform.
            </p>
          </div>
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllRead} 
              style={{
                background: '#FFFFFF',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: '#374151',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <FiCheck size={14} /> Mark all as read
            </button>
          )}
        </div>

        <div className="nt-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {loading ? (
            <p style={{ color: '#64748b' }}>Loading notifications...</p>
          ) : notifications.length === 0 ? (
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              padding: '40px',
              textAlign: 'center',
            }}>
              <FiCheckCircle size={42} style={{ color: '#059669', marginBottom: '12px' }} />
              <h3 style={{ margin: '0 0 4px', fontSize: '1.05rem', fontWeight: 700, color: '#111827' }}>You're all caught up!</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#6B7280' }}>No new notifications found in your inbox.</p>
            </div>
          ) : (
            notifications.map(n => (
              <div 
                key={n.id} 
                className="nt-item"
                onClick={async () => {
                  if (!n.readStatus) await handleMarkOneRead(n.id);
                  if (n.targetUrl) navigate(n.targetUrl);
                }}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #F0F4F8',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  borderLeft: !n.readStatus ? '4px solid #D4AF37' : '1px solid #E5E7EB',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#FFFBE6',
                    color: '#D4AF37',
                    flexShrink: 0
                  }}>
                    <FiBell size={18} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h4 style={{ margin: '0 0 2px', fontSize: '0.92rem', fontWeight: 800, color: '#111827' }}>
                        {n.title}
                      </h4>
                      {!n.readStatus && (
                        <span style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: '#D4AF37'
                        }} />
                      )}
                    </div>
                    <p style={{ margin: '0 0 4px', fontSize: '0.85rem', color: '#4B5563', lineHeight: '1.5' }}>
                      {n.message}
                    </p>
                    <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                      {n.createdAt ? new Date(n.createdAt).toLocaleTimeString() : 'Recent'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '24px' }}>
            <button
              disabled={!hasPrevious}
              onClick={() => setCurrentPage(p => p - 1)}
              style={{
                padding: '8px 14px', borderRadius: '8px', border: '1px solid #D1D5DB',
                background: !hasPrevious ? '#f8fafc' : '#fff',
                cursor: !hasPrevious ? 'not-allowed' : 'pointer',
                color: !hasPrevious ? '#cbd5e1' : '#374151', fontSize: '0.85rem', fontWeight: 600
              }}
            >
              Previous
            </button>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              disabled={!hasNext}
              onClick={() => setCurrentPage(p => p + 1)}
              style={{
                padding: '8px 14px', borderRadius: '8px', border: '1px solid #D1D5DB',
                background: !hasNext ? '#f8fafc' : '#fff',
                cursor: !hasNext ? 'not-allowed' : 'pointer',
                color: !hasNext ? '#cbd5e1' : '#374151', fontSize: '0.85rem', fontWeight: 600
              }}
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
