import React, { useMemo, useState, useCallback } from 'react';
import { FiAward, FiRefreshCw, FiGift } from 'react-icons/fi';
import Toast from '../../components/Toast';
import { MOCK_USERS, MOCK_BADGES, DEFAULT_POINT_RULES, loadStore, saveStore } from './adminMockData';

export default function AdminManageLeaderboard() {
  const [users, setUsers] = useState(() => loadStore('users', MOCK_USERS).filter(u => u.role === 'STUDENT' && !u.banned));
  const [rules, setRules] = useState(() => loadStore('pointRules', DEFAULT_POINT_RULES));
  const [badgeUser, setBadgeUser] = useState(users[0]?.id || '');
  const [badgeId, setBadgeId] = useState(MOCK_BADGES[0].id);
  const [awarded, setAwarded] = useState(() => loadStore('awardedBadges', []));

  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });
  const showToast = useCallback((type, message) => setToast({ show: true, type, message }), []);
  const hideToast = useCallback(() => setToast(prev => ({ ...prev, show: false })), []);

  const standings = useMemo(
    () => [...users].sort((a, b) => b.totalXp - a.totalXp || b.problemsSolved - a.problemsSolved),
    [users]
  );

  const resetBoard = (period) => {
    const next = users.map(u => ({ ...u, totalXp: period === 'weekly' ? Math.round(u.totalXp * 0.15) : 0, dailyStreak: period === 'monthly' ? 0 : u.dailyStreak }));
    setUsers(next);
    saveStore('users', loadStore('users', MOCK_USERS).map(u => next.find(n => n.id === u.id) || u));
    showToast('info', `${period === 'weekly' ? 'Weekly' : 'Monthly'} leaderboard reset simulated.`);
  };

  const grantBadge = () => {
    const user = users.find(u => String(u.id) === String(badgeUser));
    const badge = MOCK_BADGES.find(b => b.id === badgeId);
    const entry = { id: Date.now(), user: user?.fullName, badge: badge?.name, emoji: badge?.emoji };
    const next = [entry, ...awarded];
    setAwarded(next);
    saveStore('awardedBadges', next);
    showToast('success', `${badge.emoji} ${badge.name} awarded to ${user.fullName}.`);
  };

  const saveRules = () => {
    saveStore('pointRules', rules);
    showToast('success', 'Point algorithm updated for new submissions.');
  };

  return (
    <div>
      <Toast type={toast.type} message={toast.message} show={toast.show} onClose={hideToast} />
      <div style={{ marginBottom: '20px' }}>
        <h1 className="ap-page-title">Leaderboard & gamification</h1>
        <p className="ap-page-sub">Standings, seasonal resets, custom medals and scoring weights</p>
      </div>

      <div className="ap-grid-2 ap-grid-cal">
        <div className="ap-card-solid">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', gap: '8px', flexWrap: 'wrap' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><FiAward color="#d4af37" /> Current standings</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="ap-ghost-btn" onClick={() => resetBoard('weekly')}><FiRefreshCw /> Weekly reset</button>
              <button className="ap-ghost-btn" onClick={() => resetBoard('monthly')}><FiRefreshCw /> Monthly reset</button>
            </div>
          </div>
          <div className="ap-table-wrap">
            <table className="ap-table">
              <thead>
                <tr><th>Rank</th><th>Student</th><th>XP</th><th>Solved</th><th>Streak</th></tr>
              </thead>
              <tbody>
                {standings.map((u, i) => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 800, color: i < 3 ? '#d97706' : '#64748b' }}>#{i + 1}</td>
                    <td style={{ fontWeight: 700, color: '#111827' }}>{u.fullName}</td>
                    <td>{u.totalXp.toLocaleString()}</td>
                    <td>{u.problemsSolved}</td>
                    <td>🔥 {u.dailyStreak}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '16px' }}>
          <div className="ap-card-solid">
            <h3 style={{ margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '8px' }}><FiGift color="#d97706" /> Award badge</h3>
            <select className="form-select" value={badgeUser} onChange={e => setBadgeUser(e.target.value)} style={{ width: '100%', marginBottom: '10px', padding: '10px', borderRadius: '10px' }}>
              {users.map(u => <option key={u.id} value={u.id}>{u.fullName}</option>)}
            </select>
            <select className="form-select" value={badgeId} onChange={e => setBadgeId(e.target.value)} style={{ width: '100%', marginBottom: '12px', padding: '10px', borderRadius: '10px' }}>
              {MOCK_BADGES.map(b => <option key={b.id} value={b.id}>{b.emoji} {b.name}</option>)}
            </select>
            <button className="btn btn-primary" type="button" onClick={grantBadge}>Distribute medal</button>
            <div style={{ marginTop: '16px' }}>
              {awarded.slice(0, 4).map(a => (
                <div key={a.id} style={{ fontSize: '0.82rem', color: '#4b5563', marginBottom: '6px' }}>{a.emoji} {a.badge} → <strong>{a.user}</strong></div>
              ))}
            </div>
          </div>

          <div className="ap-card-solid">
            <h3 style={{ margin: '0 0 12px' }}>Point algorithm</h3>
            {[
              ['easy', 'Easy problem'],
              ['medium', 'Medium problem'],
              ['hard', 'Hard problem'],
              ['streakBonus', 'Daily streak bonus'],
              ['firstBlood', 'First blood'],
            ].map(([key, label]) => (
              <label key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>
                {label}
                <input type="number" value={rules[key]} onChange={e => setRules({ ...rules, [key]: Number(e.target.value) })}
                  style={{ width: '80px', padding: '6px 8px', borderRadius: '8px', border: '1px solid #d1d5db', fontWeight: 700 }} />
              </label>
            ))}
            <button className="btn btn-primary" type="button" onClick={saveRules}>Save scoring</button>
          </div>
        </div>
      </div>
    </div>
  );
}
