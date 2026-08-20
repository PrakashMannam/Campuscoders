import React from 'react';
import { FiUsers, FiActivity, FiCode, FiTrendingUp } from 'react-icons/fi';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar
} from 'recharts';

const submissions = [
  { day: 'Mon', value: 420 },
  { day: 'Tue', value: 510 },
  { day: 'Wed', value: 388 },
  { day: 'Thu', value: 640 },
  { day: 'Fri', value: 720 },
  { day: 'Sat', value: 290 },
  { day: 'Sun', value: 210 },
];

const topics = [
  { name: 'Arrays', value: 312 },
  { name: 'Graphs', value: 248 },
  { name: 'DP', value: 190 },
  { name: 'Django', value: 164 },
  { name: 'Spring', value: 141 },
];

const stats = [
  { label: 'Total Users', value: '2,481', delta: '+4.2%', icon: <FiUsers size={22} />, color: '#4f46e5', bg: '#EEF2FF' },
  { label: 'Daily Active Users', value: '864', delta: '+12%', icon: <FiActivity size={22} />, color: '#059669', bg: '#ECFDF5' },
  { label: 'Total Submissions', value: '38.4k', delta: '+9.1%', icon: <FiCode size={22} />, color: '#d97706', bg: '#FFFBEB' },
  { label: '7-day retention', value: '61%', delta: '+2.0%', icon: <FiTrendingUp size={22} />, color: '#db2777', bg: '#FDF2F8' },
];

export default function AdminReports() {
  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 className="ap-page-title">Analytics</h1>
        <p className="ap-page-sub">Mock campus telemetry — swap these series for live warehouse queries later</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {stats.map(s => (
          <div key={s.label} className="ap-stat">
            <div className="ap-stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.4px', textTransform: 'uppercase' }}>{s.label}</div>
              <div style={{ fontSize: '1.55rem', fontWeight: 800, color: '#0f172a' }}>{s.value}</div>
              <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700 }}>{s.delta} vs last week</div>
            </div>
          </div>
        ))}
      </div>

      <div className="ap-grid-2 ap-grid-cal">
        <div className="ap-card-solid">
          <h3 style={{ margin: '0 0 8px' }}>Submissions over time</h3>
          <p style={{ color: '#64748b', fontSize: '0.82rem', margin: '0 0 12px' }}>Judge traffic for the current academic week</p>
          <div style={{ height: 280 }} className="ap-chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={submissions}>
                <defs>
                  <linearGradient id="goldFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d4af37" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#d4af37" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} />
                <Area type="monotone" dataKey="value" stroke="#d97706" strokeWidth={3} fill="url(#goldFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="ap-card-solid">
          <h3 style={{ margin: '0 0 8px' }}>Most popular topics</h3>
          <p style={{ color: '#64748b', fontSize: '0.82rem', margin: '0 0 12px' }}>Resource opens + POTD attempts</p>
          <div style={{ height: 280 }} className="ap-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topics} layout="vertical" margin={{ left: 12 }}>
                <CartesianGrid stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#334155', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} width={70} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} />
                <Bar dataKey="value" fill="#d4af37" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
