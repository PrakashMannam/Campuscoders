import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronRight, FiShield, FiBell } from 'react-icons/fi';
import DashboardLayout from '../components/DashboardLayout';
import Toast from '../components/Toast';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profileVisible, setProfileVisible] = useState(true);
  const [emailDigests, setEmailDigests] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [discussionMentions, setDiscussionMentions] = useState(true);

  const [savedState, setSavedState] = useState({
    profileVisible: true,
    emailDigests: true,
    discussionMentions: true,
  });

  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });
  const showToast = useCallback((type, message) => {
    setToast({ show: true, type, message });
  }, []);
  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, show: false }));
  }, []);

  useEffect(() => {
    const loadSettings = async () => {
      setSettingsLoading(true);
      try {
        const res = await api.get('/profile/me/settings');
        const data = res.data;
        const next = {
          profileVisible: data.publicProfileVisible ?? true,
          emailDigests: data.emailDigests ?? true,
          discussionMentions: data.discussionMentions ?? true,
        };
        setProfileVisible(next.profileVisible);
        setEmailDigests(next.emailDigests);
        setDiscussionMentions(next.discussionMentions);
        setSavedState(next);
      } catch {
        showToast('error', 'Failed to load settings.');
      } finally {
        setSettingsLoading(false);
      }
    };
    loadSettings();
  }, [showToast]);

  const userInitials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/profile/me/settings', {
        publicProfileVisible: profileVisible,
        emailDigests,
        pushNotifications: false,
        discussionMentions,
      });
      setSavedState({ profileVisible, emailDigests, discussionMentions });
      showToast('success', 'Settings saved.');
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setProfileVisible(savedState.profileVisible);
    setEmailDigests(savedState.emailDigests);
    setDiscussionMentions(savedState.discussionMentions);
    showToast('info', 'Changes discarded.');
  };

  return (
    <DashboardLayout>
      <div className="sett-page">
        <h2 className="sett-title">Settings</h2>
        <Toast type={toast.type} message={toast.message} show={toast.show} onClose={hideToast} />

        {settingsLoading ? (
          <p style={{ color: 'var(--ink-muted)', padding: '24px' }}>Loading settings...</p>
        ) : (
          <>
            <div className="sett-user-card">
              <div className="sett-user-avatar">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt=""
                    className="dl-avatar-img-round"
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  <span>{userInitials}</span>
                )}
              </div>
              <div className="sett-user-info">
                <h3>{user?.name || 'Student'}</h3>
                <p className="sett-user-email">{user?.email || ''}</p>
                <p className="sett-row-sub" style={{ marginTop: 8 }}>
                  Change your photo from Profile using an image URL.
                </p>
              </div>
            </div>

            <div className="sett-grid">
              <div className="sett-section">
                <h4 className="sett-section-title">
                  <FiShield size={16} /> ACCOUNT SECURITY
                </h4>
                <div className="sett-card">
                  <div
                    className="sett-row clickable"
                    onClick={() => navigate('/dashboard/change-password')}
                  >
                    <div>
                      <span className="sett-row-title">Change Password</span>
                      <span className="sett-row-sub">Update your account password</span>
                    </div>
                    <FiChevronRight size={18} className="sett-row-arrow" />
                  </div>
                  <div className="sett-divider" />
                  <div className="sett-row">
                    <div>
                      <span className="sett-row-title">Public Profile Visibility</span>
                      <span className="sett-row-sub">Allow others to view your public profile page</span>
                    </div>
                    <button
                      type="button"
                      className={`sett-toggle ${profileVisible ? 'on' : ''}`}
                      onClick={() => setProfileVisible(!profileVisible)}
                    >
                      <span className="sett-toggle-knob" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="sett-section">
                <h4 className="sett-section-title">
                  <FiBell size={16} /> PREFERENCES
                </h4>
                <div className="sett-card">
                  <div className="sett-row">
                    <div>
                      <span className="sett-row-title">Email digests</span>
                      <span className="sett-row-sub">Opt in for occasional platform email updates</span>
                    </div>
                    <button
                      type="button"
                      className={`sett-toggle ${emailDigests ? 'on' : ''}`}
                      onClick={() => setEmailDigests(!emailDigests)}
                    >
                      <span className="sett-toggle-knob" />
                    </button>
                  </div>
                  <div className="sett-divider" />
                  <div className="sett-row">
                    <div>
                      <span className="sett-row-title">Discussion reply alerts</span>
                      <span className="sett-row-sub">In-app notifications when someone replies to your threads</span>
                    </div>
                    <button
                      type="button"
                      className={`sett-toggle ${discussionMentions ? 'on' : ''}`}
                      onClick={() => setDiscussionMentions(!discussionMentions)}
                    >
                      <span className="sett-toggle-knob" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="sett-actions">
              <button type="button" className="sett-discard" onClick={handleDiscard} disabled={saving}>
                Discard Changes
              </button>
              <button type="button" className="sett-save" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save All Changes'}
              </button>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
