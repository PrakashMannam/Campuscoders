import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft, FiClock, FiBook, FiCheckCircle,
  FiPlayCircle, FiLock, FiBookmark, FiChevronRight
} from 'react-icons/fi';
import DashboardLayout from '../components/DashboardLayout';
import { learningPathsData } from '../data/learningPaths';
import { useProgress } from '../context/ProgressContext';

export default function LearningPathDetail() {
  const { pathId } = useParams();
  const navigate = useNavigate();
  const { isBookmarked, isCompleted, toggleBookmark } = useProgress();

  // Find target path
  const path = useMemo(() => {
    return learningPathsData.find(p => p.id === pathId) || learningPathsData[0];
  }, [pathId]);

  const bookmarked = isBookmarked(path.id) || path.bookmarked;

  return (
    <DashboardLayout>
      <div className="lpd-container">
        {/* Breadcrumb */}
        <div className="lpd-breadcrumb">
          <button className="lpd-back-link" onClick={() => navigate('/dashboard/resources/paths')}>
            <FiArrowLeft size={16} /> All Learning Paths
          </button>
          <span className="lpd-crumb-sep">/</span>
          <span className="lpd-crumb-current">{path.title}</span>
        </div>

        {/* Hero Header Banner */}
        <div className="lpd-hero">
          <div className="lpd-hero-top">
            <div className="lpd-hero-title-wrap">
              <div className="lpd-hero-icon-box" style={{ background: path.iconBg || '#FFF4E6' }}>
                <span>{path.icon}</span>
              </div>
              <div>
                <span className={`lpd-diff-pill ${path.difficulty.toLowerCase()}`}>
                  {path.difficulty}
                </span>
                <h1 className="lpd-title">{path.title}</h1>
              </div>
            </div>
            <button 
              className={`lpd-bookmark-btn ${bookmarked ? 'active' : ''}`}
              onClick={() => toggleBookmark(path.id)}
              title={bookmarked ? "Remove Bookmark" : "Bookmark Learning Path"}
            >
              <FiBookmark size={18} fill={bookmarked ? 'currentColor' : 'none'} />
            </button>
          </div>

          <p className="lpd-description">{path.description}</p>

          {/* Path Stats */}
          <div className="lpd-stats-row">
            <div className="lpd-stat-item">
              <FiBook size={18} className="lpd-stat-icon" />
              <div>
                <div className="lpd-stat-val">{path.topicCount}</div>
                <div className="lpd-stat-lbl">Total Topics</div>
              </div>
            </div>

            <div className="lpd-stat-item">
              <FiClock size={18} className="lpd-stat-icon" />
              <div>
                <div className="lpd-stat-val">{path.estimatedDuration}</div>
                <div className="lpd-stat-lbl">Est. Duration</div>
              </div>
            </div>

            <div className="lpd-stat-item progress">
              <div className="lpd-progress-header">
                <span>Overall Progress</span>
                <span className="lpd-progress-pct">{path.progress}%</span>
              </div>
              <div className="lpd-progress-bar-bg">
                <div className="lpd-progress-bar-fill" style={{ width: `${path.progress}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Continue Learning Callout Widget */}
        <div className="lpd-continue-card">
          <div className="lpd-continue-left">
            <FiPlayCircle size={24} className="lpd-continue-icon" />
            <div>
              <div className="lpd-continue-tag">RESUME LEARNING</div>
              <h4 className="lpd-continue-topic">Object Oriented Programming (OOP)</h4>
              <p className="lpd-continue-sub">Core Java Foundations • 12 Resources Available</p>
            </div>
          </div>
          <button 
            className="lpd-continue-btn"
            onClick={() => navigate('/dashboard/resources/topics/oop')}
          >
            Continue Topic <FiChevronRight size={16} />
          </button>
        </div>

        {/* Curriculum Modules & Topics */}
        <div className="lpd-curriculum-section">
          <h3 className="lpd-section-title">Curriculum & Topics</h3>

          {path.modules && path.modules.length > 0 ? (
            path.modules.map((module, modIdx) => (
              <div key={module.id || modIdx} className="lpd-module-box">
                <div className="lpd-module-header">
                  <span className="lpd-mod-num">Module {modIdx + 1}</span>
                  <h4 className="lpd-mod-title">{module.title}</h4>
                </div>

                <div className="lpd-topics-list">
                  {module.topics.map((t) => {
                    const topicCompleted = isCompleted(t.id) || t.completed;
                    return (
                      <div 
                        key={t.id} 
                        className={`lpd-topic-row ${topicCompleted ? 'completed' : ''}`}
                        onClick={() => navigate(`/dashboard/resources/topics/${t.id}`)}
                      >
                        <div className="lpd-topic-status-icon">
                          {topicCompleted ? (
                            <FiCheckCircle size={20} className="icon-completed" />
                          ) : (
                            <FiPlayCircle size={20} className="icon-in-progress" />
                          )}
                        </div>

                        <div className="lpd-topic-info">
                          <h5 className="lpd-topic-title">{t.title}</h5>
                          <div className="lpd-topic-meta">
                            <span>⏱️ {t.duration}</span>
                            <span>• 📚 {t.resourcesCount} Resources</span>
                          </div>
                        </div>

                        <button className="lpd-topic-action-btn">
                          {topicCompleted ? 'Review Topic' : 'Start Topic'} →
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            // Default curriculum fallback for paths with auto-generated modules
            <div className="lpd-module-box">
              <div className="lpd-module-header">
                <span className="lpd-mod-num">Module 1</span>
                <h4 className="lpd-mod-title">{path.title} Foundations</h4>
              </div>

              <div className="lpd-topics-list">
                <div 
                  className="lpd-topic-row"
                  onClick={() => navigate('/dashboard/resources/topics/oop')}
                >
                  <div className="lpd-topic-status-icon">
                    <FiPlayCircle size={20} className="icon-in-progress" />
                  </div>
                  <div className="lpd-topic-info">
                    <h5 className="lpd-topic-title">{path.title} Core Concepts & Setup</h5>
                    <div className="lpd-topic-meta">
                      <span>⏱️ 4h 30m</span>
                      <span>• 📚 12 Resources</span>
                    </div>
                  </div>
                  <button className="lpd-topic-action-btn">Start Topic →</button>
                </div>

                <div 
                  className="lpd-topic-row"
                  onClick={() => navigate('/dashboard/resources/topics/oop')}
                >
                  <div className="lpd-topic-status-icon">
                    <FiLock size={18} className="icon-locked" />
                  </div>
                  <div className="lpd-topic-info">
                    <h5 className="lpd-topic-title">Advanced Patterns & Real World Projects</h5>
                    <div className="lpd-topic-meta">
                      <span>⏱️ 6h 15m</span>
                      <span>• 📚 15 Resources</span>
                    </div>
                  </div>
                  <button className="lpd-topic-action-btn">View Topic →</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
