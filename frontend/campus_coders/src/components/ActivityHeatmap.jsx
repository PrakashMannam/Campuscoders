import React, { useMemo } from 'react';
import BrandMark from './BrandMark';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

const COLOR_LEVELS = [
  '#f3f4f6',
  '#fef3c7',
  '#fde68a',
  '#fbbf24',
  '#d97706',
  '#92400e',
];

function getColorLevel(count) {
  if (count <= 0) return 0;
  if (count <= 2) return 1;
  if (count <= 4) return 2;
  if (count <= 7) return 3;
  if (count <= 10) return 4;
  return 5;
}

function friendlyMessage(message) {
  if (!message) return '';
  const text = String(message);
  const lower = text.toLowerCase();
  if (lower.includes('github_token') || lower.includes('server token') || lower.includes('classic pat')) {
    return 'GitHub activity isn’t available right now.';
  }
  if (lower.includes('graphql') || lower.includes('pat with')) {
    return 'Couldn’t load this calendar right now.';
  }
  return text;
}

export default function ActivityHeatmap({
  brand = 'LeetCode',
  title = 'LeetCode activity',
  countLabel = 'submissions',
  streakLabel = 'streak',
  note = 'From your public LeetCode profile. Not a Campus Coders rank.',
  activityData = [],
  year,
  yearOptions,
  onYearChange,
  username,
  streak,
  totalActiveDays,
  totalActivity,
  totalSolved,
  easySolved,
  mediumSolved,
  hardSolved,
  ranking,
  loading,
  message,
}) {
  const currentYearNum = new Date().getFullYear();
  const selectedYear = year || currentYearNum;

  const years = useMemo(() => {
    const fromApi = (yearOptions || []).filter((value) => Number.isFinite(value));
    const merged = fromApi.length
      ? [...new Set([...fromApi, currentYearNum, selectedYear])]
      : [currentYearNum, currentYearNum - 1, currentYearNum - 2];
    return merged.sort((a, b) => b - a);
  }, [yearOptions, currentYearNum, selectedYear]);

  const dataMap = useMemo(() => {
    const map = {};
    (activityData || []).forEach((d) => { map[d.date] = d.count; });
    return map;
  }, [activityData]);

  const monthsGrid = useMemo(() => {
    const startDate = new Date(selectedYear, 0, 1);
    const endDate = new Date(selectedYear, 11, 31);
    const grid = [];
    const curr = new Date(startDate);

    while (curr <= endDate) {
      const m = curr.getMonth();
      const y = curr.getFullYear();
      const monthWeeks = [];
      let week = [];
      const firstDay = new Date(y, m, 1).getDay();
      for (let i = 0; i < firstDay; i += 1) week.push(null);

      const daysInMonth = new Date(y, m + 1, 0).getDate();
      for (let d = 1; d <= daysInMonth; d += 1) {
        const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).toString().padStart(2, '0')}`;
        week.push({
          date: dateStr,
          count: dataMap[dateStr] || 0,
        });
        if (week.length === 7) {
          monthWeeks.push(week);
          week = [];
        }
      }
      if (week.length > 0) {
        while (week.length < 7) week.push(null);
        monthWeeks.push(week);
      }
      grid.push({ month: m, weeks: monthWeeks, label: MONTHS[m] });
      curr.setMonth(curr.getMonth() + 1);
    }
    return grid;
  }, [dataMap, selectedYear]);

  const summedActivity = useMemo(
    () => (activityData || []).reduce((sum, d) => sum + (d.count || 0), 0),
    [activityData]
  );
  const displayedTotal = totalActivity ?? summedActivity;
  const displayMessage = friendlyMessage(message);
  const hasSolved = totalSolved != null;
  const hasCalendarStats = displayedTotal > 0 || (activityData || []).length > 0 || streak != null || totalActiveDays != null;

  return (
    <div className="pf-card pf-heatmap">
      <div className="pf-heatmap-head">
        <div className="pf-heatmap-title">
          <BrandMark name={brand} size={18} />
          <h3>{title}</h3>
          {username && <span className="sd-muted">@{username}</span>}
          <select
            value={selectedYear}
            onChange={(e) => onYearChange?.(Number(e.target.value))}
            aria-label="Calendar year"
          >
            {years.map((optionYear) => (
              <option key={optionYear} value={optionYear}>{optionYear}</option>
            ))}
          </select>
        </div>
        {!loading && hasCalendarStats && (
          <div className="pf-heatmap-stats">
            <span><strong>{displayedTotal}</strong> {countLabel}</span>
            <span><strong>{totalActiveDays ?? activityData.filter((d) => d.count > 0).length}</strong> active days</span>
            {streak != null && <span><strong>{streak}</strong> {streakLabel}</span>}
          </div>
        )}
      </div>

      {!loading && hasSolved && (
        <div className="pf-heatmap-solved">
          <span><strong>{totalSolved}</strong> solved</span>
          <span>Easy {easySolved ?? 0}</span>
          <span>Medium {mediumSolved ?? 0}</span>
          <span>Hard {hardSolved ?? 0}</span>
          {ranking != null && ranking > 0 && <span>Rank {ranking.toLocaleString()}</span>}
        </div>
      )}

      {loading ? (
        <p className="sd-muted">Loading calendar...</p>
      ) : displayMessage && !hasSolved && activityData.length === 0 ? (
        <p className="sd-muted">{displayMessage}</p>
      ) : (
        <div className="pf-heatmap-scroll">
          <div className="pf-heatmap-grid">
            <div className="pf-heatmap-days">
              {DAYS.map((day, i) => (
                <div key={i}>{day}</div>
              ))}
            </div>
            {monthsGrid.map((monthData) => (
              <div key={monthData.month} className="pf-heatmap-month">
                <div className="pf-heatmap-month-label">{monthData.label}</div>
                <div className="pf-heatmap-weeks">
                  {monthData.weeks.map((week, wIdx) => (
                    <div key={wIdx} className="pf-heatmap-week">
                      {week.map((day, dIdx) => {
                        if (!day) return <div key={dIdx} className="pf-heat-cell empty" />;
                        const level = getColorLevel(day.count);
                        return (
                          <div
                            key={dIdx}
                            className="pf-heat-cell"
                            title={`${day.date}: ${day.count} ${countLabel}`}
                            style={{ background: COLOR_LEVELS[level] }}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="pf-heatmap-legend">
            <span>Less</span>
            {COLOR_LEVELS.map((color) => (
              <div key={color} className="pf-heat-cell" style={{ background: color }} />
            ))}
            <span>More</span>
          </div>
        </div>
      )}
      {note ? <p className="pf-heatmap-note">{note}</p> : null}
    </div>
  );
}
