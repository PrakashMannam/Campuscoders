import React, { useState, useCallback } from 'react';
import { FiSave } from 'react-icons/fi';
import Toast from '../../components/Toast';
import { DEFAULT_SETTINGS, loadStore, saveStore } from './adminMockData';

function Toggle({ on, onChange }) {
  return (
    <label className="ap-toggle">
      <input type="checkbox" checked={on} onChange={e => onChange(e.target.checked)} />
      <i />
    </label>
  );
}

export default function AdminSettings() {
  const [tab, setTab] = useState('general');
  const [settings, setSettings] = useState(() => loadStore('settings', DEFAULT_SETTINGS));
  const [logoName, setLogoName] = useState('');

  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });
  const showToast = useCallback((type, message) => setToast({ show: true, type, message }), []);
  const hideToast = useCallback(() => setToast(prev => ({ ...prev, show: false })), []);

  const set = (key, value) => setSettings(s => ({ ...s, [key]: value }));

  const save = (e) => {
    e?.preventDefault();
    saveStore('settings', settings);
    showToast('success', 'Platform settings saved locally.');
  };

  const field = (label, key, type = 'text') => (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ display: 'block', fontWeight: 700, fontSize: '0.82rem', marginBottom: '6px' }}>{label}</label>
      <input type={type} className="form-input" value={settings[key]} onChange={e => set(key, e.target.value)}
        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #d1d5db' }} />
    </div>
  );

  return (
    <div>
      <Toast type={toast.type} message={toast.message} show={toast.show} onClose={hideToast} />
      <div style={{ marginBottom: '20px' }}>
        <h1 className="ap-page-title">Platform settings</h1>
        <p className="ap-page-sub">General branding, security posture and maintenance controls</p>
      </div>

      <div className="ap-tabs">
        <button className={`ap-tab ${tab === 'general' ? 'active' : ''}`} onClick={() => setTab('general')}>General</button>
        <button className={`ap-tab ${tab === 'security' ? 'active' : ''}`} onClick={() => setTab('security')}>Security</button>
        <button className={`ap-tab ${tab === 'maintenance' ? 'active' : ''}`} onClick={() => setTab('maintenance')}>Maintenance</button>
      </div>

      <form className="ap-card-solid" onSubmit={save} style={{ maxWidth: 720 }}>
        {tab === 'general' && (
          <>
            {field('Platform name', 'platformName')}
            {field('Contact email', 'contactEmail', 'email')}
            {field('Support email', 'supportEmail', 'email')}
            {field('Twitter / X', 'twitter', 'url')}
            {field('GitHub', 'github', 'url')}
            {field('LinkedIn', 'linkedin', 'url')}
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.82rem', marginBottom: '6px' }}>Brand gold</label>
            <input type="color" value={settings.brandPrimary} onChange={e => set('brandPrimary', e.target.value)} style={{ width: 64, height: 40, border: 'none', background: 'none', marginBottom: 16 }} />
            <label className="ap-drop-zone" style={{ display: 'block', marginBottom: 8 }}>
              <input type="file" accept="image/*" hidden onChange={e => setLogoName(e.target.files?.[0]?.name || '')} />
              {logoName || 'Upload wordmark / favicon (mocked)'}
            </label>
          </>
        )}

        {tab === 'security' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div>
                <strong>Require email verification</strong>
                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.82rem' }}>New accounts stay pending until campus mail is confirmed.</p>
              </div>
              <Toggle on={settings.requireEmailVerify} onChange={v => set('requireEmailVerify', v)} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div>
                <strong>Admin 2FA</strong>
                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.82rem' }}>Force TOTP on every operator role.</p>
              </div>
              <Toggle on={settings.twoFactorAdmins} onChange={v => set('twoFactorAdmins', v)} />
            </div>
            {field('Session length (hours)', 'sessionHours', 'number')}
          </>
        )}

        {tab === 'maintenance' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, padding: 16, borderRadius: 12, background: settings.maintenanceMode ? '#FEF2F2' : '#F8FAFC', border: '1px solid #e2e8f0' }}>
              <div>
                <strong>Enable maintenance mode</strong>
                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.82rem' }}>Students see a branded pause screen; admins stay signed in.</p>
              </div>
              <Toggle on={settings.maintenanceMode} onChange={v => set('maintenanceMode', v)} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div>
                <strong>Allow new registrations</strong>
                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.82rem' }}>Disable during admissions freeze or exam week.</p>
              </div>
              <Toggle on={settings.allowRegistrations} onChange={v => set('allowRegistrations', v)} />
            </div>
          </>
        )}

        <button className="btn btn-primary" type="submit" style={{ marginTop: 8 }}><FiSave /> Save settings</button>
      </form>
    </div>
  );
}
