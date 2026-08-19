import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiAward, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function Leaderboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = useCallback(async (page) => {
    setLoading(true);
    try {
      const res = await api.get(`/leaderboard?page=${page}&size=15`);
      setLeaderboardData(res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error('Failed to fetch leaderboard', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard(currentPage);
  }, [currentPage, fetchLeaderboard]);

  const handlePrevPage = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
  };

  return (
    <DashboardLayout>
      <div className="lb-page">
        <button className="lb-back" onClick={() => navigate('/dashboard')}>
          <FiArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="lb-header">
          <div className="lb-header-title-wrap">
            <FiAward size={32} className="lb-header-icon" />
            <div>
              <h2 className="lb-title">Leaderboard</h2>
              <p className="lb-subtitle">
                Real-time 4-tier database tie-breaker rankings based on Total XP, Problems Solved, Streak, and Account Creation Date.
              </p>
            </div>
          </div>
        </div>

        <div className="lb-card">
          <div className="lb-table-wrapper">
            <table className="lb-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Student</th>
                  <th>Total XP</th>
                  <th>Problems Solved</th>
                  <th>Daily Streak</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                      Loading leaderboard...
                    </td>
                  </tr>
                ) : leaderboardData.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                      No ranked students yet.
                    </td>
                  </tr>
                ) : (
                  leaderboardData.map((row) => {
                    const isYou = row.userId === user?.id || row.fullName === user?.name;
                    const initials = row.fullName
                      ? row.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                      : 'S';

                    return (
                      <tr key={row.userId} className={`lb-row ${isYou ? 'you' : ''}`}>
                        <td className="lb-cell-rank">
                          {row.rank === 1 ? (
                            <span className="lb-rank-crown gold">🥇</span>
                          ) : row.rank === 2 ? (
                            <span className="lb-rank-crown silver">🥈</span>
                          ) : row.rank === 3 ? (
                            <span className="lb-rank-crown bronze">🥉</span>
                          ) : (
                            <span>#{row.rank}</span>
                          )}
                        </td>
                        <td className="lb-cell-name">
                          <div className="lb-student-info">
                            {row.avatarUrl ? (
                              <img src={row.avatarUrl} alt="Profile" className="lb-avatar-img" />
                            ) : (
                              <div className="lb-avatar-initials">{initials}</div>
                            )}
                            <span className="lb-student-fullname">
                              {row.fullName} {isYou && <span className="lb-badge-you">YOU</span>}
                            </span>
                          </div>
                        </td>
                        <td className="lb-cell-solved"><strong>{row.totalXp} XP</strong></td>
                        <td className="lb-cell-solved">{row.problemsSolved}</td>
                        <td className="lb-cell-solved">🔥 {row.dailyStreak} Days</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="lb-pagination">
              <button 
                onClick={handlePrevPage} 
                disabled={currentPage === 0}
                className="lb-page-btn"
              >
                <FiChevronLeft size={18} /> Previous
              </button>
              <span className="lb-page-info">
                Page {currentPage + 1} of {totalPages}
              </span>
              <button 
                onClick={handleNextPage} 
                disabled={currentPage >= totalPages - 1}
                className="lb-page-btn"
              >
                Next <FiChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
