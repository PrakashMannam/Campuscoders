import React, { useMemo } from 'react';

/**
 * GitHub/Codolio-style Activity Heatmap Calendar
 * Shows daily activity intensity with color-coded cells.
 * 
 * Props:
 *   - activityData: array of { date: "YYYY-MM-DD", count: number }
 *   - year: optional year to display (defaults to current)
 */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

// Yellow/amber color scale (like GitHub but in warm tones)
const COLOR_LEVELS = [
  '#f3f4f6',  // 0: no activity (light gray)
  '#fef9c3',  // 1-2: very light yellow
  '#fde68a',  // 3-4: light yellow
  '#fbbf24',  // 5-7: golden yellow
  '#d97706',  // 8-10: amber/orange
  '#92400e',  // 11+: deep brown
];

function getColorLevel(count) {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 4) return 2;
  if (count <= 7) return 3;
  if (count <= 10) return 4;
  return 5;
}

function generateMockActivityData(yearStr) {
  const data = [];
  let startDate, endDate;
  
  if (yearStr === 'past_year') {
    endDate = new Date();
    startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 11); // Last 11 months + current = 12 months
    startDate.setDate(1);
  } else {
    const yearNum = parseInt(yearStr, 10);
    startDate = new Date(yearNum, 0, 1);
    endDate = new Date(yearNum, 11, 31);
    const today = new Date();
    if (endDate > today) endDate = today;
  }

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    // Random activity: 70% chance of 0, otherwise 1-15
    const rand = Math.random();
    let count = 0;
    if (rand > 0.3) {
      count = Math.floor(Math.random() * 12) + 1;
    }
    data.push({ date: dateStr, count });
  }
  return data;
}

