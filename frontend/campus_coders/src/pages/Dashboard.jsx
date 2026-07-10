import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiClock,
  FiChevronLeft,
  FiChevronRight,
  FiCode,
  FiExternalLink,
} from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";
import Toast from "../components/Toast";
import { useAuth } from "../context/AuthContext";

/* ── Static data ── */
const announcements = [
  {
    id: 1,
    tag: "HACKATHON UPDATE",
    title: "Spring Code Jam registration is now open",
    desc: "Register before March 15th to get a…",
  },
  {
    id: 2,
    tag: "SYSTEM MAINTENANCE",
    title: "Lab server downtime: Sunday 2AM-4AM",
    desc: "Upgrading GPU nodes for the ML…",
  },
  {
    id: 3,
    tag: "CAREER CENTER",
    title: "Google Technical Workshop next Wednesday",
    desc: "Learn about scalable architecture…",
  },
];

const upcoming = [
  { month: "OCT", day: "12", title: "Web3 Dev Meetup", meta: "18:00 • Hall B" },
  {
    month: "OCT",
    day: "14",
    title: "Algo Study Group",
    meta: "15:30 • Discord",
  },
  {
    month: "OCT",
    day: "18",
    title: "Cloud Final Prep",
    meta: "09:00 • Online",
  },
];

