import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  FiEdit2, FiSave, FiX, FiExternalLink, FiMail, FiBookOpen,
  FiCalendar, FiEye, FiEyeOff, FiMapPin, FiSettings, FiLock
} from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";
import BrandMark from "../components/BrandMark";
import ActivityHeatmap from "../components/ActivityHeatmap";
import Toast from "../components/Toast";
import api from "../api/client";

const LINK_FIELDS = [
  { key: "leetcodeUrl", name: "LeetCode", placeholder: "https://leetcode.com/u/your-handle" },
  { key: "githubUrl", name: "GitHub", placeholder: "https://github.com/your-handle" },
  { key: "geeksforgeeksUrl", name: "GeeksforGeeks", placeholder: "https://www.geeksforgeeks.org/user/your-handle" },
  { key: "linkedinUrl", name: "LinkedIn", placeholder: "https://www.linkedin.com/in/your-handle" },
  { key: "portfolioUrl", name: "Portfolio", placeholder: "https://your-site.com" },
];

function initials(name) {
  return String(name || "CC")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function formatJoined(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
}

function roleLabel(role) {
  if (!role) return "Student";
  const value = String(role).toLowerCase();
  if (value === "admin") return "Admin";
  return "Student";
}

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [editingBio, setEditingBio] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [university, setUniversity] = useState("");
  const [links, setLinks] = useState({
    leetcodeUrl: "",
    githubUrl: "",
    geeksforgeeksUrl: "",
    linkedinUrl: "",
    portfolioUrl: "",
  });
  const [linkDraft, setLinkDraft] = useState("");
  const [leetcodeYear, setLeetcodeYear] = useState(new Date().getFullYear());
  const [githubYear, setGithubYear] = useState(new Date().getFullYear());
  const [calendar, setCalendar] = useState(null);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [githubCalendar, setGithubCalendar] = useState(null);
  const [githubLoading, setGithubLoading] = useState(false);
  const [pathsInProgress, setPathsInProgress] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
  const didAutoLeetcodeYear = useRef(false);

  const [toast, setToast] = useState({ show: false, type: "success", message: "" });
  const showToast = useCallback((type, message) => {
    setToast({ show: true, type, message });
  }, []);
  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, show: false }));
  }, []);

  const [avatarUrl, setAvatarUrl] = useState("");

  const applyProfile = (data) => {
    setProfile(data);
    setFullName(data.fullName || "");
    setBio(data.bio || "");
    setUniversity(data.university || "");
    setAvatarUrl(data.avatarUrl || "");
    setLinks({
      leetcodeUrl: data.leetcodeUrl || "",
      githubUrl: data.githubUrl || "",
      geeksforgeeksUrl: data.geeksforgeeksUrl || "",
      linkedinUrl: data.linkedinUrl || "",
      portfolioUrl: data.portfolioUrl || "",
    });
  };

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/profile/me");
      applyProfile(res.data);
    } catch (err) {
      showToast("error", "Could not load profile.");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      api.get("/learning-progress/in-progress").catch(() => ({ data: [] })),
      api.get("/bookmarks").catch(() => ({ data: {} })),
    ]).then(([progressRes, bookmarkRes]) => {
      if (cancelled) return;
      const paths = Array.isArray(progressRes.data) ? progressRes.data.length : 0;
      const bm = bookmarkRes.data || {};
      const saved = (bm.bookmarkedPathIds?.length || 0)
        + (bm.bookmarkedTopicIds?.length || 0)
        + (bm.bookmarkedResourceIds?.length || 0);
      setPathsInProgress(paths);
      setSavedCount(saved);
    });
    return () => { cancelled = true; };
  }, []);

  const loadCalendar = useCallback(async (year) => {
    setCalendarLoading(true);
    try {
      const res = await api.get('/profile/me/leetcode-calendar', { params: { year } });
      setCalendar(res.data);
    } catch (err) {
      setCalendar({
        available: false,
        days: [],
        message: 'Could not load LeetCode activity.',
      });
    } finally {
      setCalendarLoading(false);
    }
  }, []);

  const loadGithubCalendar = useCallback(async (year) => {
    setGithubLoading(true);
    try {
      const res = await api.get('/profile/me/github-calendar', { params: { year } });
      setGithubCalendar(res.data);
    } catch (err) {
      setGithubCalendar({
        available: false,
        days: [],
        message: 'Could not load GitHub activity.',
      });
    } finally {
      setGithubLoading(false);
    }
  }, []);

  useEffect(() => {
    if (loading) return;
    loadCalendar(leetcodeYear);
  }, [loading, links.leetcodeUrl, leetcodeYear, loadCalendar]);

  useEffect(() => {
    if (loading) return;
    loadGithubCalendar(githubYear);
  }, [loading, links.githubUrl, githubYear, loadGithubCalendar]);

  useEffect(() => {
    didAutoLeetcodeYear.current = false;
    setCalendar(null);
  }, [links.leetcodeUrl]);

  useEffect(() => {
    const years = calendar?.activeYears || [];
    if (didAutoLeetcodeYear.current) return;
    if (!calendar?.available || !years.length || years.includes(leetcodeYear)) return;
    didAutoLeetcodeYear.current = true;
    setLeetcodeYear(Math.max(...years));
  }, [calendar, leetcodeYear]);

  const savePayload = (extra = {}) => ({
    fullName,
    bio,
    university,
    leetcodeUrl: links.leetcodeUrl,
    geeksforgeeksUrl: links.geeksforgeeksUrl,
    githubUrl: links.githubUrl,
    linkedinUrl: links.linkedinUrl,
    portfolioUrl: links.portfolioUrl,
    avatarUrl: avatarUrl || "",
    ...extra,
  });

  const persist = async (payload) => {
    setSaving(true);
    try {
      const res = await api.put("/profile/me", payload);
      applyProfile(res.data);
      showToast("success", "Saved.");
      return true;
    } catch (err) {
      showToast("error", err.response?.data?.message || "Could not save.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBio = async (e) => {
    e.preventDefault();
    const ok = await persist(savePayload());
    if (ok) setEditingBio(false);
  };

  const startEditLink = (key) => {
    setEditingLink(key);
    setLinkDraft(links[key] || "");
  };

  const handleSaveLink = async (key) => {
    const next = { ...links, [key]: linkDraft.trim() };
    const ok = await persist(savePayload({ [key]: next[key] }));
    if (ok) {
      setLinks(next);
      setEditingLink(null);
    }
  };

  const linkedProfiles = useMemo(
    () => LINK_FIELDS.filter((field) => links[field.key]),
    [links]
  );
  const joined = formatJoined(profile?.createdAt);
  const githubEmpty = !githubCalendar?.available && !(githubCalendar?.days || []).length;

  return (
    <DashboardLayout>
      <div className="pf-page">
        <Toast type={toast.type} message={toast.message} show={toast.show} onClose={hideToast} />

        {loading ? (
          <p className="sd-muted">Loading profile...</p>
        ) : (
          <div className="pf-grid">
            <section className="pf-card pf-hero">
              <div className="pf-avatar">
                {profile?.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  initials(profile?.fullName)
                )}
              </div>
              <div className="pf-hero-copy">
                {editingBio ? (
                  <form onSubmit={handleSaveBio} className="pf-bio-form">
                    <label>
                      Name
                      <input className="form-input" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                    </label>
                    <label>
                      University <span className="pf-optional">(optional)</span>
                      <input className="form-input" value={university} onChange={(e) => setUniversity(e.target.value)} placeholder="" />
                    </label>
                    <label>
                      Bio
                      <textarea className="form-input" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="" />
                    </label>
                    <label>
                      Avatar image URL <span className="pf-optional">(optional)</span>
                      <input
                        className="form-input"
                        type="url"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        placeholder="https://..."
                      />
                    </label>
                    <div className="pf-actions">
                      <button type="submit" className="btn btn-dark" disabled={saving}>
                        <FiSave size={15} /> Save
                      </button>
                      <button type="button" className="btn btn-secondary" onClick={() => { setEditingBio(false); applyProfile(profile); }}>
                        <FiX size={15} /> Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="pf-hero-badges">
                      <span className="pf-chip pf-chip-gold">{roleLabel(profile?.role)}</span>
                      <span className="pf-chip">
                        {profile?.publicProfileVisible === false
                          ? <><FiEyeOff size={12} /> Private</>
                          : <><FiEye size={12} /> Public profile</>}
                      </span>
                    </div>
                    <h2>{profile?.fullName}</h2>
                    <div className="pf-facts">
                      <p className="pf-fact"><FiMail size={14} /> <span>{profile?.email}</span></p>
                      <p className="pf-fact"><FiMapPin size={14} /> <span>{university || "University not added"}</span></p>
                      {joined && (
                        <p className="pf-fact"><FiCalendar size={14} /> <span>Joined {joined}</span></p>
                      )}
                    </div>
                    <p className="pf-bio">{bio || "Add a short bio so people know what you work on."}</p>
                    {linkedProfiles.length > 0 && (
                      <div className="pf-hero-badges">
                        {linkedProfiles.map((field) => (
                          <a
                            key={field.key}
                            href={links[field.key]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="pf-chip"
                          >
                            <BrandMark name={field.name} size={12} />
                            {field.name}
                          </a>
                        ))}
                      </div>
                    )}
                    <div className="pf-stats">
                      <div className="pf-stat">
                        <strong>{pathsInProgress}</strong>
                        <span>Paths in progress</span>
                      </div>
                      <div className="pf-stat">
                        <strong>{savedCount}</strong>
                        <span>Saved items</span>
                      </div>
                      <div className="pf-stat">
                        <strong>{calendar?.totalSolved ?? "—"}</strong>
                        <span>LeetCode solved</span>
                      </div>
                      <div className="pf-stat">
                        <strong>{githubEmpty ? "—" : (githubCalendar?.totalActivity ?? "—")}</strong>
                        <span>GitHub this year</span>
                      </div>
                    </div>
                    <div className="pf-hero-actions">
                      <button type="button" className="btn btn-secondary" onClick={() => setEditingBio(true)}>
                        <FiEdit2 size={15} /> Edit profile
                      </button>
                      <Link to="/dashboard/settings" className="btn btn-secondary">
                        <FiSettings size={15} /> Settings
                      </Link>
                      <Link to="/dashboard/change-password" className="btn btn-secondary">
                        <FiLock size={15} /> Password
                      </Link>
                      <Link to="/dashboard/my-learning" className="btn btn-secondary">
                        <FiBookOpen size={15} /> My learning
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </section>

            <ActivityHeatmap
              brand="LeetCode"
              title="LeetCode activity"
              countLabel="submissions"
              streakLabel="max streak"
              note=""
              activityData={calendar?.days || []}
              year={leetcodeYear}
              yearOptions={calendar?.activeYears}
              onYearChange={setLeetcodeYear}
              username={calendar?.username}
              streak={calendar?.streak}
              totalActiveDays={calendar?.totalActiveDays}
              totalActivity={calendar?.totalActivity}
              totalSolved={calendar?.totalSolved}
              easySolved={calendar?.easySolved}
              mediumSolved={calendar?.mediumSolved}
              hardSolved={calendar?.hardSolved}
              ranking={calendar?.ranking}
              loading={calendarLoading}
              message={calendar?.message || (links.leetcodeUrl ? '' : 'Add your LeetCode profile below to see activity.')}
            />

            <ActivityHeatmap
              brand="GitHub"
              title="GitHub activity"
              countLabel="contributions"
              streakLabel="streak"
              note=""
              activityData={githubCalendar?.days || []}
              year={githubYear}
              onYearChange={setGithubYear}
              username={githubCalendar?.username}
              streak={githubCalendar?.streak}
              totalActiveDays={githubCalendar?.totalActiveDays}
              totalActivity={githubCalendar?.totalActivity}
              loading={githubLoading}
              message={githubCalendar?.message || (links.githubUrl ? '' : 'Add your GitHub profile below to see activity.')}
            />

            <section className="pf-card">
              <h3>Profiles</h3>
              <p className="sd-muted pf-lead">Add the sites you already use.</p>
              <ul className="pf-links">
                {LINK_FIELDS.map((field) => {
                  const url = links[field.key];
                  const isEditing = editingLink === field.key;
                  return (
                    <li key={field.key} className="pf-link-row">
                      <span className="pf-link-icon">
                        <BrandMark name={field.name} size={20} />
                      </span>
                      <div className="pf-link-body">
                        <strong>{field.name}</strong>
                        {isEditing ? (
                          <div className="pf-link-edit">
                            <input
                              type="url"
                              className="form-input"
                              value={linkDraft}
                              onChange={(e) => setLinkDraft(e.target.value)}
                              placeholder={field.placeholder}
                              autoFocus
                            />
                            <div className="pf-actions">
                              <button type="button" className="btn btn-dark" disabled={saving} onClick={() => handleSaveLink(field.key)}>
                                <FiSave size={14} /> Save
                              </button>
                              <button type="button" className="btn btn-secondary" onClick={() => setEditingLink(null)}>
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : url ? (
                          <a href={url} target="_blank" rel="noopener noreferrer" className="pf-link-url">
                            {url.replace(/^https?:\/\//, "")} <FiExternalLink size={12} />
                          </a>
                        ) : (
                          <span className="sd-muted">Not added</span>
                        )}
                      </div>
                      {!isEditing && (
                        <button
                          type="button"
                          className="pf-edit-btn"
                          onClick={() => startEditLink(field.key)}
                          aria-label={`Edit ${field.name}`}
                        >
                          <FiEdit2 size={15} />
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