export default function ActivityHeatmap({ activityData }) {
  const [selectedYear, setSelectedYear] = React.useState('past_year');
  const currentYearNum = new Date().getFullYear();

  // Use provided data or generate mock data
  const data = useMemo(() => {
    if (activityData && activityData.length > 0) return activityData;
    return generateMockActivityData(selectedYear);
  }, [activityData, selectedYear]);

  // Create a map for quick lookup
  const dataMap = useMemo(() => {
    const map = {};
    data.forEach(d => { map[d.date] = d.count; });
    return map;
  }, [data]);

  // Generate months grid
  const monthsGrid = useMemo(() => {
    let startDate, endDate;
    if (selectedYear === 'past_year') {
      endDate = new Date();
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 11); // Exactly 12 months including current
      startDate.setDate(1);
    } else {
      const yearNum = parseInt(selectedYear, 10);
      startDate = new Date(yearNum, 0, 1);
      endDate = new Date(yearNum, 11, 31);
    }
    
    const grid = [];
    
    let curr = new Date(startDate);
    curr.setDate(1);

    while (curr <= endDate) {
      const m = curr.getMonth();
      const y = curr.getFullYear();
      
      const monthWeeks = [];
      let week = [];
      
      const firstDay = new Date(y, m, 1).getDay();
      for (let i = 0; i < firstDay; i++) {
        week.push(null); 
      }
      
      const daysInMonth = new Date(y, m + 1, 0).getDate();
      for (let d = 1; d <= daysInMonth; d++) {
        const dateObj = new Date(y, m, d);
        const dateStr = [
          y,
          String(m + 1).padStart(2, '0'),
          String(d).padStart(2, '0')
        ].join('-');

        const count = dataMap[dateStr] || 0;
        const isValidDate = dateObj >= startDate && dateObj <= endDate;

        week.push({
          date: dateStr,
          count: isValidDate ? count : -1,
          dayOfWeek: dateObj.getDay(),
          month: m,
          day: d,
          year: y
        });

        if (week.length === 7) {
          monthWeeks.push(week);
          week = [];
        }
      }
      
      if (week.length > 0) {
        while (week.length < 7) {
          week.push(null);
        }
        monthWeeks.push(week);
      }
      
      grid.push({
        month: m,
        year: y,
        weeks: monthWeeks,
        label: MONTHS[m] + (selectedYear === 'past_year' && (m === 0 || grid.length === 0) ? ` '${String(y).slice(2)}` : '')
      });

      curr.setMonth(curr.getMonth() + 1);
    }
    
    return grid;
  }, [dataMap, selectedYear]);

  // Calculate total activity
  const totalActivity = useMemo(() => {
    return data.reduce((sum, d) => sum + d.count, 0);
  }, [data]);

  const activeDays = useMemo(() => {
    return data.filter(d => d.count > 0).length;
  }, [data]);

  return (
    <div className="activity-heatmap-container" style={{
      background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px',
      padding: '20px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
      width: '100%', boxSizing: 'border-box', overflow: 'hidden'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#111827', margin: 0 }}>
            📊 Activity Calendar
          </h3>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(e.target.value)}
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              fontSize: '0.8rem',
              color: '#475569',
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="past_year">Current</option>
            <option value={currentYearNum}>{currentYearNum}</option>
            <option value={currentYearNum - 1}>{currentYearNum - 1}</option>
            <option value={currentYearNum - 2}>{currentYearNum - 2}</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: '16px', fontSize: '0.78rem', color: '#64748b' }}>
          <span><strong style={{ color: '#d97706' }}>{totalActivity}</strong> problems solved</span>
          <span><strong style={{ color: '#10b981' }}>{activeDays}</strong> active days</span>
        </div>
      </div>

      <div style={{ overflowX: 'auto', paddingBottom: '8px' }}>
        <div style={{ display: 'inline-block', minWidth: '700px' }}>
          <div style={{ display: 'flex', gap: '12px', marginTop: '0px' }}>
            {/* Day labels */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginRight: '4px', paddingTop: '20px' }}>
              {DAYS.map((day, i) => (
                <div key={i} style={{
                  width: '28px', height: '11px', fontSize: '0.62rem',
                  color: '#94a3b8', display: 'flex', alignItems: 'center',
                  fontWeight: 600,
                }}>
                  {day}
                </div>
              ))}
            </div>

            {/* Months grid */}
            {monthsGrid.map((monthData, mIdx) => (
              <div key={mIdx} style={{ display: 'flex', flexDirection: 'column' }}>
                {/* Month label */}
                <div style={{
                  fontSize: '0.68rem',
                  color: '#94a3b8',
                  fontWeight: 600,
                  marginBottom: '4px',
                  height: '16px',
                  display: 'flex',
                  alignItems: 'flex-end'
                }}>
                  {monthData.label}
                </div>
                
                {/* Weeks of this month */}
                <div style={{ display: 'flex', gap: '2px' }}>
                  {monthData.weeks.map((week, wIdx) => (
                    <div key={wIdx} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {week.map((day, dIdx) => {
                        if (!day) {
                          return <div key={dIdx} style={{ width: '11px', height: '11px' }} />;
                        }
                        const level = day.count >= 0 ? getColorLevel(day.count) : -1;
                        return (
                          <div
                            key={dIdx}
                            title={day.count >= 0 ? `${day.date}: ${day.count} problems solved` : ''}
                            style={{
                              width: '11px',
                              height: '11px',
                              borderRadius: '2px',
                              background: level < 0 ? 'transparent' : COLOR_LEVELS[level],
                              border: level >= 0 ? '1px solid rgba(0,0,0,0.04)' : 'none',
                              cursor: level >= 0 ? 'pointer' : 'default',
                              transition: 'transform 0.15s',
                            }}
                            onMouseEnter={e => {
                              if (level >= 0) e.currentTarget.style.transform = 'scale(1.4)';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.transform = 'scale(1)';
                            }}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
            gap: '4px', marginTop: '12px', fontSize: '0.68rem', color: '#94a3b8'
          }}>
            <span>Less</span>
            {COLOR_LEVELS.map((color, i) => (
              <div key={i} style={{
                width: '11px', height: '11px', borderRadius: '2px',
                background: color, border: '1px solid rgba(0,0,0,0.04)'
              }} />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
