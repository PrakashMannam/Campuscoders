import React, { useMemo, useState, useCallback } from 'react';
import { FiPlus, FiTrash2, FiX, FiCalendar, FiEye, FiEyeOff } from 'react-icons/fi';
import Toast from '../../components/Toast';
import { MOCK_CHALLENGES, loadStore, saveStore } from './adminMockData';

const YEAR = 2026;
const MONTH = 7; // August (0-indexed)

function monthCells() {
  const first = new Date(YEAR, MONTH, 1).getDay();
  const days = new Date(YEAR, MONTH + 1, 0).getDate();
  const cells = Array(first).fill(null);
  for (let d = 1; d <= days; d++) cells.push(d);
  return cells;
}

const emptyForm = {
  title: '',
  difficulty: 'EASY',
  description: '',
  constraints: '',
  scheduledDate: '2026-08-20',
  tests: [{ input: '', output: '', hidden: false }],
};

export default function AdminManageChallenges() {
  const [challenges, setChallenges] = useState(() => loadStore('challenges', MOCK_CHALLENGES));
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [selectedDay, setSelectedDay] = useState(20);
  const [descMode, setDescMode] = useState('write');

  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });
  const showToast = useCallback((type, message) => setToast({ show: true, type, message }), []);
  const hideToast = useCallback(() => setToast(prev => ({ ...prev, show: false })), []);

  const persist = (next) => { setChallenges(next); saveStore('challenges', next); };
  const byDate = useMemo(() => {
    const map = {};
    challenges.forEach(c => { map[c.scheduledDate] = c; });
    return map;
  }, [challenges]);

  const isoFor = (day) => `2026-08-${String(day).padStart(2, '0')}`;

  const saveProblem = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      id: Date.now(),
      scheduledDate: isoFor(selectedDay),
      live: isoFor(selectedDay) === '2026-08-20',
      tests: form.tests.filter(t => t.input && t.output),
    };
    persist([payload, ...challenges.filter(c => c.scheduledDate !== payload.scheduledDate)]);
    setShowForm(false);
    setForm(emptyForm);
    showToast('success', `Scheduled “${payload.title}” for ${payload.scheduledDate}.`);
  };

  const diffColor = (d) => d === 'EASY' ? { bg: '#ECFDF5', color: '#059669' } : d === 'MEDIUM' ? { bg: '#FEF3C7', color: '#D97706' } : { bg: '#FEF2F2', color: '#DC2626' };

  const addTest = (hidden) => setForm({ ...form, tests: [...form.tests, { input: '', output: '', hidden }] });
  const updateTest = (i, key, value) => {
    const tests = form.tests.map((t, idx) => idx === i ? { ...t, [key]: value } : t);
    setForm({ ...form, tests });
  };

  return (
    <div>
      <Toast type={toast.type} message={toast.message} show={toast.show} onClose={hideToast} />
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <div>
          <h1 className="ap-page-title">Daily Challenges</h1>
          <p className="ap-page-sub">Author Problem of the Day, attach test cases, and schedule the calendar</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}><FiPlus /> New problem</button>
      </div>

      <div className="ap-grid-2 ap-grid-cal">
        <div className="ap-card-solid">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <FiCalendar color="#d97706" />
            <h3 style={{ margin: 0 }}>August 2026 schedule</h3>
          </div>
          <div className="ap-cal-grid" style={{ marginBottom: '8px' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="ap-cal-dow">{d}</div>
            ))}
          </div>
          <div className="ap-cal-grid">
            {monthCells().map((day, i) => {
              if (!day) return <div key={`e-${i}`} />;
              const iso = isoFor(day);
              const problem = byDate[iso];
              const selected = selectedDay === day;
              return (
                <button key={day} className={`ap-cal-cell ${selected ? 'selected' : ''}`} onClick={() => { setSelectedDay(day); setForm(f => ({ ...f, scheduledDate: iso })); }}>
                  <div style={{ fontWeight: 800, fontSize: '0.8rem' }}>{day}</div>
                  {problem && <div className="ap-cal-title">{problem.title}</div>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="ap-card-solid">
          <h3 style={{ margin: '0 0 12px' }}>Queued problems</h3>
          {challenges.map(c => {
            const col = diffColor(c.difficulty);
            return (
              <div key={c.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                  <strong>{c.title}</strong>
                  <span className="ap-badge" style={{ background: col.bg, color: col.color }}>{c.difficulty}</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>{c.scheduledDate} · {c.tests.length} tests {c.live ? '· LIVE' : ''}</div>
                <button className="ap-icon-btn" style={{ color: '#ef4444', marginTop: '4px' }} onClick={() => persist(challenges.filter(x => x.id !== c.id))}><FiTrash2 /></button>
              </div>
            );
          })}
        </div>
      </div>

      {showForm && (
        <div className="ap-overlay" onClick={() => setShowForm(false)}>
          <div className="ap-modal" style={{ width: 'min(820px, 100%)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0 }}>Post coding problem · {isoFor(selectedDay)}</h3>
              <button className="ap-icon-btn" onClick={() => setShowForm(false)}><FiX /></button>
            </div>
            <form onSubmit={saveProblem} style={{ marginTop: '16px' }}>
              <div className="ap-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: '12px' }}>
                <input className="form-input" required placeholder="Problem title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  style={{ padding: '10px', borderRadius: '10px', border: '1px solid #d1d5db' }} />
                <select className="form-select" value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })} style={{ padding: '10px', borderRadius: '10px' }}>
                  <option>EASY</option><option>MEDIUM</option><option>HARD</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '14px 0 6px' }}>
                <label style={{ fontWeight: 700, fontSize: '0.85rem' }}>Description (Markdown)</label>
                <div className="ap-tabs" style={{ margin: 0 }}>
                  <button type="button" className={`ap-tab ${descMode === 'write' ? 'active' : ''}`} onClick={() => setDescMode('write')}>Write</button>
                  <button type="button" className={`ap-tab ${descMode === 'preview' ? 'active' : ''}`} onClick={() => setDescMode('preview')}>Preview</button>
                </div>
              </div>
              {descMode === 'write' ? (
                <textarea required rows={5} className="form-input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder={'### Problem\nGiven...\n\n**Example**\n```\nInput: ...\n```'}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #d1d5db', fontFamily: 'var(--font-mono)', fontSize: '0.84rem' }} />
              ) : <div className="ap-md-preview">{form.description}</div>}

              <label style={{ fontWeight: 700, fontSize: '0.85rem', display: 'block', margin: '14px 0 6px' }}>Constraints</label>
              <textarea required rows={3} className="form-input" value={form.constraints} onChange={e => setForm({ ...form, constraints: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #d1d5db', fontFamily: 'var(--font-mono)', fontSize: '0.84rem' }} />

              <div style={{ marginTop: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>Test cases</strong>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" className="ap-ghost-btn" onClick={() => addTest(false)}><FiEye /> Visible</button>
                  <button type="button" className="ap-ghost-btn" onClick={() => addTest(true)}><FiEyeOff /> Hidden</button>
                </div>
              </div>
              {form.tests.map((t, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px', marginTop: '10px' }} className="ap-grid-3">
                  <input placeholder="Input" className="form-input" value={t.input} onChange={e => updateTest(i, 'input', e.target.value)}
                    style={{ padding: '8px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                  <input placeholder="Expected output" className="form-input" value={t.output} onChange={e => updateTest(i, 'output', e.target.value)}
                    style={{ padding: '8px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                  <span className="ap-badge" style={{ background: t.hidden ? '#EEF2FF' : '#ECFDF5', color: t.hidden ? '#4F46E5' : '#059669', alignSelf: 'center' }}>
                    {t.hidden ? 'HIDDEN' : 'VISIBLE'}
                  </span>
                </div>
              ))}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
                <button type="button" className="ap-ghost-btn" onClick={() => setShowForm(false)}>Cancel</button>
                <button className="btn btn-primary" type="submit">Schedule problem</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
