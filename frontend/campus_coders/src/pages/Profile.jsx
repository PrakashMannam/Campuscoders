import React, { useState, useEffect, useCallback } from "react";
import {
  FiEdit2, FiSave, FiExternalLink, FiGithub,
  FiAward, FiBookOpen, FiTrendingUp, FiTarget,
  FiCode, FiCheckCircle, FiStar, FiGlobe
} from "react-icons/fi";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import DashboardLayout from "../components/DashboardLayout";
import Toast from "../components/Toast";
import api from "../api/client";

const CHART_COLORS = ['#10b981', '#d97706', '#e2e8f0'];

// Mock data for features where backend APIs are not yet ready
const mockActivities = [
  { id: 1, icon: '💻', text: "Solved 'Two Sum' on LeetCode", time: '2 hours ago', color: '#10b981' },
  { id: 2, icon: '🏅', text: "Earned 'Consistency Master' badge", time: '1 day ago', color: '#d97706' },
  { id: 3, icon: '📚', text: "Completed 'Java OOP' topic", time: '2 days ago', color: '#6366f1' },
  { id: 4, icon: '🔥', text: "Reached 15-day streak!", time: '3 days ago', color: '#ef4444' },
  { id: 5, icon: '📝', text: "Bookmarked 'Spring Security with JWT'", time: '4 days ago', color: '#0ea5e9' },
];

const mockMilestones = [
  { id: 1, title: 'Complete 50 Problems', current: 32, target: 50, color: '#10b981' },
  { id: 2, title: 'Finish Java Path', current: 7, target: 12, color: '#d97706' },
  { id: 3, title: '30-Day Streak', current: 15, target: 30, color: '#6366f1' },
];

