import React, { useState, useCallback } from 'react';
import { FiBell, FiCheck, FiInfo, FiAward, FiStar, FiCalendar, FiMessageSquare, FiX, FiCheckCircle } from 'react-icons/fi';
import DashboardLayout from '../components/DashboardLayout';
import Toast from '../components/Toast';

const initialNotifications = [
  {
    id: 1,
    type: 'EVENT',
    icon: <FiStar size={16} />,
    iconBg: '#ECFDF5',
    iconColor: '#059669',
    title: 'Winter Hackathon Open',
    desc: 'Registration is now live for the Annual Campus Coders Hackathon. Win up to $10,000!',
    time: '2 hours ago',
    unread: true,
  },
  {
    id: 2,
    type: 'ACHIEVEMENT',
    icon: <FiAward size={16} />,
    iconBg: '#FFFBE6',
    iconColor: '#D4AF37',
    title: 'XP Awarded: Daily Check-in',
    desc: 'Congratulations! You checked in today and earned +1 XP to your score.',
    time: '5 hours ago',
    unread: true,
  },
  {
    id: 3,
    type: 'CURRICULUM',
    icon: <FiCalendar size={16} />,
    iconBg: '#EEF5FF',
    iconColor: '#1E6BFA',
    title: 'New Course Resources Available',
    desc: 'New reference manuals and PDF guides have been added to the DSA Intensive track.',
    time: '1 day ago',
    unread: false,
  },
  {
    id: 4,
    type: 'COMMUNITY',
    icon: <FiMessageSquare size={16} />,
    iconBg: '#FCE8E6',
    iconColor: '#EA4335',
    title: 'New Reply in Discussions',
    desc: 'A student replied to your thread "FastAPI vs Flask for telemetry dashboards".',
    time: '2 days ago',
    unread: false,
  },
];

export default function Notifications() {
  const [notifications, setNotifications] = useState(initialNotifications);

  /* ── Toast ── */
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });
  const showToast = useCallback((type, message) => {
    setToast({ show: true, type, message });
  }, []);
  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, show: false }));
  }, []);

  const handleMarkAllRead = () => {
    const updated = notifications.map(n => ({ ...n, unread: false }));
    setNotifications(updated);
    showToast('success', 'All notifications marked as read.');
  };

  const handleClearNotification = (id) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    showToast('info', 'Notification dismissed.');
  };

  const handleMarkOneRead = (id) => {
    const updated = notifications.map(n => n.id === id ? { ...n, unread: false } : n);
    setNotifications(updated);
  };

  const unreadCount = notifications.filter(n => n.unread).length;

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
            <h2 className="nt-title" style={{ fontFamily: 'var(--font-title)', fontSize: '1.8rem', fontWeight: 800, color: '#111827', margin: '0 0 6px' }}>
              Notifications Hub
            </h2>
            <p className="nt-subtitle" style={{ fontSize: '0.9rem', color: '#6B7280', margin: 0 }}>
              Stay updated with course releases, daily check-ins, mentions, and community announcements.
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
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                transition: 'all 0.15s ease'
              }}
            >
              <FiCheck size={14} /> Mark all as read
            </button>
          )}
        </div>

        <div className="nt-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {notifications.length === 0 ? (
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              padding: '40px',
              textAlign: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
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
                onClick={() => handleMarkOneRead(n.id)}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #F0F4F8',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  boxShadow: n.unread ? '0 3px 10px rgba(212,175,55,0.04)' : '0 1px 3px rgba(0,0,0,0.02)',
                  borderLeft: n.unread ? '4px solid #D4AF37' : '1px solid #E5E7EB',
                  transition: 'all 0.2s ease',
                  cursor: n.unread ? 'pointer' : 'default',
                  position: 'relative'
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
                    background: n.iconBg,
                    color: n.iconColor,
                    flexShrink: 0
                  }}>
                    {n.icon}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h4 style={{ margin: '0 0 2px', fontSize: '0.92rem', fontWeight: 800, color: '#111827' }}>
                        {n.title}
                      </h4>
                      {n.unread && (
                        <span style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: '#D4AF37'
                        }} />
                      )}
                    </div>
                    <p style={{ margin: '0 0 4px', fontSize: '0.85rem', color: '#4B5563', lineHeight: '1.5' }}>
                      {n.desc}
                    </p>
                    <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{n.time}</span>
                  </div>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearNotification(n.id);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#9CA3AF',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '4px',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#ef4444'}
                  onMouseLeave={(e) => e.target.style.color = '#9CA3AF'}
                >
                  <FiX size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
