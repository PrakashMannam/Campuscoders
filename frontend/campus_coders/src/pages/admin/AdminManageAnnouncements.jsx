import React, { useState, useCallback } from 'react';
import { FiSend, FiBell, FiVolume2 } from 'react-icons/fi';
import Toast from '../../components/Toast';
import { MOCK_ANNOUNCEMENTS, loadStore, saveStore } from './adminMockData';

const AUDIENCES = ['All Users', 'Active this week', 'Beginners'];
const CATEGORIES = ['SYSTEM', 'ACADEMIC', 'EVENT', 'HACKATHON'];

export default function AdminManageAnnouncements() {
  const [items, setItems] = useState(() => loadStore('announcements', MOCK_ANNOUNCEMENTS));
  const [tab, setTab] = useState('banner');
  const [form, setForm] = useState({ title: '', message: '', category: 'SYSTEM', audience: 'All Users' });

  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });
  const showToast = useCallback((type, message) => setToast({ show: true, type, message }), []);
  const hideToast = useCallback(() => setToast(prev => ({ ...prev, show: false })), []);

  const persist = (next) => { setItems(next); saveStore('announcements', next); };

  const catColor = (c) => ({
    SYSTEM: { bg: '#EEF2FF', color: '#4F46E5' },
    ACADEMIC: { bg: '#ECFDF5', color: '#059669' },
    EVENT: { bg: '#FEF3C7', color: '#D97706' },
    HACKATHON: { bg: '#FCE7F3', color: '#DB2777' },
  }[c] || { bg: '#F1F5F9', color: '#475569' });

  const send = (e) => {
    e.preventDefault();
    persist([{
      id: Date.now(),
      ...form,
      channel: tab,
      published: true,
      createdAt: new Date().toISOString(),
    }, ...items]);
    setForm({ title: '', message: '', category: 'SYSTEM', audience: 'All Users' });
    showToast('success', tab === 'banner' ? 'Banner announcement published.' : `Push notification queued for ${form.audience}.`);
  };

  const visible = items.filter(i => i.channel === tab);

  return (
    <div>
      <Toast type={toast.type} message={toast.message} show={toast.show} onClose={hideToast} />
      <div style={{ marginBottom: '20px' }}>
        <h1 className="ap-page-title">Announcements</h1>
        <p className="ap-page-sub">Broadcast campus banners or send targeted push / email alerts</p>
      </div>

      <div className="ap-tabs">
        <button className={`ap-tab ${tab === 'banner' ? 'active' : ''}`} onClick={() => setTab('banner')}><FiVolume2 /> Platform Announcements</button>
        <button className={`ap-tab ${tab === 'push' ? 'active' : ''}`} onClick={() => setTab('push')}><FiBell /> Push Notifications</button>
      </div>

      <div className="ap-grid-2">
        <form className="ap-card-solid" onSubmit={send}>
          <h3 style={{ margin: '0 0 16px' }}>{tab === 'banner' ? 'Compose site banner' : 'Compose direct alert'}</h3>
          {tab === 'push' && (
            <p style={{ fontSize: '0.82rem', color: '#92400e', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '10px 12px', marginBottom: '14px' }}>
              Delivery is mocked until the notification service is wired. Recipients will appear as queued in this console.
            </p>
          )}
          <label style={{ fontWeight: 700, fontSize: '0.82rem' }}>Title</label>
          <input required className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
            style={{ width: '100%', margin: '6px 0 14px', padding: '10px', borderRadius: '10px', border: '1px solid #d1d5db' }} />
          <div className="ap-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontWeight: 700, fontSize: '0.82rem' }}>Category</label>
              <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ width: '100%', marginTop: '6px', padding: '10px', borderRadius: '10px' }}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontWeight: 700, fontSize: '0.82rem' }}>Target group</label>
              <select className="form-select" value={form.audience} onChange={e => setForm({ ...form, audience: e.target.value })} style={{ width: '100%', marginTop: '6px', padding: '10px', borderRadius: '10px' }}>
                {AUDIENCES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <label style={{ fontWeight: 700, fontSize: '0.82rem', display: 'block', margin: '14px 0 6px' }}>Message</label>
          <textarea required rows={5} className="form-input" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
            style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #d1d5db' }} />
          <button className="btn btn-primary" type="submit" style={{ marginTop: '16px' }}><FiSend /> {tab === 'banner' ? 'Publish banner' : 'Queue push / email'}</button>
        </form>

        <div className="ap-card-solid">
          <h3 style={{ margin: '0 0 16px' }}>{tab === 'banner' ? 'Live banners' : 'Queued alerts'}</h3>
          {visible.length === 0 && <p style={{ color: '#94a3b8' }}>Nothing in this channel yet.</p>}
          {visible.map(item => {
            const col = catColor(item.category);
            return (
              <div key={item.id} style={{ border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px', marginBottom: '12px', background: 'linear-gradient(180deg, #ffffff, #f8fafc)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                  <strong>{item.title}</strong>
                  <span className="ap-badge" style={{ background: col.bg, color: col.color }}>{item.category}</span>
                </div>
                <p style={{ color: '#4b5563', fontSize: '0.85rem', margin: '8px 0' }}>{item.message}</p>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
                  {item.audience} · {new Date(item.createdAt).toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
