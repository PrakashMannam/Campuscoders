import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronRight, FiShield, FiBell } from 'react-icons/fi';
import DashboardLayout from '../components/DashboardLayout';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = React.useRef(null);
  const [profileVisible, setProfileVisible] = useState(true);
  const [notifications, setNotifications] = useState({
    emailDigests: true,
    pushNotifications: true,
    discussionMentions: true,
  });

  /* ── Track saved state ── */
  const [savedState, setSavedState] = useState({
    profileVisible: true,
    notifications: { emailDigests: true, pushNotifications: true, discussionMentions: true },
  });

  /* ── Toast ── */
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });
  const showToast = useCallback((type, message) => {
    setToast({ show: true, type, message });
  }, []);
  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, show: false }));
  }, []);

  const userInitials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const toggleNotification = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    setSavedState({ profileVisible, notifications: { ...notifications } });
    showToast('success', 'Settings saved successfully!');
  };

  const handleDiscard = () => {
    setProfileVisible(savedState.profileVisible);
    setNotifications({ ...savedState.notifications });
    showToast('info', 'Changes discarded.');
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateUser({ avatar: reader.result });
        showToast('success', 'Profile photo updated successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <DashboardLayout>
      <div className="sett-page">
        <h2 className="sett-title">Settings</h2>

        {/* ── Toast ── */}
        <Toast type={toast.type} message={toast.message} show={toast.show} onClose={hideToast} />

        {/* ── User Card ── */}
        <div className="sett-user-card">
          <div className="sett-user-avatar" onClick={() => fileInputRef.current.click()} style={{ cursor: 'pointer' }}>
            {user?.avatar ? (
              <img src={user.avatar} alt="Profile" className="dl-avatar-img-round" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <span>{userInitials}</span>
            )}
            <div className="sett-avatar-edit">📷</div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            accept="image/*"
            style={{ display: 'none' }}
          />
          <div className="sett-user-info">
            <h3>{user?.name || 'Alex Chen'}</h3>
            <p>Senior Engineering Student</p>
            <p className="sett-user-email">{user?.email || 'alex.chen@campuscoders.edu'}</p>
            <div className="sett-user-badges">
            </div>
          </div>
        </div>

        {/* ── Security + Notifications ── */}
        <div className="sett-grid">
          {/* Account Security */}
          <div className="sett-section">
            <h4 className="sett-section-title">
              <FiShield size={16} /> ACCOUNT SECURITY
            </h4>
            <div className="sett-card">
              <div
                className="sett-row clickable"
                id="change-password-btn"
                onClick={() => navigate('/dashboard/change-password')}
              >
                <div>
                  <span className="sett-row-title">Change Password</span>
                  <span className="sett-row-sub">Last updated 3 months ago</span>
                </div>
                <FiChevronRight size={18} className="sett-row-arrow" />
              </div>
              <div className="sett-divider" />
              <div className="sett-row">
                <div>
                  <span className="sett-row-title">Public Profile Visibility</span>
                  <span className="sett-row-sub">Control who can see your activity</span>
                </div>
                <button
                  className={`sett-toggle ${profileVisible ? 'on' : ''}`}
                  id="profile-visibility-toggle"
                  onClick={() => setProfileVisible(!profileVisible)}
                >
                  <span className="sett-toggle-knob" />
                </button>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="sett-section">
            <h4 className="sett-section-title">
              <FiBell size={16} /> NOTIFICATIONS
            </h4>
            <div className="sett-card">
              {[
                { key: 'emailDigests', title: 'Email Digests', sub: 'Weekly summary of top discussions' },
                { key: 'pushNotifications', title: 'Push Notifications', sub: 'Real-time alerts for code reviews' },
                { key: 'discussionMentions', title: 'Discussion Mentions', sub: 'Notify when someone @mentions you' },
              ].map((item, idx) => (
                <React.Fragment key={item.key}>
                  {idx > 0 && <div className="sett-divider" />}
                  <div className="sett-row">
                    <div>
                      <span className="sett-row-title">{item.title}</span>
                      <span className="sett-row-sub">{item.sub}</span>
                    </div>
                    <label className="sett-checkbox-wrap">
                      <input
                        type="checkbox"
                        checked={notifications[item.key]}
                        onChange={() => toggleNotification(item.key)}
                      />
                      <span className="sett-checkbox" />
                    </label>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* ── Footer Actions ── */}
        <div className="sett-actions">
          <button className="sett-discard" id="discard-changes-btn" onClick={handleDiscard}>Discard Changes</button>
          <button className="sett-save" id="save-changes-btn" onClick={handleSave}>Save All Changes</button>
        </div>
      </div>
    </DashboardLayout>
  );
}
