import React, { useState, useEffect, useCallback } from "react";
import { FiEdit2, FiSave } from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";
import Toast from "../components/Toast";
import api from "../api/client";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [university, setUniversity] = useState("");

  /* ── Toast ── */
  const [toast, setToast] = useState({ show: false, type: "success", message: "" });
  const showToast = useCallback((type, message) => {
    setToast({ show: true, type, message });
  }, []);
  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, show: false }));
  }, []);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/profile/me');
      const data = res.data;
      setProfile(data);
      setFullName(data.fullName || "");
      setBio(data.bio || "");
      setUniversity(data.university || "");
    } catch (err) {
      showToast('error', 'Failed to load user profile.');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/profile/me', {
        fullName,
        bio,
        university,
      });
      setProfile(res.data);
      setEditing(false);
      showToast('success', 'Profile updated successfully!');
    } catch (err) {
      showToast('error', 'Failed to update profile.');
    }
  };

  return (
    <DashboardLayout>
      <div style={{ padding: "32px", maxWidth: "800px" }}>
        {/* ── Toast ── */}
        <Toast
          type={toast.type}
          message={toast.message}
          show={toast.show}
          onClose={hideToast}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h2 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#111827", margin: "0 0 6px" }}>
              My Engineer Profile
            </h2>
            <p style={{ fontSize: "0.9rem", color: "#6B7280", margin: 0 }}>
              Manage your personal information, bio, and campus affiliation.
            </p>
          </div>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="btn btn-primary"
              style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <FiEdit2 size={16} /> Edit Profile
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="btn btn-primary"
              style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px', background: '#10b981' }}
            >
              <FiSave size={16} /> Save Changes
            </button>
          )}
        </div>

        {loading ? (
          <p style={{ color: '#64748b' }}>Loading profile...</p>
        ) : (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#4b5563', marginBottom: '6px' }}>Full Name</label>
                {editing ? (
                  <input
                    type="text"
                    className="form-input"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                ) : (
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827' }}>{profile?.fullName}</div>
                )}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#4b5563', marginBottom: '6px' }}>Email Address</label>
                <div style={{ fontSize: '1rem', color: '#6b7280' }}>{profile?.email}</div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#4b5563', marginBottom: '6px' }}>University / Campus</label>
                {editing ? (
                  <input
                    type="text"
                    className="form-input"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                  />
                ) : (
                  <div style={{ fontSize: '1rem', color: '#111827' }}>{profile?.university || 'Campus Coders University'}</div>
                )}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#4b5563', marginBottom: '6px' }}>Bio</label>
                {editing ? (
                  <textarea
                    className="form-input"
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                ) : (
                  <div style={{ fontSize: '0.95rem', color: '#374151', lineHeight: '1.6' }}>{profile?.bio || 'No bio provided yet.'}</div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>TOTAL XP</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>{profile?.totalXp || 0} XP</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>DAILY STREAK</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#d4af37', marginTop: '4px' }}>🔥 {profile?.dailyStreak || 0} Days</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>PROBLEMS SOLVED</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#6366f1', marginTop: '4px' }}>{profile?.problemsSolved || 0}</div>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
