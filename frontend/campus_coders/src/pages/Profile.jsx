import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  FiEdit2,
  FiSave,
  FiGithub,
  FiLinkedin,
  FiGlobe,
  FiX,
  FiRefreshCcw,
} from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";
import Toast from "../components/Toast";
import { useAuth } from "../context/AuthContext";

const initialSkills = ["Java", "Machine Learning", "Distributed Systems", "Go"];

export default function Profile() {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);

  /* ── Edit mode state ── */
  const [editingPersonal, setEditingPersonal] = useState(false);
  const [editingProfiles, setEditingProfiles] = useState(false);
  const [editingSkills, setEditingSkills] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncMsg, setLastSyncMsg] = useState(null);
  const [lastSyncAt, setLastSyncAt] = useState(null);
  const [lastLcFailed, setLastLcFailed] = useState(false);
  const [lastGfgFailed, setLastGfgFailed] = useState(false);
  const [lastLcSolved, setLastLcSolved] = useState(null);
  const [lastGfgSolved, setLastGfgSolved] = useState(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // load persisted last-sync state on mount so cooldown persists after reload
  useEffect(() => {
    try {
      const raw = localStorage.getItem("cc-last-sync");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.ts) {
          setLastSyncAt(parsed.ts);
          setLastSyncMsg(parsed.msg || null);
          setLastLcSolved(
            typeof parsed.lcSolved === "number" ? parsed.lcSolved : null,
          );
          setLastGfgSolved(
            typeof parsed.gfgSolved === "number" ? parsed.gfgSolved : null,
          );
          setLastLcFailed(Boolean(parsed.lcFailed));
          setLastGfgFailed(Boolean(parsed.gfgFailed));
        }
      }
    } catch (e) {
      // ignore parse errors
    }
  }, []);

  /* ── Form data ── */
  const [formData, setFormData] = useState({
    name: user?.name || "Alex Rivera",
    email: user?.email || "alex.rivera@stanford.edu",
    university: "Stanford University",
    bio: "Passionate software engineer focused on distributed systems and high-performance computing. Developing tools for the next generation of coders.",
    leetcodeUser: user?.leetcodeUser || "",
    gfgUser: user?.gfgUser || "",
    githubUser: user?.githubUser || "",
    linkedinUser: user?.linkedinUser || "",
  });

  const [savedData, setSavedData] = useState({ ...formData });

  /* ── Skills ── */
  const [skills, setSkills] = useState(initialSkills);
  const [savedSkills, setSavedSkills] = useState([...initialSkills]);
  const [newSkill, setNewSkill] = useState("");

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

  /* ── Field change handler ── */
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  /* ── Save personal info ── */
  const handleSavePersonal = () => {
    updateUser({
      name: formData.name,
      email: formData.email,
      university: formData.university,
      bio: formData.bio,
    });
    setSavedData({ ...formData });
    setEditingPersonal(false);
    showToast("success", "Personal information saved successfully!");
  };

  /* ── Cancel personal edit ── */
  const handleCancelPersonal = () => {
    setFormData({ ...savedData });
    setEditingPersonal(false);
  };

  const extractUsername = (urlOrUsername) => {
    if (!urlOrUsername) return "";
    let cleanUrl = urlOrUsername.split("?")[0].split("#")[0].trim();
    if (
      cleanUrl.includes("http://") ||
      cleanUrl.includes("https://") ||
      cleanUrl.includes(".com") ||
      cleanUrl.includes(".org")
    ) {
      try {
        cleanUrl = cleanUrl.replace(/\/$/, "");
        const parts = cleanUrl.split("/");
        return parts[parts.length - 1] || urlOrUsername;
      } catch (e) {
        return urlOrUsername;
      }
    }
    return cleanUrl;
  };

  /* ── Save Profiles & Sync with Leetcode/GFG ── */
  const handleSaveProfiles = async () => {
    // reuse the generic fetch-and-sync helper so both Save & Refresh behave the same
    setSyncing(true);
    showToast("info", "Syncing problems solved from LeetCode & GFG...");
    try {
      await fetchAndSyncCodingProfiles({ saveForm: true });
    } finally {
      setSyncing(false);
    }
  };

  const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

  const fetchAndSyncCodingProfiles = async ({ saveForm = false } = {}) => {
    const parsedLeetcodeUser = extractUsername(formData.leetcodeUser);
    const parsedGfgUser = extractUsername(formData.gfgUser);

    // Validation
    if (
      formData.leetcodeUser &&
      (!parsedLeetcodeUser ||
        parsedLeetcodeUser === "u" ||
        parsedLeetcodeUser === "leetcode.com" ||
        parsedLeetcodeUser === "leetcode")
    ) {
      showToast(
        "error",
        "Please enter a valid LeetCode profile URL including your username.",
      );
      return { success: false };
    }
    if (
      formData.gfgUser &&
      (!parsedGfgUser ||
        parsedGfgUser === "profile" ||
        parsedGfgUser === "user" ||
        parsedGfgUser === "geeksforgeeks.org" ||
        parsedGfgUser === "geeksforgeeks")
    ) {
      showToast(
        "error",
        "Please enter a valid GeeksforGeeks profile URL including your username.",
      );
      return { success: false };
    }

    let lcSolved = null;
    let gfgSolved = null;
    let lcFailed = false;
    let gfgFailed = false;

    const fetchWithTimeout = async (url, timeout = 6000) => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(id);
        return response;
      } catch (e) {
        clearTimeout(id);
        throw e;
      }
    };

    try {
      if (parsedLeetcodeUser) {
        try {
          const res = await fetchWithTimeout(
            `https://leetcode-api-faisalshohag.vercel.app/${parsedLeetcodeUser}`,
          );
          const data = await res.json();
          if (typeof data.totalSolved === "number") {
            lcSolved = data.totalSolved;
          } else {
            lcFailed = true;
          }
        } catch (e) {
          lcFailed = true;
        }
      }

      if (parsedGfgUser) {
        try {
          let res = await fetchWithTimeout(
            `https://gfgstatscard.vercel.app/${parsedGfgUser}?raw=true`,
            4000,
          );
          let data = await res.json();
          if (typeof data.totalProblemsSolved === "number") {
            gfgSolved = data.totalProblemsSolved;
          } else {
            throw new Error("No totalProblemsSolved in response");
          }
        } catch (e1) {
          try {
            let res = await fetchWithTimeout(
              `https://corsproxy.io/?${encodeURIComponent(`https://gfgstatscard.vercel.app/${parsedGfgUser}?raw=true`)}`,
              4000,
            );
            let data = await res.json();
            if (typeof data.totalProblemsSolved === "number") {
              gfgSolved = data.totalProblemsSolved;
            } else {
              throw new Error("No totalProblemsSolved in response");
            }
          } catch (e2) {
            try {
              let res = await fetchWithTimeout(
                `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://gfgstatscard.vercel.app/${parsedGfgUser}?raw=true`)}`,
                4000,
              );
              let data = await res.json();
              if (typeof data.totalProblemsSolved === "number") {
                gfgSolved = data.totalProblemsSolved;
              } else {
                gfgFailed = true;
              }
            } catch (e3) {
              gfgFailed = true;
            }
          }
        }
      }

      const parts = [];
      if (parsedLeetcodeUser)
        parts.push(
          lcFailed ? "LeetCode: fetch failed" : `LeetCode: ${lcSolved}`,
        );
      if (parsedGfgUser)
        parts.push(gfgFailed ? "GFG: fetch failed" : `GFG: ${gfgSolved}`);

      const requestedSync = Boolean(parsedLeetcodeUser || parsedGfgUser);

      // load persisted last-sync values
      let persisted = null;
      try {
        const raw = localStorage.getItem("cc-last-sync");
        persisted = raw ? JSON.parse(raw) : null;
      } catch (e) {
        persisted = null;
      }

      const lastKnownLc =
        typeof lcSolved === "number"
          ? lcSolved
          : persisted && typeof persisted.lcSolved === "number"
            ? persisted.lcSolved
            : null;
      const lastKnownGfg =
        typeof gfgSolved === "number"
          ? gfgSolved
          : persisted && typeof persisted.gfgSolved === "number"
            ? persisted.gfgSolved
            : null;

      // If we have any known counts, update total using them (prefer fetched values)
      const haveAnyKnown =
        requestedSync && (lastKnownLc !== null || lastKnownGfg !== null);
      const totalSolved = haveAnyKnown
        ? Number(lastKnownLc || 0) + Number(lastKnownGfg || 0)
        : user?.solvedCount || 48;

      const hasSyncFailure = lcFailed || gfgFailed;

      // Update user context & local leaderboard
      updateUser({
        leetcodeUser: formData.leetcodeUser,
        gfgUser: formData.gfgUser,
        githubUser: formData.githubUser,
        linkedinUser: formData.linkedinUser,
        ...(haveAnyKnown ? { solvedCount: totalSolved } : {}),
      });

      const currentLeaderboard =
        JSON.parse(localStorage.getItem("cc-leaderboard")) || [];
      const filteredLeaderboard = currentLeaderboard.filter(
        (item) => item.name !== (user?.name || "Alex Rivera"),
      );
      filteredLeaderboard.push({
        name: user?.name || "Alex Rivera",
        solved: totalSolved,
        leetcodeUser: formData.leetcodeUser,
        gfgUser: formData.gfgUser,
        isYou: true,
        avatar: user?.avatar || null,
      });
      filteredLeaderboard.sort((a, b) => b.solved - a.solved);
      localStorage.setItem(
        "cc-leaderboard",
        JSON.stringify(filteredLeaderboard),
      );

      setSavedData({ ...formData });
      setEditingProfiles(false);

      // store last fetch state for UI
      setLastLcFailed(lcFailed);
      setLastGfgFailed(gfgFailed);
      setLastLcSolved(lcSolved);
      setLastGfgSolved(gfgSolved);
      setLastSyncMsg(parts.join(", ") || "No profiles configured");
      const nowTs = Date.now();
      setLastSyncAt(nowTs);
      try {
        localStorage.setItem(
          "cc-last-sync",
          JSON.stringify({
            ts: nowTs,
            msg: parts.join(", ") || "No profiles configured",
            lcSolved,
            gfgSolved,
            lcFailed,
            gfgFailed,
          }),
        );
      } catch (e) {
        // ignore localStorage errors
      }

      if (hasSyncFailure) {
        showToast(
          "warning",
          `${parts.join(", ")}. Solved count was not changed.`,
        );
      } else {
        showToast(
          "success",
          `Synced! ${parts.join(", ")}. Total Solved: ${totalSolved}`,
        );
      }
      return { success: true };
    } catch (err) {
      showToast(
        "error",
        "Failed to sync coding profiles. Please check your URLs and try again.",
      );
      return { success: false };
    }
  };

  const canRefresh = () => {
    if (!lastSyncAt) return true;
    return Date.now() - lastSyncAt >= COOLDOWN_MS;
  };

  const getCooldownRemaining = () => {
    if (!lastSyncAt) return 0;
    const rem = COOLDOWN_MS - (Date.now() - lastSyncAt);
    return rem > 0 ? rem : 0;
  };

  const handleRefresh = async () => {
    if (!canRefresh()) return;
    setSyncing(true);
    showToast("info", "Refreshing coding profile counts...");
    try {
      await fetchAndSyncCodingProfiles({ saveForm: false });
    } finally {
      setSyncing(false);
    }
  };

  /* ── Cancel profiles edit ── */
  const handleCancelProfiles = () => {
    setFormData({ ...savedData });
    setEditingProfiles(false);
  };

  /* ── Skills handlers ── */
  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (skill) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleSaveSkills = () => {
    setSavedSkills([...skills]);
    setEditingSkills(false);
    showToast("success", "Skills updated successfully!");
  };

  const handleCancelSkills = () => {
    setSkills([...savedSkills]);
    setNewSkill("");
    setEditingSkills(false);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        updateUser({ avatar: reader.result });
        showToast("success", "Profile photo updated successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    updateUser({ avatar: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    showToast("success", "Profile photo removed.");
  };

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  const solvedCount = user?.solvedCount || 48;

  return (
    <DashboardLayout>
      <div className="prof-page">
        {/* ── Toast ── */}
        <Toast
          type={toast.type}
          message={toast.message}
          show={toast.show}
          onClose={hideToast}
        />

        {/* ── Profile Hero ── */}
        <div className="prof-hero">
          <div className="prof-hero-left">
            <div className="prof-photo-editor">
              <div
                className="prof-avatar-large"
                onClick={() => fileInputRef.current.click()}
                style={{ cursor: "pointer" }}
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Profile"
                    className="prof-avatar-preview"
                  />
                ) : (
                  <span>{userInitials}</span>
                )}
                <div className="prof-avatar-badge">📷</div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                style={{ display: "none" }}
              />
              <div className="prof-avatar-actions">
                <button
                  type="button"
                  className="prof-avatar-action"
                  onClick={() => fileInputRef.current.click()}
                >
                  {avatarPreview ? "Change photo" : "Upload photo"}
                </button>
                {avatarPreview && (
                  <button
                    type="button"
                    className="prof-avatar-action remove"
                    onClick={handleRemoveAvatar}
                  >
                    Remove photo
                  </button>
                )}
              </div>
            </div>
            <div className="prof-hero-info">
              <h1 className="prof-name">{savedData.name}</h1>
              <div className="prof-badges">
                <span className="prof-id-badge">● ID: 2024-ALX-082</span>
                <span className="prof-uni">🎓 {savedData.university}</span>
              </div>
              <p className="prof-bio">{savedData.bio}</p>
            </div>
          </div>
          <div className="prof-hero-stats">
            <div className="prof-stat-box">
              <span className="prof-stat-val">{solvedCount}</span>
              <span className="prof-stat-label">PROBLEMS</span>
            </div>
            <div
              style={{
                marginLeft: 16,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 6,
              }}
            >
              <button
                className="prof-refresh-btn"
                onClick={handleRefresh}
                disabled={!canRefresh() || syncing}
                title={
                  canRefresh()
                    ? "Refresh solved counts"
                    : "Refresh available in 5 minutes"
                }
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <FiRefreshCcw /> {syncing ? "Refreshing..." : "Refresh"}
              </button>
              {lastSyncAt && (
                <div
                  style={{
                    fontSize: 12,
                    color:
                      lastLcFailed || lastGfgFailed ? "#b45309" : "#374151",
                  }}
                >
                  {lastSyncMsg}
                </div>
              )}
              {!canRefresh() && (
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  Refresh in {Math.ceil(getCooldownRemaining() / 1000)}s
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Personal Info + Coding Profiles ── */}
        <div className="prof-info-grid">
          <div className="prof-card">
            <div className="prof-card-header">
              <h3>📋 Personal Information</h3>
              <div className="prof-card-header-right">
                {editingPersonal ? (
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      className="prof-action-btn save"
                      onClick={handleSavePersonal}
                      id="save-personal-btn"
                    >
                      <FiSave size={14} /> Save
                    </button>
                    <button
                      className="prof-action-btn cancel"
                      onClick={handleCancelPersonal}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    className="prof-edit-btn"
                    onClick={() => setEditingPersonal(true)}
                    id="edit-personal-btn"
                  >
                    <FiEdit2 size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="prof-form-row">
              <div className="prof-field">
                <label>FULL NAME</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  readOnly={!editingPersonal}
                  className={!editingPersonal ? "readonly" : ""}
                />
              </div>
              <div className="prof-field">
                <label>EMAIL ADDRESS</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  readOnly={!editingPersonal}
                  className={!editingPersonal ? "readonly" : ""}
                />
              </div>
            </div>

            <div className="prof-field">
              <label>UNIVERSITY AFFILIATION</label>
              <div
                className={`prof-input-icon ${!editingPersonal ? "readonly" : ""}`}
              >
                <span>🏛</span>
                <input
                  type="text"
                  value={formData.university}
                  onChange={(e) => handleChange("university", e.target.value)}
                  readOnly={!editingPersonal}
                />
              </div>
            </div>

            <div className="prof-field">
              <label>BIOGRAPHY</label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleChange("bio", e.target.value)}
                readOnly={!editingPersonal}
                className={!editingPersonal ? "readonly" : ""}
                rows={4}
              />
            </div>
          </div>

          <div className="prof-social-card">
            <div
              className="prof-card-header"
              style={{
                marginBottom: "16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <h3 style={{ margin: 0 }}>🔗 Coding Profiles</h3>
                {lastSyncMsg && (
                  <div
                    style={{
                      fontSize: 12,
                      color:
                        lastLcFailed || lastGfgFailed ? "#b45309" : "#065f46",
                    }}
                  >
                    {lastSyncMsg}
                  </div>
                )}
              </div>
              <div className="prof-card-header-right">
                {!editingProfiles && (
                  <button
                    className="prof-edit-btn"
                    onClick={() => setEditingProfiles(true)}
                    id="edit-profiles-btn"
                  >
                    <FiEdit2 size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="prof-social-item">
              <label>LEETCODE PROFILE URL</label>
              {editingProfiles ? (
                <input
                  type="text"
                  value={formData.leetcodeUser}
                  onChange={(e) => handleChange("leetcodeUser", e.target.value)}
                  placeholder="Paste LeetCode profile URL..."
                  className="prof-field-input-style"
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #E5E7EB",
                    background: "#FFFFFF",
                  }}
                />
              ) : (
                <div className="prof-social-link">
                  <span
                    style={{
                      fontWeight: 600,
                      color: "#D4AF37",
                      wordBreak: "break-all",
                    }}
                  >
                    {savedData.leetcodeUser || "Not set"}
                  </span>
                </div>
              )}
            </div>

            <div className="prof-social-item">
              <label>GEEKSFORGEEKS PROFILE URL</label>
              {editingProfiles ? (
                <input
                  type="text"
                  value={formData.gfgUser}
                  onChange={(e) => handleChange("gfgUser", e.target.value)}
                  placeholder="Paste GFG profile URL..."
                  className="prof-field-input-style"
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #E5E7EB",
                    background: "#FFFFFF",
                  }}
                />
              ) : (
                <div className="prof-social-link">
                  <span
                    style={{
                      fontWeight: 600,
                      color: "#059669",
                      wordBreak: "break-all",
                    }}
                  >
                    {savedData.gfgUser || "Not set"}
                  </span>
                </div>
              )}
            </div>

            <div className="prof-social-item" style={{ marginTop: "24px" }}>
              <label>GITHUB</label>
              {editingProfiles ? (
                <input
                  type="text"
                  value={formData.githubUser}
                  onChange={(e) => handleChange("githubUser", e.target.value)}
                  placeholder="GitHub profile link or username"
                  className="prof-field-input-style"
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #E5E7EB",
                    background: "#FFFFFF",
                  }}
                />
              ) : (
                <div className="prof-social-link">
                  <FiGithub size={16} />
                  <span style={{ wordBreak: "break-all" }}>
                    {savedData.githubUser || "Not set"}
                  </span>
                </div>
              )}
            </div>

            <div className="prof-social-item">
              <label>LINKEDIN</label>
              {editingProfiles ? (
                <input
                  type="text"
                  value={formData.linkedinUser}
                  onChange={(e) => handleChange("linkedinUser", e.target.value)}
                  placeholder="LinkedIn profile link or username"
                  className="prof-field-input-style"
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #E5E7EB",
                    background: "#FFFFFF",
                  }}
                />
              ) : (
                <div className="prof-social-link">
                  <FiLinkedin size={16} />
                  <span style={{ wordBreak: "break-all" }}>
                    {savedData.linkedinUser || "Not set"}
                  </span>
                </div>
              )}
            </div>

            {editingProfiles && (
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  marginTop: "20px",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  className="prof-action-btn cancel"
                  onClick={handleCancelProfiles}
                  disabled={syncing}
                >
                  Cancel
                </button>
                <button
                  className="prof-action-btn save"
                  onClick={handleSaveProfiles}
                  id="save-profiles-btn"
                  disabled={syncing}
                >
                  <FiSave size={14} /> {syncing ? "Syncing..." : "Save & Sync"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Specialized Skills ── */}
        <div className="prof-card prof-skills-card">
          <div className="prof-card-header">
            <h3>🎯 Specialized Skills</h3>
            {editingSkills ? (
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  className="prof-action-btn save"
                  onClick={handleSaveSkills}
                  id="save-skills-btn"
                >
                  <FiSave size={14} /> Save
                </button>
                <button
                  className="prof-action-btn cancel"
                  onClick={handleCancelSkills}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                className="prof-edit-btn"
                onClick={() => setEditingSkills(true)}
                id="edit-skills-btn"
              >
                <FiEdit2 size={14} />
              </button>
            )}
          </div>
          <div className="prof-skills-wrap">
            {skills.map((skill) => (
              <span key={skill} className="prof-skill-tag">
                {skill}
                {editingSkills && (
                  <button
                    onClick={() => removeSkill(skill)}
                    className="prof-skill-remove"
                  >
                    <FiX size={12} />
                  </button>
                )}
              </span>
            ))}
            {editingSkills && (
              <div className="prof-skill-add">
                <input
                  type="text"
                  placeholder="python"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSkill()}
                />
                <button
                  className="prof-skill-add-btn"
                  onClick={addSkill}
                  id="add-skill-btn"
                >
                  + ADD
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
