import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiChevronLeft,
  FiChevronRight,
  FiCode,
  FiExternalLink,
  FiCheckCircle
} from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";
import ActivityHeatmap from "../components/ActivityHeatmap";
import Toast from "../components/Toast";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";

/* Simple calendar generator */
function MiniCalendar({ checkedInToday }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const todayDate = new Date();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();

  const isCurrentMonthYear =
    currentDate.getMonth() === todayDate.getMonth() &&
    currentDate.getFullYear() === todayDate.getFullYear();
  const todayVal = todayDate.getDate();

  const cells = [];
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: prevDays - i, current: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = isCurrentMonthYear && d === todayVal;
    cells.push({
      day: d,
      current: true,
      isToday,
      checkedInTodayState: isToday && checkedInToday,
    });
  }
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, current: false });
  }

  return (
    <div className="sd-calendar">
      <div className="sd-calendar-header">
        <h3 className="sd-calendar-title">
          {monthName} {year}
        </h3>
        <div className="sd-calendar-nav">
          <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>
            <FiChevronLeft size={16} />
          </button>
          <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>
            <FiChevronRight size={16} />
          </button>
        </div>
      </div>
      <div className="sd-calendar-grid">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <span key={i} className="sd-cal-day-label">
            {d}
          </span>
        ))}
        {cells.map((c, i) => {
          let cellClass = "";
          if (!c.current) {
            cellClass = "muted";
          } else if (c.isToday) {
            cellClass = "today";
          }

          return (
            <div key={i} className={`sd-cal-day-cell ${cellClass}`}>
              <span className="sd-cal-day-num">{c.day}</span>
              {c.isToday && (
                <span
                  className={`sd-cal-dot ${c.checkedInTodayState ? "green" : "red"}`}
                ></span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ── Toast ── */
  const [toast, setToast] = useState({
    show: false,
    type: "success",
    message: "",
  });

  const showToast = useCallback((type, message) => {
    setToast({ show: true, type, message });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, show: false }));
  }, []);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [sumRes, annRes] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get('/announcements?page=0&size=3')
      ]);

      setSummary(sumRes.data);
      setAnnouncements(annRes.data.content || []);
    } catch (err) {
      // Provide mock data for frontend-only testing
      const todayStr = new Date().toISOString().split('T')[0];
      const storedSolved = localStorage.getItem('potd_solved_date') === todayStr;

      setSummary({
        totalXp: 1250 + (storedSolved ? 15 : 0),
        dailyStreak: 12 + (storedSolved ? 1 : 0),
        problemsSolved: 45 + (storedSolved ? 1 : 0),
        globalRank: 128,
        checkInStatus: { checkedInToday: storedSolved },
        todayChallenge: {
          id: 1,
          title: 'Two Sum',
          platform: 'LeetCode',
          difficulty: 'BEGINNER',
          xpReward: 15,
          tags: 'Arrays, Hash Table',
          problemUrl: 'https://leetcode.com/problems/two-sum',
          completedToday: storedSolved
        }
      });
      setAnnouncements([
        { id: 1, title: 'Welcome to Campus Coders!', message: 'Explore the new Student Dashboard and start learning!', category: 'SYSTEM', createdAt: new Date().toISOString() },
        { id: 2, title: 'Upcoming Hackathon', message: 'Join the annual spring coding challenge this weekend.', category: 'HACKATHON', createdAt: new Date().toISOString() }
      ]);
      // Silently ignore error for demo mode
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleCompleteChallenge = async () => {
    if (!summary?.todayChallenge || isSubmitting || summary.todayChallenge.completedToday) return;
    setIsSubmitting(true);
    try {
      // Mock bypass: Update POTD status and Check-in status simultaneously
      setSummary(prev => ({ 
        ...prev, 
        totalXp: prev.totalXp + prev.todayChallenge.xpReward,
        dailyStreak: prev.dailyStreak + (prev.checkInStatus.checkedInToday ? 0 : 1),
        problemsSolved: prev.problemsSolved + 1,
        checkInStatus: { checkedInToday: true },
        todayChallenge: { ...prev.todayChallenge, completedToday: true }
      }));
      const todayStr = new Date().toISOString().split('T')[0];
      localStorage.setItem('potd_solved_date', todayStr);
      showToast('success', `Awesome! You completed the daily problem and checked in! +${summary.todayChallenge.xpReward} XP awarded!`);
    } catch (err) {
      showToast('info', err.response?.data?.message || 'Already completed today!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const firstName = summary?.fullName?.split(" ")[0] || user?.name?.split(" ")[0] || "Student";
  const potd = summary?.todayChallenge;
  const checkedIn = summary?.checkInStatus?.checkedInToday;

  return (
    <DashboardLayout>
      <div className="sd-page">
        {/* ── Toast ── */}
        <Toast
          type={toast.type}
          message={toast.message}
          show={toast.show}
          onClose={hideToast}
        />

        {/* ── Welcome Banner ── */}
        <div className="sd-welcome-banner">
          <div className="sd-welcome-text">
            <h1>Welcome back, {firstName}!</h1>
            <p>
              Track your daily streak, complete learning paths, and solve the Problem of the Day.
            </p>
          </div>
          <div className="sd-welcome-icon">
            <div className="sd-terminal-icon">
              <FiCode size={28} />
            </div>
          </div>
        </div>

        {/* ── Metrics Row ── */}
        <div
          className="sd-stats-row"
          style={{
            marginBottom: "24px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "16px"
          }}
        >
          {/* Leaderboard Stat Card */}
          <div
            className="sd-stat-pill clickable-stat"
            onClick={() => navigate("/dashboard/leaderboard")}
            style={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "20px 24px",
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "14px", 
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.03)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <span className="sd-stat-pill-icon" style={{ fontSize: "2rem" }}>🏆</span>
              <div>
                <div className="sd-stat-pill-label" style={{ fontSize: "0.8rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                  LEADERBOARD RANK
                </div>
                <div className="sd-stat-pill-value" style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0f172a" }}>
                  {summary?.myLeaderboardRank ? `#${summary.myLeaderboardRank}` : 'Unranked'}
                </div>
              </div>
            </div>
          </div>

          {/* Daily Streak & XP Card */}
          <div
            className="sd-stat-pill"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "20px 24px",
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "14px", 
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.03)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <span className="sd-stat-pill-icon" style={{ fontSize: "2rem" }}>🔥</span>
              <div>
                <div className="sd-stat-pill-label" style={{ fontSize: "0.8rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                  DAILY STREAK & XP
                </div>
                <div className="sd-stat-pill-value" style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0f172a" }}>
                  {summary?.dailyStreak || 0} Days • {summary?.totalXp || 0} XP
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Problem of the Day ── */}
        <div className="sd-potd-card">
          <div className="sd-potd-header-row">
            <span className="sd-potd-badge">PROBLEM OF THE DAY</span>
            <span className="sd-potd-platform-badge">
              Platform: <strong>{potd?.platform || 'LeetCode'}</strong>
            </span>
          </div>
          <h2 className="sd-potd-title">{potd?.title || 'Daily Coding Challenge'}</h2>
          <p className="sd-potd-desc">
            Difficulty: <strong>{potd?.difficulty || 'BEGINNER'}</strong> • Reward: <strong>+{potd?.xpReward || 10} XP</strong>
          </p>
          <div className="sd-potd-footer">
            <div className="sd-potd-tags">
              {potd?.tags?.split(',').map((tag, i) => (
                <span key={i} className="sd-potd-tag">{tag.trim()}</span>
              )) || <span className="sd-potd-tag">Algorithms</span>}
            </div>

            <div
              className="sd-potd-actions-row"
              style={{ display: "flex", gap: "12px", alignItems: "center" }}
            >
              {potd?.problemUrl && (
                <a
                  href={potd.problemUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sd-potd-solve-btn"
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                >
                  Open Problem <FiExternalLink size={14} style={{ marginLeft: "6px" }} />
                </a>
              )}
              {potd && !potd.completedToday ? (
                <button
                  className="btn btn-primary"
                  onClick={handleCompleteChallenge}
                  disabled={isSubmitting}
                  style={{ padding: '8px 16px', opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                >
                  {isSubmitting ? 'Marking...' : `Mark Solved (+${potd.xpReward} XP)`}
                </button>
              ) : potd?.completedToday ? (
                <span style={{ color: '#059669', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <FiCheckCircle size={16} /> Solved Today!
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* ── Bottom Row: Announcements | Activity Heatmap ── */}
        <div className="sd-bottom-grid" style={{ gridTemplateColumns: '1fr' }}>
          {/* Activity Heatmap */}
          <ActivityHeatmap />

          {/* Announcements */}
          <div className="sd-card">
            <div className="sd-card-header">
              <h3>
                Announcements <span className="sd-card-header-icon">📢</span>
              </h3>
            </div>
            <div className="sd-announce-list">
              {announcements.length > 0 ? (
                announcements.map((a) => (
                  <div key={a.id} className="sd-announce-item">
                    <span className="sd-announce-tag">{a.category}</span>
                    <h4>{a.title}</h4>
                    <p>{a.message}</p>
                  </div>
                ))
              ) : (
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No announcements available.</p>
              )}
            </div>
            <button
              className="sd-card-footer-btn"
              onClick={() => navigate("/dashboard/announcements")}
            >
              See all announcements
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
