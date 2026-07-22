import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiArrowLeft, FiSearch, FiFilter, FiBookmark,
  FiChevronRight, FiCode, FiServer, FiLayout,
  FiDatabase, FiCpu
} from 'react-icons/fi';
import DashboardLayout from '../components/DashboardLayout';
import { learningPathsData } from '../data/learningPaths';
import { useProgress } from '../context/ProgressContext';
const DOMAIN_SECTIONS = [
  { name: 'Programming Languages', icon: <FiCode size={18} />, color: '#6366F1' },
  { name: 'Backend Frameworks', icon: <FiServer size={18} />, color: '#10B981' },
  { name: 'Frontend Frameworks & Libraries', icon: <FiLayout size={18} />, color: '#0EA5E9' },
  { name: 'Databases', icon: <FiDatabase size={18} />, color: '#8B5CF6' },
  { name: 'Other Domains', icon: <FiCpu size={18} />, color: '#F59E0B' },
];



export default function AllLearningPaths() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  
  const { isBookmarked, toggleBookmark } = useProgress();

  const handleToggleBookmark = (id, e) => {
    e.stopPropagation();
    toggleBookmark(id);
  };

  const filteredPaths = useMemo(() => {
    return learningPathsData.filter(path => {
      const matchesSearch = path.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            path.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDifficulty = difficultyFilter === 'All' || path.difficulty.toLowerCase() === difficultyFilter.toLowerCase();
      return matchesSearch && matchesDifficulty;
    });
  }, [searchQuery, difficultyFilter]);

  return (
    <DashboardLayout>
      <div className="alp-container">
        {/* Top Breadcrumb */}
        <div className="alp-breadcrumb">
          <button className="alp-back-link" onClick={() => navigate('/dashboard/resources')}>
            <FiArrowLeft size={16} /> Resources
          </button>
          <span className="alp-crumb-sep">/</span>
          <span className="alp-crumb-current">All Learning Paths</span>
        </div>

        {/* Page Header + Search & Filter Top Bar */}
        <div className="alp-header-bar">
          <div>
            <h1 className="alp-title">All Learning Paths</h1>
            <p className="alp-subtitle">
              Explore all curated learning paths across different domains and technologies.
            </p>
          </div>

          <div className="alp-top-controls">
            <div className="alp-search-box">
              <FiSearch size={16} className="alp-search-icon" />
              <input
                type="text"
                placeholder="Search learning paths..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="alp-filter-wrapper">
              <button 
                className={`alp-filter-btn ${difficultyFilter !== 'All' ? 'active' : ''}`}
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              >
                <FiFilter size={16} /> Filters {difficultyFilter !== 'All' ? `(${difficultyFilter})` : ''}
              </button>

              {showFilterDropdown && (
                <div className="alp-filter-dropdown">
                  <div className="alp-dropdown-label">Filter by Difficulty</div>
                  {['All', 'Beginner', 'Intermediate', 'Advanced'].map(diff => (
                    <button
                      key={diff}
                      className={`alp-dropdown-option ${difficultyFilter === diff ? 'selected' : ''}`}
                      onClick={() => {
                        setDifficultyFilter(diff);
                        setShowFilterDropdown(false);
                      }}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Grouped Domain Sections */}
        {DOMAIN_SECTIONS.map(domainSection => {
          const domainPaths = filteredPaths.filter(p => p.domain === domainSection.name);
          if (domainPaths.length === 0 && searchQuery) return null;

          return (
            <section key={domainSection.name} className="alp-domain-section">
              <div className="alp-section-header">
                <div className="alp-section-title-wrap">
                  <span className="alp-domain-icon-badge" style={{ color: domainSection.color, background: `${domainSection.color}15` }}>
                    {domainSection.icon}
                  </span>
                  <h3 className="alp-domain-title">{domainSection.name}</h3>
                  <span className="alp-count-pill">{domainPaths.length} Paths</span>
                </div>
              </div>

              {domainPaths.length === 0 ? (
                <div className="alp-no-paths">
                  No learning paths available in this category.
                </div>
              ) : (
                <div className="alp-cards-grid">
                  {domainPaths.map(path => {
                    const bookmarked = isBookmarked(path.id) || path.bookmarked;
                    return (
                      <div key={path.id} className="alp-card">
                        <div className="alp-card-header">
                          <div 
                            className="alp-card-icon"
                            style={{ background: path.iconBg || '#FFF4E6' }}
                          >
                            <span>{path.icon}</span>
                          </div>
                          <button
                            className={`alp-bookmark-btn ${bookmarked ? 'active' : ''}`}
                            onClick={(e) => handleToggleBookmark(path.id, e)}
                            title={bookmarked ? 'Bookmarked' : 'Bookmark Path'}
                          >
                            <FiBookmark size={18} fill={bookmarked ? 'currentColor' : 'none'} />
                          </button>
                        </div>

                        <h4 className="alp-card-title">{path.title}</h4>
                        <p className="alp-card-desc">{path.shortDesc || path.description}</p>

                        <div className="alp-card-meta">
                          <span className="alp-topic-badge">{path.topicCount} Topics</span>
                          <span className={`alp-diff-badge ${path.difficulty.toLowerCase()}`}>
                            {path.difficulty}
                          </span>
                        </div>

                        <button
                          className="alp-explore-btn"
                          onClick={() => navigate(`/dashboard/resources/paths/${path.id}`)}
                        >
                          Explore Path <FiChevronRight size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}

        {/* Bottom Request Callout Banner */}
        <div className="alp-request-banner">
          <div className="alp-req-left">
            <span className="alp-req-icon">💡</span>
            <div>
              <h4 className="alp-req-title">Can't find what you're looking for?</h4>
              <p className="alp-req-sub">Request a topic or suggest a new learning path for the community.</p>
            </div>
          </div>
          <button 
            className="alp-req-btn"
            onClick={() => navigate('/dashboard/discussions')}
          >
            Suggest a Topic →
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
