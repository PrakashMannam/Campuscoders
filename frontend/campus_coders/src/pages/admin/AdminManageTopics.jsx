import React, { useState, useCallback } from 'react';
import { FiPlus, FiX, FiBookOpen } from 'react-icons/fi';
import Toast from '../../components/Toast';
import { MOCK_TOPICS, MOCK_PATHS, loadStore, saveStore } from './adminMockData';

const ICONS = ['🐍', '☕', '🧩', '🔗', '🌿', '#️⃣', '🕸', '⚙️', '🧠', '🚀', '📘', '💡'];
const COLORS = ['#d97706', '#059669', '#4f46e5', '#0ea5e9', '#db2777', '#7c3aed', '#ea580c', '#0d9488'];

export default function AdminManageTopics() {
  const [topics, setTopics] = useState(() => loadStore('topics', MOCK_TOPICS));
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', pathId: MOCK_PATHS[0].id, icon: '📘', color: '#d97706', description: '' });

  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });
  const showToast = useCallback((type, message) => setToast({ show: true, type, message }), []);
  const hideToast = useCallback(() => setToast(prev => ({ ...prev, show: false })), []);

  const persist = (next) => { setTopics(next); saveStore('topics', next); };

  const create = (e) => {
    e.preventDefault();
    persist([{ id: Date.now(), ...form, pathId: Number(form.pathId), resources: 0 }, ...topics]);
    setModal(false);
    showToast('success', `Topic “${form.name}” created.`);
  };

  const pathName = (id) => MOCK_PATHS.find(p => p.id === id)?.name || 'Unassigned';

  return (
    <div>
      <Toast type={toast.type} message={toast.message} show={toast.show} onClose={hideToast} />
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <div>
          <h1 className="ap-page-title">Topics</h1>
          <p className="ap-page-sub">Color-coded building blocks of every learning path</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}><FiPlus /> New Topic</button>
      </div>

      <div className="ap-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '18px' }}>
        {topics.map(topic => (
          <div key={topic.id} className="ap-topic-card">
            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${topic.color}18, transparent 60%)`, pointerEvents: 'none' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
              <span style={{ fontSize: '1.8rem' }}>{topic.icon}</span>
              <span className="ap-badge" style={{ background: `${topic.color}22`, color: topic.color }}>{topic.resources} resources</span>
            </div>
            <h3 style={{ margin: '14px 0 6px', fontSize: '1.05rem' }}>{topic.name}</h3>
            <p style={{ color: '#64748b', fontSize: '0.82rem', margin: 0, minHeight: '40px' }}>{topic.description}</p>
            <div style={{ marginTop: '14px', fontSize: '0.75rem', fontWeight: 700, color: '#92400e', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FiBookOpen size={13} /> {pathName(topic.pathId)}
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="ap-overlay" onClick={() => setModal(false)}>
          <div className="ap-modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0 }}>Create topic</h3>
              <button className="ap-icon-btn" onClick={() => setModal(false)}><FiX /></button>
            </div>
            <form onSubmit={create} style={{ marginTop: '18px' }}>
              <label style={{ fontWeight: 700, fontSize: '0.82rem' }}>Name</label>
              <input className="form-input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                style={{ width: '100%', margin: '6px 0 14px', padding: '10px', borderRadius: '10px', border: '1px solid #d1d5db' }} />
              <label style={{ fontWeight: 700, fontSize: '0.82rem' }}>Learning path</label>
              <select className="form-select" value={form.pathId} onChange={e => setForm({ ...form, pathId: e.target.value })}
                style={{ width: '100%', margin: '6px 0 14px', padding: '10px', borderRadius: '10px' }}>
                {MOCK_PATHS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <label style={{ fontWeight: 700, fontSize: '0.82rem' }}>Description</label>
              <textarea className="form-input" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                style={{ width: '100%', margin: '6px 0 14px', padding: '10px', borderRadius: '10px', border: '1px solid #d1d5db' }} />
              <label style={{ fontWeight: 700, fontSize: '0.82rem' }}>Icon</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '8px 0 14px' }}>
                {ICONS.map(icon => (
                  <button type="button" key={icon} onClick={() => setForm({ ...form, icon })}
                    style={{ width: '40px', height: '40px', borderRadius: '10px', border: form.icon === icon ? '2px solid #d97706' : '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '1.1rem' }}>{icon}</button>
                ))}
              </div>
              <label style={{ fontWeight: 700, fontSize: '0.82rem' }}>Color</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '8px 0 18px' }}>
                {COLORS.map(color => (
                  <button type="button" key={color} onClick={() => setForm({ ...form, color })}
                    style={{ width: '32px', height: '32px', borderRadius: '50%', background: color, border: form.color === color ? '3px solid #111827' : '3px solid transparent', cursor: 'pointer' }} />
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" className="ap-ghost-btn" onClick={() => setModal(false)}>Cancel</button>
                <button className="btn btn-primary" type="submit">Create topic</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
