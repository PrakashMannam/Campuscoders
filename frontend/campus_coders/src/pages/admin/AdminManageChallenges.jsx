import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Toast from '../../components/Toast';
import api from '../../api/client';

const DIFFICULTIES = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

const emptyProblem = {
  title: '',
  platform: 'LeetCode',
  problemUrl: '',
  difficulty: 'BEGINNER',
  tags: '',
  active: true,
};

const emptySchedule = {
  codingProblemId: '',
  challengeDate: new Date().toISOString().slice(0, 10),
};

export default function AdminManageChallenges() {
  const [problems, setProblems] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [problemForm, setProblemForm] = useState(emptyProblem);
  const [scheduleForm, setScheduleForm] = useState(emptySchedule);
  const [editingProblemId, setEditingProblemId] = useState(null);
  const [editingChallengeId, setEditingChallengeId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });

  const showToast = useCallback((type, message) => setToast({ show: true, type, message }), []);
  const hideToast = useCallback(() => setToast((p) => ({ ...p, show: false })), []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        api.get('/admin/coding-problems'),
        api.get('/admin/daily-challenges'),
      ]);
      const problemList = Array.isArray(pRes.data) ? pRes.data : [];
      setProblems(problemList);
      setChallenges(Array.isArray(cRes.data) ? cRes.data : []);
      setScheduleForm((f) => (
        f.codingProblemId || !problemList[0]
          ? f
          : { ...f, codingProblemId: String(problemList[0].id) }
      ));
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Could not load challenges.');
      setProblems([]);
      setChallenges([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const byDate = useMemo(() => {
    const map = {};
    challenges.forEach((c) => {
      if (c.challengeDate) map[c.challengeDate] = c;
    });
    return map;
  }, [challenges]);

  const calendar = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDow = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = Array(firstDow).fill(null);
    for (let d = 1; d <= daysInMonth; d += 1) cells.push(d);
    return { year, month, cells, label: now.toLocaleString('en-US', { month: 'long', year: 'numeric' }) };
  }, []);

  const isoFor = (day) => {
    const m = String(calendar.month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${calendar.year}-${m}-${d}`;
  };

  const saveProblem = async (e) => {
    e.preventDefault();
    const body = {
      title: problemForm.title.trim(),
      platform: problemForm.platform.trim(),
      problemUrl: problemForm.problemUrl.trim(),
      difficulty: problemForm.difficulty,
      tags: problemForm.tags.trim() || null,
    };
    setSaving(true);
    try {
      if (editingProblemId) {
        await api.put(`/admin/coding-problems/${editingProblemId}`, { ...body, active: problemForm.active });
        showToast('success', 'Problem updated.');
      } else {
        await api.post('/admin/coding-problems', body);
        showToast('success', 'Problem added to bank.');
      }
      setProblemForm(emptyProblem);
      setEditingProblemId(null);
      await load();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Could not save problem.');
    } finally {
      setSaving(false);
    }
  };

  const saveSchedule = async (e) => {
    e.preventDefault();
    if (!scheduleForm.codingProblemId) {
      showToast('error', 'Add a coding problem first.');
      return;
    }
    const body = {
      codingProblemId: Number(scheduleForm.codingProblemId),
      challengeDate: scheduleForm.challengeDate,
    };
    setSaving(true);
    try {
      if (editingChallengeId) {
        await api.put(`/admin/daily-challenges/${editingChallengeId}`, {
          ...body,
          active: true,
        });
        showToast('success', 'Schedule updated.');
      } else {
        await api.post('/admin/daily-challenges', body);
        showToast('success', 'Challenge scheduled.');
      }
      setScheduleForm((f) => ({ ...emptySchedule, codingProblemId: f.codingProblemId }));
      setEditingChallengeId(null);
      await load();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Could not schedule challenge.');
    } finally {
      setSaving(false);
    }
  };

  const startEditProblem = (p) => {
    setEditingProblemId(p.id);
    setProblemForm({
      title: p.title || '',
      platform: p.platform || 'LeetCode',
      problemUrl: p.problemUrl || '',
      difficulty: p.difficulty || 'BEGINNER',
      tags: p.tags || '',
      active: p.active !== false,
    });
  };

  const startEditChallenge = (c) => {
    setEditingChallengeId(c.id);
    setScheduleForm({
      codingProblemId: String(c.codingProblem?.id || ''),
      challengeDate: c.challengeDate || emptySchedule.challengeDate,
    });
  };

  const toggleProblem = async (p) => {
    try {
      await api.patch(`/admin/coding-problems/${p.id}/${p.active ? 'deactivate' : 'activate'}`);
      await load();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Could not update problem.');
    }
  };

  const toggleChallenge = async (c) => {
    try {
      await api.patch(`/admin/daily-challenges/${c.id}/${c.active ? 'deactivate' : 'activate'}`);
      await load();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Could not update schedule.');
    }
  };

  const diffColor = (d) => (
    d === 'BEGINNER' ? { bg: '#ECFDF5', color: '#059669' }
      : d === 'INTERMEDIATE' ? { bg: '#FEF3C7', color: '#D97706' }
        : { bg: '#FEF2F2', color: '#DC2626' }
  );

  return (
    <div>
      <Toast type={toast.type} message={toast.message} show={toast.show} onClose={hideToast} />
      <div className="ap-header">
        <div>
          <h1 className="ap-page-title">Daily challenges</h1>
          <p className="ap-page-sub">
            Add LeetCode (or other) problem links, then schedule one per day. Students only get the link - no mark-complete, verification, or XP.
          </p>
        </div>
      </div>

      {loading ? (
        <p className="ap-page-sub">Loading...</p>
      ) : (
        <>
          <div className="ap-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <form className="ap-card-solid" onSubmit={saveProblem}>
              <h3 style={{ margin: '0 0 14px' }}>{editingProblemId ? 'Edit problem' : 'Problem bank'}</h3>
              <label className="form-label">Title</label>
              <input className="form-input" required value={problemForm.title} onChange={(e) => setProblemForm({ ...problemForm, title: e.target.value })} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                <div>
                  <label className="form-label">Platform</label>
                  <input className="form-input" required value={problemForm.platform} onChange={(e) => setProblemForm({ ...problemForm, platform: e.target.value })} />
                </div>
                <div>
                  <label className="form-label">Difficulty</label>
                  <select className="form-select" value={problemForm.difficulty} onChange={(e) => setProblemForm({ ...problemForm, difficulty: e.target.value })}>
                    {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <label className="form-label" style={{ marginTop: 12 }}>Problem URL (https)</label>
              <input className="form-input" type="url" required placeholder="https://leetcode.com/problems/..." value={problemForm.problemUrl} onChange={(e) => setProblemForm({ ...problemForm, problemUrl: e.target.value })} />
              <label className="form-label" style={{ marginTop: 12 }}>Tags (optional)</label>
              <input className="form-input" placeholder="arrays, two-pointers" value={problemForm.tags} onChange={(e) => setProblemForm({ ...problemForm, tags: e.target.value })} />
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : (editingProblemId ? 'Update' : 'Add problem')}</button>
                {editingProblemId && (
                  <button type="button" className="btn btn-secondary" onClick={() => { setEditingProblemId(null); setProblemForm(emptyProblem); }}>Cancel</button>
                )}
              </div>
            </form>

            <form className="ap-card-solid" onSubmit={saveSchedule}>
              <h3 style={{ margin: '0 0 14px' }}>{editingChallengeId ? 'Edit schedule' : 'Schedule POTD'}</h3>
              <label className="form-label">Problem</label>
              <select
                className="form-select"
                required
                value={scheduleForm.codingProblemId}
                onChange={(e) => setScheduleForm({ ...scheduleForm, codingProblemId: e.target.value })}
                disabled={problems.length === 0}
              >
                <option value="">Select problem</option>
                {problems.filter((p) => p.active || String(p.id) === scheduleForm.codingProblemId).map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
              <label className="form-label" style={{ marginTop: 12 }}>Date</label>
              <input
                className="form-input"
                type="date"
                required
                value={scheduleForm.challengeDate}
                onChange={(e) => setScheduleForm({ ...scheduleForm, challengeDate: e.target.value })}
              />
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button type="submit" className="btn btn-primary" disabled={saving || problems.length === 0}>
                  {saving ? 'Saving...' : (editingChallengeId ? 'Update' : 'Schedule')}
                </button>
                {editingChallengeId && (
                  <button type="button" className="btn btn-secondary" onClick={() => { setEditingChallengeId(null); setScheduleForm((f) => ({ ...emptySchedule, codingProblemId: f.codingProblemId })); }}>Cancel</button>
                )}
              </div>
            </form>
          </div>

          <div className="ap-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div className="ap-card-solid">
              <h3 style={{ margin: '0 0 12px' }}>{calendar.label}</h3>
              <div className="ap-cal-grid" style={{ marginBottom: 8 }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                  <div key={d} className="ap-cal-dow">{d}</div>
                ))}
              </div>
              <div className="ap-cal-grid">
                {calendar.cells.map((day, i) => {
                  if (!day) return <div key={`e-${i}`} />;
                  const iso = isoFor(day);
                  const scheduled = byDate[iso];
                  return (
                    <button
                      key={day}
                      type="button"
                      className={`ap-cal-cell ${scheduleForm.challengeDate === iso ? 'selected' : ''}`}
                      onClick={() => setScheduleForm((f) => ({ ...f, challengeDate: iso }))}
                    >
                      <div style={{ fontWeight: 800, fontSize: '0.8rem' }}>{day}</div>
                      {scheduled && (
                        <div className="ap-cal-title">{scheduled.codingProblem?.title || 'Scheduled'}</div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="ap-card-solid">
              <h3 style={{ margin: '0 0 12px' }}>Problems ({problems.length})</h3>
              {problems.length === 0 ? (
                <p className="ap-page-sub">No problems yet. Add one with an external URL.</p>
              ) : problems.map((p) => {
                const col = diffColor(p.difficulty);
                return (
                  <div key={p.id} style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 12, marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                      <strong>{p.title}</strong>
                      <span className="ap-badge" style={{ background: col.bg, color: col.color }}>{p.difficulty}</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 4 }}>
                      {p.platform} - {p.active ? 'Live' : 'Hidden'}
                    </div>
                    {p.problemUrl && (
                      <a href={p.problemUrl} target="_blank" rel="noopener noreferrer" className="sd-text-link" style={{ fontSize: '0.78rem' }}>
                        Open link
                      </a>
                    )}
                    <div style={{ marginTop: 6 }}>
                      <button type="button" className="sd-text-link" onClick={() => startEditProblem(p)}>Edit</button>
                      {' - '}
                      <button type="button" className="sd-text-link" onClick={() => toggleProblem(p)}>{p.active ? 'Hide' : 'Show'}</button>
                    </div>
                  </div>
                );
              })}

              <h3 style={{ margin: '20px 0 12px' }}>Scheduled ({challenges.length})</h3>
              {challenges.length === 0 ? (
                <p className="ap-page-sub">Nothing scheduled.</p>
              ) : challenges.map((c) => (
                <div key={c.id} style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 12, marginBottom: 10 }}>
                  <strong>{c.codingProblem?.title || 'Problem'}</strong>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 4 }}>
                    {c.challengeDate} - {c.active ? 'Active' : 'Hidden'}
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <button type="button" className="sd-text-link" onClick={() => startEditChallenge(c)}>Edit</button>
                    {' - '}
                    <button type="button" className="sd-text-link" onClick={() => toggleChallenge(c)}>{c.active ? 'Hide' : 'Show'}</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
