import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiAward, FiChevronLeft, FiChevronRight, FiExternalLink } from 'react-icons/fi';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';

export default function Leaderboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    let stored = localStorage.getItem('cc-leaderboard');
    // Wipe stale data from old schema that had codechefUser/hackerrankUser
    if (stored && stored.includes('codechefUser')) {
      localStorage.removeItem('cc-leaderboard');
      stored = null;
    }
    if (stored) {
      const parsed = JSON.parse(stored);
      
      // Remove any existing "YOU" rows or hardcoded default names to prevent duplicates
      const withoutYou = parsed.filter(row => !row.isYou && row.name !== 'Alex Rivera');
      
      // Inject the single correct "YOU" row
      withoutYou.push({
        name: user?.name || 'Alex Rivera',
        solved: user?.solvedCount || 48,
        leetcodeUser: user?.leetcodeUser || '',
        gfgUser: user?.gfgUser || '',
        isYou: true,
        avatar: user?.avatar || null
      });

      withoutYou.sort((a, b) => b.solved - a.solved);
      localStorage.setItem('cc-leaderboard', JSON.stringify(withoutYou));
      setLeaderboardData(withoutYou);
    } else {
      const defaultData = [
        { name: 'Kabir Mehta',    solved: 134, leetcodeUser: 'kabir_m',     gfgUser: 'kabir_gfg',     avatar: null },
        { name: 'Ananya Iyer',    solved: 120, leetcodeUser: 'ananya_i',    gfgUser: 'ananya_gfg',    avatar: null },
        { name: 'Yash Vardhan',   solved: 112, leetcodeUser: 'yash_v',      gfgUser: 'yash_gfg',      avatar: null },
        { name: 'Zara Khan',      solved: 99,  leetcodeUser: 'zara_k',      gfgUser: 'zara_gfg',      avatar: null },
        { name: 'Rohit Sharma',   solved: 92,  leetcodeUser: 'rohit_s',     gfgUser: 'rohit_gfg',     avatar: null },
        { name: 'Ishaan Reddy',   solved: 91,  leetcodeUser: 'ishaan_r',    gfgUser: 'ishaan_gfg',    avatar: null },
        { name: 'Sneha Patel',    solved: 87,  leetcodeUser: 'sneha_p',     gfgUser: 'sneha_gfg',     avatar: null },
        { name: 'Arjun Das',      solved: 84,  leetcodeUser: 'arjun_d',     gfgUser: 'arjun_gfg',     avatar: null },
        { name: 'Divya Krishnan', solved: 83,  leetcodeUser: 'divya_k',     gfgUser: 'divya_gfg',     avatar: null },
        { name: 'Rohan Deshmukh', solved: 80,  leetcodeUser: 'rohan_d',     gfgUser: 'rohan_gfg',     avatar: null },
        { name: 'Priya Nair',     solved: 75,  leetcodeUser: 'priya_n',     gfgUser: 'priya_gfg',     avatar: null },
        { name: 'Tanvi Rao',      solved: 72,  leetcodeUser: 'tanvi_r',     gfgUser: 'tanvi_gfg',     avatar: null },
        { name: 'Aditya Sen',     solved: 68,  leetcodeUser: 'aditya_s',    gfgUser: 'aditya_gfg',    avatar: null },
        { name: 'Meera Joshi',    solved: 64,  leetcodeUser: 'meera_j',     gfgUser: 'meera_gfg',     avatar: null },
        { name: 'Vihaan Bansal',  solved: 60,  leetcodeUser: 'vihaan_b',    gfgUser: 'vihaan_gfg',    avatar: null },
        { name: 'Riya Kapoor',    solved: 57,  leetcodeUser: 'riya_k',      gfgUser: 'riya_gfg',      avatar: null },
        { name: 'Neil Malhotra',  solved: 52,  leetcodeUser: 'neil_m',      gfgUser: 'neil_gfg',      avatar: null },
        { name: 'Avani Shah',     solved: 45,  leetcodeUser: 'avani_s',     gfgUser: 'avani_gfg',     avatar: null },
        { name: 'Devansh Gupta',  solved: 41,  leetcodeUser: 'devansh_g',   gfgUser: 'devansh_gfg',   avatar: null },
        { name: 'Kiara Oberoi',   solved: 37,  leetcodeUser: 'kiara_o',     gfgUser: 'kiara_gfg',     avatar: null },
        { name: 'Aarav Saxena',   solved: 32,  leetcodeUser: 'aarav_s',     gfgUser: 'aarav_gfg',     avatar: null },
        { name: 'Myra Verma',     solved: 29,  leetcodeUser: 'myra_v',      gfgUser: 'myra_gfg',      avatar: null },
        { name: 'Samar Singhal',  solved: 25,  leetcodeUser: 'samar_s',     gfgUser: 'samar_gfg',     avatar: null },
        { name: 'Alisha Roy',     solved: 19,  leetcodeUser: 'alisha_r',    gfgUser: 'alisha_gfg',    avatar: null },
        { name: 'Hrithik Dutt',   solved: 12,  leetcodeUser: 'hrithik_d',   gfgUser: 'hrithik_gfg',   avatar: null },
        {
          name: user?.name || 'Alex Rivera',
          solved: user?.solvedCount || 48,
          leetcodeUser: user?.leetcodeUser || 'arivera-dev',
          gfgUser: user?.gfgUser || 'arivera_gfg',
          isYou: true,
          avatar: user?.avatar || null
        }
      ];
      defaultData.sort((a, b) => b.solved - a.solved);
      localStorage.setItem('cc-leaderboard', JSON.stringify(defaultData));
      setLeaderboardData(defaultData);
    }
  }, [user]);

  const extractUsername = (urlOrUsername) => {
    if (!urlOrUsername) return '';
    if (urlOrUsername.includes('http://') || urlOrUsername.includes('https://') || urlOrUsername.includes('.com') || urlOrUsername.includes('.org')) {
      try {
        const cleanUrl = urlOrUsername.replace(/\/$/, "");
        const parts = cleanUrl.split('/');
        return parts[parts.length - 1] || urlOrUsername;
      } catch (e) {
        return urlOrUsername;
      }
    }
    return urlOrUsername.trim();
  };

  // Pagination Math
  const totalPages = Math.ceil(leaderboardData.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = leaderboardData.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
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
                Track campus coders ranks in real-time. Link your profiles on the Profile page to sync your solved counts!
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
                  <th>LeetCode</th>
                  <th>GeeksforGeeks</th>
                  <th>Problems Solved</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((row, idx) => {
                  const absoluteRank = startIndex + idx + 1;
                  const isYou = row.isYou || row.name === user?.name;
                  const initials = row.name
                    ? row.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                    : 'S';

                  return (
                    <tr key={idx} className={`lb-row ${isYou ? 'you' : ''}`}>
                      <td className="lb-cell-rank">
                        {absoluteRank === 1 ? (
                          <span className="lb-rank-crown gold">🥇</span>
                        ) : absoluteRank === 2 ? (
                          <span className="lb-rank-crown silver">🥈</span>
                        ) : absoluteRank === 3 ? (
                          <span className="lb-rank-crown bronze">🥉</span>
                        ) : (
                          <span>#{absoluteRank}</span>
                        )}
                      </td>
                      <td className="lb-cell-name">
                        <div className="lb-student-info">
                          {isYou && user?.avatar ? (
                            <img src={user.avatar} alt="Profile" className="lb-avatar-img" />
                          ) : row.avatar ? (
                            <img src={row.avatar} alt="Profile" className="lb-avatar-img" />
                          ) : (
                            <div className="lb-avatar-initials">{initials}</div>
                          )}
                          <span className="lb-student-fullname">
                            {row.name} {isYou && <span className="lb-badge-you">YOU</span>}
                          </span>
                        </div>
                      </td>
                      <td className="lb-cell-profile">
                        {row.leetcodeUser ? (
                          <a
                            href={row.leetcodeUser.includes('leetcode.com') ? row.leetcodeUser : `https://leetcode.com/${row.leetcodeUser}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="lb-link"
                          >
                            {extractUsername(row.leetcodeUser)} <FiExternalLink size={12} />
                          </a>
                        ) : (
                          <span className="lb-not-linked">Not linked</span>
                        )}
                      </td>
                      <td className="lb-cell-profile">
                        {row.gfgUser ? (
                          <a
                            href={row.gfgUser.includes('geeksforgeeks.org') ? row.gfgUser : `https://auth.geeksforgeeks.org/user/${row.gfgUser}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="lb-link gfg"
                          >
                            {extractUsername(row.gfgUser)} <FiExternalLink size={12} />
                          </a>
                        ) : (
                          <span className="lb-not-linked">Not linked</span>
                        )}
                      </td>
                      <td className="lb-cell-solved">{row.solved}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="lb-pagination">
              <button 
                onClick={handlePrevPage} 
                disabled={currentPage === 1}
                className="lb-page-btn"
                aria-label="Previous Page"
              >
                <FiChevronLeft size={18} /> Previous
              </button>
              <span className="lb-page-info">
                Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, leaderboardData.length)} of {leaderboardData.length} members
              </span>
              <button 
                onClick={handleNextPage} 
                disabled={currentPage === totalPages}
                className="lb-page-btn"
                aria-label="Next Page"
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