/* Simple calendar generator */
function MiniCalendar({ solvedToday }) {
  const [currentDate, setCurrentDate] = useState(new Date()); // Dynamic current date
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
  // Previous month trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: prevDays - i, current: false });
  }
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = isCurrentMonthYear && d === todayVal;
    cells.push({
      day: d,
      current: true,
      isToday,
      solvedTodayState: isToday && solvedToday,
    });
  }
  // Fill remaining
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
                  className={`sd-cal-dot ${c.solvedTodayState ? "green" : "red"}`}
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
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [solvedToday, setSolvedToday] = useState(user?.solvedToday || false);
  const [openedChallenge, setOpenedChallenge] = useState(false);
  const [userRank, setUserRank] = useState("#5");

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

  const solvedCount = user?.solvedCount || 48;
  const getTodayKey = () => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${now.getFullYear()}-${month}-${day}`;
  };
  const todayKey = getTodayKey();

  useEffect(() => {
    if (!user || user.checkinDate === todayKey) return;

    // compute streak continuity: if last streak date is yesterday -> +1, if absent or older -> reset to 1
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yMonth = String(yesterday.getMonth() + 1).padStart(2, "0");
    const yDay = String(yesterday.getDate()).padStart(2, "0");
    const yesterdayKey = `${yesterday.getFullYear()}-${yMonth}-${yDay}`;

    const lastStreakDate = user?.streakDate || user?.checkinDate || null;
    let newStreak = 1;
    if (lastStreakDate === todayKey) {
      newStreak = user?.dailyStreak || 0;
    } else if (lastStreakDate === yesterdayKey) {
      newStreak = (user?.dailyStreak || 0) + 1;
    } else {
      newStreak = 1;
    }

    updateUser({
      xp: (user.xp ?? 0) + 1,
      checkedInToday: true,
      checkinDate: todayKey,
      dailyStreak: newStreak,
      streakDate: todayKey,
    });
    showToast(
      "success",
      "Daily check-in completed automatically. +1 XP awarded!",
    );
  }, [showToast, todayKey, updateUser, user]);

  // Reset solved status only if the active challenge changes.
  useEffect(() => {
    // tie active challenge slug to today's date so POTD resets each day
    const activeChallengeSlug = `roman-to-integer-${todayKey}`;
    const lastChallengeSlug = localStorage.getItem("cc-last-challenge-slug");
    if (lastChallengeSlug !== activeChallengeSlug) {
      localStorage.setItem("cc-last-challenge-slug", activeChallengeSlug);
      localStorage.removeItem("cc-user-solved-today");
      setSolvedToday(false);
      updateUser({ solvedToday: false });
    }
  }, [updateUser, todayKey]);

  // Track rank dynamically from leaderboard in local storage
  useEffect(() => {
    const stored = localStorage.getItem("cc-leaderboard");
    let ranks = [];
    if (stored) {
      ranks = JSON.parse(stored);
    } else {
      ranks = [
        { name: "Rohit Sharma", solved: 92 },
        { name: "Sneha Patel", solved: 87 },
        { name: "Arjun Das", solved: 84 },
        { name: "Priya Nair", solved: 75 },
        { name: user?.name || "Alex Rivera", solved: solvedCount, isYou: true },
      ];
      ranks.sort((a, b) => b.solved - a.solved);
      localStorage.setItem("cc-leaderboard", JSON.stringify(ranks));
    }

    const index = ranks.findIndex(
      (r) => r.name === (user?.name || "Alex Rivera") || r.isYou,
    );
    if (index !== -1) {
      setUserRank(`#${index + 1}`);
    }
  }, [solvedCount, user]);

  const handleRedirectChallenge = () => {
    // Open challenge link in new tab
    window.open("https://leetcode.com/problems/roman-to-integer/", "_blank");
    setOpenedChallenge(true);
    showToast(
      "info",
      "Redirecting to LeetCode. Submit an accepted solution, then verify it here.",
    );
  };

  // verification removed; manual marking is used instead

  const handleMarkSolvedManual = () => {
    const ok = window.confirm(
      "Mark this Problem of the Day as solved manually? This will increase your solved count and streak.",
    );
    if (!ok) return;

    if (!solvedToday) {
      const newSolvedCount = solvedCount + 1;
      const newXp = (user?.xp ?? 0) + 10;

      // compute streak as in other places
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yMonth = String(yesterday.getMonth() + 1).padStart(2, "0");
      const yDay = String(yesterday.getDate()).padStart(2, "0");
      const yesterdayKey = `${yesterday.getFullYear()}-${yMonth}-${yDay}`;
      const lastStreakDate = user?.streakDate || user?.checkinDate || null;
      let newStreak = 1;
      if (lastStreakDate === todayKey) {
        newStreak = user?.dailyStreak || 0;
      } else if (lastStreakDate === yesterdayKey) {
        newStreak = (user?.dailyStreak || 0) + 1;
      } else {
        newStreak = 1;
      }

      setSolvedToday(true);
      updateUser({
        solvedCount: newSolvedCount,
        solvedToday: true,
        xp: newXp,
        dailyStreak: newStreak,
        streakDate: todayKey,
      });

      // update leaderboard
      const stored = localStorage.getItem("cc-leaderboard");
      if (stored) {
        const ranks = JSON.parse(stored);
        const userItem = ranks.find(
          (r) => r.name === (user?.name || "Alex Rivera") || r.isYou,
        );
        if (userItem) userItem.solved = newSolvedCount;
        ranks.sort((a, b) => b.solved - a.solved);
        localStorage.setItem("cc-leaderboard", JSON.stringify(ranks));
      }

      showToast("success", "Marked as solved. +10 XP awarded!");
    } else {
      showToast("info", "Already marked solved for today.");
    }
  };

  const firstName = user?.name?.split(" ")[0] || "Student";

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
              Ready to continue your journey towards engineering excellence?
              Let's dive back in.
            </p>
          </div>
          <div className="sd-welcome-icon">
            <div className="sd-terminal-icon">
              <FiCode size={28} />
            </div>
          </div>
        </div>

        {/* ── Streak, Leaderboard & XP ── */}
        <div
          className="sd-stats-row"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div
            className="sd-stat-pill"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "center",
              height: "110px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span className="sd-stat-pill-icon">🔥</span>
              <div>
                <div className="sd-stat-pill-label">DAILY STREAK</div>
                <div className="sd-stat-pill-value">
                  {user?.dailyStreak || 0} Days
                </div>
              </div>
            </div>
            {user?.checkedInToday ? (
              <span
                style={{
                  color: "#059669",
                  fontSize: "0.75rem",
                  fontWeight: "bold",
                  display: "block",
                  marginTop: "10px",
                  marginLeft: "36px",
                }}
              >
                ✓ Checked In Today
              </span>
            ) : null}
          </div>
          <div
            className="sd-stat-pill clickable-stat"
            onClick={() => navigate("/dashboard/leaderboard")}
            style={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              height: "110px",
            }}
          >
            <span className="sd-stat-pill-icon">🏆</span>
            <div>
              <div className="sd-stat-pill-label">LEADERBOARD</div>
              <div className="sd-stat-pill-value">{userRank}</div>
            </div>
          </div>
          <div
            className="sd-stat-pill"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              height: "110px",
            }}
          >
            <span className="sd-stat-pill-icon">⚡</span>
            <div>
              <div className="sd-stat-pill-label">TOTAL SCORE</div>
              <div className="sd-stat-pill-value">{user?.xp ?? 0} XP</div>
            </div>
          </div>
        </div>

        {/* ── Problem of the Day ── */}
        <div className="sd-potd-card">
          <div className="sd-potd-header-row">
            <span className="sd-potd-badge">PROBLEM OF THE DAY</span>
            <span className="sd-potd-platform-badge">
              Platform: <strong>LeetCode</strong>
            </span>
          </div>
          <h2 className="sd-potd-title">Roman to Integer</h2>
          <p className="sd-potd-desc">
            Roman numerals are represented by seven different symbols: I, V, X,
            L, C, D and M. Given a roman numeral, convert it to an integer.
          </p>
          <div className="sd-potd-footer">
            <div className="sd-potd-tags">
              <span className="sd-potd-tag">Math</span>
              <span className="sd-potd-tag">String</span>
              <span className="sd-potd-tag">Hash Table</span>
            </div>

            <div
              className="sd-potd-actions-row"
              style={{ display: "flex", gap: "12px", alignItems: "center" }}
            >
              {solvedToday ? (
                <>
                  <span className="sd-potd-solved-banner">✓ SOLVED</span>
                  <button
                    className="sd-potd-open-btn"
                    onClick={handleRedirectChallenge}
                  >
                    Open Question{" "}
                    <FiExternalLink size={13} style={{ marginLeft: "4px" }} />
                  </button>
                </>
              ) : (
                <>
                  {openedChallenge ? (
                    <>
                      <button
                        className="sd-potd-open-btn"
                        onClick={handleRedirectChallenge}
                      >
                        Open Question{" "}
                        <FiExternalLink
                          size={13}
                          style={{ marginLeft: "4px" }}
                        />
                      </button>
                      <button
                        className="sd-potd-manual-btn"
                        onClick={handleMarkSolvedManual}
                        style={{ marginLeft: 8 }}
                      >
                        Mark as Solved
                      </button>
                    </>
                  ) : (
                    <button
                      className="sd-potd-solve-btn"
                      id="solve-potd-btn"
                      onClick={handleRedirectChallenge}
                    >
                      Solve Challenge
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Bottom Row: Announcements | Upcoming | Calendar ── */}
        <div className="sd-bottom-grid">
          {/* Announcements */}
          <div className="sd-card">
            <div className="sd-card-header">
              <h3>
                Announcements <span className="sd-card-header-icon">📢</span>
              </h3>
            </div>
            <div className="sd-announce-list">
              {announcements.map((a) => (
                <div key={a.id} className="sd-announce-item">
                  <span className="sd-announce-tag">{a.tag}</span>
                  <h4>{a.title}</h4>
                  <p>{a.desc}</p>
                </div>
              ))}
            </div>
            <button
              className="sd-card-footer-btn"
              id="see-all-alerts-btn"
              onClick={() => navigate("/dashboard/announcements")}
            >
              See all alerts
            </button>
          </div>

          {/* Upcoming */}
          <div className="sd-card">
            <div className="sd-card-header">
              <h3>Upcoming</h3>
              <span className="sd-card-header-sub">Current Month</span>
            </div>
            <div className="sd-upcoming-list">
              {upcoming.map((u, i) => (
                <div key={i} className="sd-upcoming-item">
                  <div className="sd-upcoming-date">
                    <span className="sd-upcoming-month">{u.month}</span>
                    <span className="sd-upcoming-day">{u.day}</span>
                  </div>
                  <div className="sd-upcoming-info">
                    <h4>{u.title}</h4>
                    <p>
                      <FiClock size={12} /> {u.meta}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Calendar */}
          <MiniCalendar solvedToday={solvedToday} />
        </div>
      </div>
    </DashboardLayout>
  );
}