function MilestoneCircle({ milestone }) {
  const pct = Math.round((milestone.current / milestone.target) * 100);
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference - (pct / 100) * circumference;

  return (
    <div style={{ textAlign: 'center', flex: '1' }}>
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="6" />
        <circle cx="40" cy="40" r={radius} fill="none" stroke={milestone.color} strokeWidth="6"
          strokeDasharray={circumference} strokeDashoffset={dashoffset}
          strokeLinecap="round" transform="rotate(-90 40 40)"
          style={{ transition: 'stroke-dashoffset 1s ease' }} />
        <text x="40" y="44" textAnchor="middle" fontSize="14" fontWeight="800" fill="#111827">{pct}%</text>
      </svg>
      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#111827', marginTop: '4px' }}>{milestone.title}</div>
      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{milestone.current}/{milestone.target}</div>
    </div>
  );
}

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [university, setUniversity] = useState("");

  const [leetcodeUrl, setLeetcodeUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [gfgUrl, setGfgUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");

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
      setLeetcodeUrl(data.leetcodeUrl || "");
      setGithubUrl(data.githubUrl || "");
      setGfgUrl(data.gfgUrl || "");
      setLinkedinUrl(data.linkedinUrl || "");
      setPortfolioUrl(data.portfolioUrl || "");
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
        fullName, bio, university,
        leetcodeUrl, githubUrl, gfgUrl, linkedinUrl, portfolioUrl,
      });
      setProfile(res.data);
      setEditing(false);
      showToast('success', 'Profile updated successfully!');
    } catch (err) {
      showToast('error', 'Failed to update profile.');
    }
  };

  // Learning progress donut chart data
  const chartData = [
    { name: 'Completed Topics', value: profile?.completedTopics || 8 },
    { name: 'In Progress', value: profile?.inProgressTopics || 4 },
    { name: 'Not Started', value: profile?.notStartedTopics || 12 },
  ];

  const codingProfiles = [
    { name: 'LeetCode', icon: <FiCode size={18} />, url: leetcodeUrl, setter: setLeetcodeUrl, color: '#d97706', bg: '#FEF3C7' },
    { name: 'GitHub', icon: <FiGithub size={18} />, url: githubUrl, setter: setGithubUrl, color: '#111827', bg: '#F3F4F6' },
    { name: 'GeeksforGeeks', icon: <FiBookOpen size={18} />, url: gfgUrl, setter: setGfgUrl, color: '#059669', bg: '#ECFDF5' },
    { name: 'LinkedIn', icon: <FiExternalLink size={18} />, url: linkedinUrl, setter: setLinkedinUrl, color: '#0077B5', bg: '#EFF6FF' },
    { name: 'Portfolio', icon: <FiGlobe size={18} />, url: portfolioUrl, setter: setPortfolioUrl, color: '#8b5cf6', bg: '#F5F3FF' },
  ];

  return (
    <DashboardLayout>
      <div style={{ padding: "32px", maxWidth: "1200px" }}>
        <Toast type={toast.type} message={toast.message} show={toast.show} onClose={hideToast} />

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h2 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#111827", margin: "0 0 6px" }}>
              My Engineer Profile
            </h2>
            <p style={{ fontSize: "0.9rem", color: "#6B7280", margin: 0 }}>
              Track your learning journey, achievements, and coding profiles.
            </p>
          </div>
          {!editing ? (
            <button onClick={() => setEditing(true)} className="btn btn-primary"
              style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FiEdit2 size={16} /> Edit Profile
            </button>
          ) : (
            <button onClick={handleSave} className="btn btn-primary"
              style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px', background: '#10b981' }}>
              <FiSave size={16} /> Save Changes
            </button>
          )}
        </div>

        {loading ? (
          <p style={{ color: '#64748b' }}>Loading profile...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '28px' }}>
            {/* ── LEFT COLUMN ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Profile Info Card */}
              <div style={{
                background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px',
                padding: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
              }}>
                <form onSubmit={handleSave}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#4b5563', marginBottom: '6px' }}>Full Name</label>
                      {editing ? (
                        <input type="text" className="form-input" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                      ) : (
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827' }}>{profile?.fullName}</div>
                      )}
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#4b5563', marginBottom: '6px' }}>Email Address</label>
                      <div style={{ fontSize: '1rem', color: '#6b7280' }}>{profile?.email}</div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#4b5563', marginBottom: '6px' }}>University / Campus</label>
                      {editing ? (
                        <input type="text" className="form-input" value={university} onChange={(e) => setUniversity(e.target.value)} />
                      ) : (
                        <div style={{ fontSize: '1rem', color: '#111827' }}>{profile?.university || 'Campus Coders University'}</div>
                      )}
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#4b5563', marginBottom: '6px' }}>Role</label>
                      <div style={{ fontSize: '1rem', color: '#111827' }}>Student</div>
                    </div>
                  </div>
                  <div style={{ marginTop: '20px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#4b5563', marginBottom: '6px' }}>Bio</label>
                    {editing ? (
                      <textarea className="form-input" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
                    ) : (
                      <div style={{ fontSize: '0.95rem', color: '#374151', lineHeight: '1.6' }}>{profile?.bio || 'No bio provided yet.'}</div>
                    )}
                  </div>
                </form>
              </div>

              {/* Learning Progress Chart */}
              <div style={{
                background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px',
                padding: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
              }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FiTrendingUp size={18} color="#d97706" /> Learning Progress
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                  <div style={{ width: '180px', height: '180px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                          paddingAngle={3} dataKey="value" strokeWidth={0}>
                          {chartData.map((entry, idx) => (
                            <Cell key={`cell-${idx}`} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {chartData.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: CHART_COLORS[idx] }}></div>
                        <span style={{ fontSize: '0.88rem', color: '#4b5563', fontWeight: 600 }}>{item.name}</span>
                        <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#111827' }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Achievement Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {[
                  { label: 'Resources Completed', value: profile?.problemsSolved || 24, icon: <FiCheckCircle size={22} />, color: '#10b981', bg: '#ECFDF5' },
                  { label: 'Certificates Earned', value: profile?.certificates || 3, icon: <FiAward size={22} />, color: '#d97706', bg: '#FEF3C7' },
                  { label: 'Badges Earned', value: profile?.badges || 7, icon: <FiStar size={22} />, color: '#6366f1', bg: '#EEF2FF' },
                ].map((card, idx) => (
                  <div key={idx} style={{
                    background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px',
                    padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', textAlign: 'center',
                    transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)'; }}>
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '12px', background: card.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: card.color, margin: '0 auto 12px'
                    }}>{card.icon}</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>{card.value}</div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginTop: '4px' }}>{card.label}</div>
                  </div>
                ))}
              </div>

              {/* Recent Activity Feed */}
              <div style={{
                background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px',
                padding: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
              }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', margin: '0 0 20px' }}>
                  📋 Recent Activity
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                  {mockActivities.map((activity, idx) => (
                    <div key={activity.id} style={{
                      display: 'flex', alignItems: 'flex-start', gap: '16px',
                      padding: '14px 0',
                      borderBottom: idx < mockActivities.length - 1 ? '1px solid #f1f5f9' : 'none'
                    }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '10px',
                        background: `${activity.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1rem', flexShrink: 0, position: 'relative'
                      }}>
                        {activity.icon}
                        {/* Timeline line */}
                        {idx < mockActivities.length - 1 && (
                          <div style={{
                            position: 'absolute', top: '40px', left: '50%', transform: 'translateX(-50%)',
                            width: '2px', height: '24px', background: '#f1f5f9'
                          }}></div>
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#111827' }}>{activity.text}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>{activity.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── RIGHT COLUMN ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Stats Summary */}
              <div style={{
                background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px',
                padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>TOTAL XP</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>{profile?.totalXp || 0} XP</div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>DAILY STREAK</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#d4af37', marginTop: '4px' }}>🔥 {profile?.dailyStreak || 0} Days</div>
                  </div>
                </div>
              </div>

              {/* Coding Profiles Manager */}
              <div style={{
                background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px',
                padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
              }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#111827', margin: '0 0 20px' }}>
                  🔗 Coding Profiles
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {codingProfiles.map((cp, idx) => (
                    <div key={idx} style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '12px', borderRadius: '10px', border: '1px solid #f1f5f9',
                      transition: 'border-color 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#d1d5db'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#f1f5f9'}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '10px', background: cp.bg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: cp.color, flexShrink: 0
                      }}>{cp.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#111827' }}>{cp.name}</div>
                        {editing ? (
                          <input type="url" className="form-input" placeholder={`Enter ${cp.name} URL`}
                            value={cp.url} onChange={e => cp.setter(e.target.value)}
                            style={{ fontSize: '0.78rem', padding: '4px 8px', marginTop: '4px' }} />
                        ) : (
                          cp.url ? (
                            <a href={cp.url} target="_blank" rel="noopener noreferrer"
                              style={{ fontSize: '0.75rem', color: '#d97706', textDecoration: 'none' }}>
                              View Profile →
                            </a>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Not connected</span>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Milestones */}
              <div style={{
                background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px',
                padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
              }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#111827', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FiTarget size={16} color="#6366f1" /> Upcoming Milestones
                </h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {mockMilestones.map(m => (
                    <MilestoneCircle key={m.id} milestone={m} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
