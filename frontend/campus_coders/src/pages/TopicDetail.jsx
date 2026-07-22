import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft, FiBookmark, FiCheckCircle, FiChevronRight,
  FiBookOpen, FiCode, FiFileText, FiMessageSquare,
  FiChevronDown, FiLock, FiExternalLink, FiDownload, FiCheck
} from 'react-icons/fi';
import DashboardLayout from '../components/DashboardLayout';
import ResourceCard from '../components/ResourceCard';
import { topicsData } from '../data/topics';
import { resourcesData, practiceProblemsData, notesData, discussionsData } from '../data/resources';

import { useProgress } from '../context/ProgressContext';

export default function TopicDetail() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('resources');
  const [sortOption, setSortOption] = useState('Recommended');
  const { isBookmarked, isCompleted, toggleBookmark, toggleCompleted } = useProgress();

  const topic = useMemo(() => {
    return topicsData[topicId] || topicsData['oop'];
  }, [topicId]);

  const topicResources = useMemo(() => {
    return resourcesData.filter(r => r.topicId === topic.id || r.topicId === 'oop');
  }, [topic.id]);

  const bookmarked = isBookmarked(topic.id, topic.bookmarked);
  const completed = isCompleted(topic.id, topic.completed);

  const handleToggleCompleted = () => {
    toggleCompleted(topic.id);
  };

  const handleToggleBookmark = () => {
    toggleBookmark(topic.id);
  };

  return (
    <DashboardLayout>
      <div className="top-detail-container">
        {/* Top Breadcrumb */}
        <div className="top-breadcrumb">
          <button className="top-back-btn" onClick={() => navigate(`/dashboard/resources/paths/${topic.pathId}`)}>
            <FiArrowLeft size={16} />
          </button>
          <span className="top-crumb-link" onClick={() => navigate('/dashboard/resources')}>Resources</span>
          <span className="top-crumb-sep">&gt;</span>
          <span className="top-crumb-link" onClick={() => navigate(`/dashboard/resources/paths/${topic.pathId}`)}>{topic.pathTitle}</span>
          <span className="top-crumb-sep">&gt;</span>
          <span>{topic.moduleTitle}</span>
          <span className="top-crumb-sep">&gt;</span>
          <span className="top-crumb-current">{topic.title}</span>
        </div>

        {/* Topic Header Summary Box */}
        <div className="top-header-box">
          <div className="top-header-top">
            <div className="top-icon-box">
              <span>{'{ }'}</span>
            </div>
            <div className="top-title-area">
              <h1 className="top-title">{topic.title}</h1>
              <p className="top-subtitle">{topic.description}</p>

              {/* Metadata Badges */}
              <div className="top-meta-pills">
                <span className="top-pill">📚 {topic.resourcesCount} Resources</span>
                <span className="top-pill">⏱️ {topic.estimatedDuration}</span>
                <span className="top-pill diff">● {topic.difficulty}</span>
                <span className="top-pill cat">{topic.categoryTag}</span>
              </div>
            </div>

            <div className="top-actions-area">
              <button 
                className={`top-icon-btn ${bookmarked ? 'active' : ''}`}
                onClick={handleToggleBookmark}
                title={bookmarked ? 'Bookmarked' : 'Bookmark Topic'}
              >
                <FiBookmark size={18} fill={bookmarked ? 'currentColor' : 'none'} />
              </button>
              <button
                className={`top-btn-completed ${completed ? 'is-done' : ''}`}
                onClick={handleToggleCompleted}
                title={completed ? 'Mark as Incomplete' : 'Mark as Completed'}
              >
                <FiCheck size={15} />
                {completed ? 'Completed ✓' : 'Mark as Completed'}
              </button>
            </div>
          </div>

          {/* Horizontal Tabs Bar */}
          <div className="top-tabs-bar">
            <button
              className={`top-tab-btn ${activeTab === 'resources' ? 'active' : ''}`}
              onClick={() => setActiveTab('resources')}
            >
              <FiBookOpen size={16} /> Resources ({topicResources.length})
            </button>

            <button
              className={`top-tab-btn ${activeTab === 'practice' ? 'active' : ''}`}
              onClick={() => setActiveTab('practice')}
            >
              <FiCode size={16} /> Practice Problems ({practiceProblemsData.length})
            </button>

            <button
              className={`top-tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
              onClick={() => setActiveTab('notes')}
            >
              <FiFileText size={16} /> Notes & Cheatsheets ({notesData.length})
            </button>

            <button
              className={`top-tab-btn ${activeTab === 'discussions' ? 'active' : ''}`}
              onClick={() => setActiveTab('discussions')}
            >
              <FiMessageSquare size={16} /> Discussions ({discussionsData.length})
            </button>
          </div>
        </div>

        {/* Main Content Layout: Left Main Area + Right Sidebar */}
        <div className="top-main-layout">
          {/* Left Column: Tab Content */}
          <div className="top-main-col">
            {/* Resources Tab */}
            {activeTab === 'resources' && (
              <div className="top-tab-content">
                <div className="top-section-bar">
                  <div>
                    <h3 className="top-section-heading">⭐ Recommended Resources</h3>
                    <p className="top-section-sub">Curated resources to master this topic</p>
                  </div>

                  <div className="top-sort-wrap">
                    <span className="top-sort-label">Sort by:</span>
                    <select 
                      className="top-sort-select"
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value)}
                    >
                      <option value="Recommended">Recommended</option>
                      <option value="Most Bookmarked">Most Bookmarked</option>
                      <option value="Newest">Newest First</option>
                    </select>
                  </div>
                </div>

                <div className="top-resources-list">
                  {topicResources.map(res => (
                    <ResourceCard key={res.id} resource={res} />
                  ))}
                </div>

                <div className="top-show-more-wrap">
                  <button className="top-show-more-btn">
                    Show More Resources <FiChevronDown size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Practice Problems Tab */}
            {activeTab === 'practice' && (
              <div className="top-tab-content">
                <div className="top-section-bar">
                  <div>
                    <h3 className="top-section-heading">⚡ Practice Problems</h3>
                    <p className="top-section-sub">Solve problems to test your OOP concepts</p>
                  </div>
                </div>

                <div className="top-problems-list">
                  {practiceProblemsData.map(prob => (
                    <div key={prob.id} className="top-prob-card">
                      <div className="top-prob-left">
                        <span className={`top-prob-diff ${prob.difficulty.toLowerCase()}`}>
                          {prob.difficulty}
                        </span>
                        <div>
                          <h4 className="top-prob-title">{prob.title}</h4>
                          <div className="top-prob-tags">
                            <span>Platform: {prob.platform}</span>
                            {prob.tags.map(t => (
                              <span key={t} className="top-prob-tag">#{t}</span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="top-prob-right">
                        <button 
                          className="top-prob-btn" 
                          onClick={() => window.open(prob.url || 'https://leetcode.com/problems/roman-to-integer/', '_blank')}
                        >
                          Open Question <FiExternalLink size={14} style={{ marginLeft: '4px' }} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes & Cheatsheets Tab */}
            {activeTab === 'notes' && (
              <div className="top-tab-content">
                <div className="top-section-bar">
                  <div>
                    <h3 className="top-section-heading">📑 Notes & Cheatsheets</h3>
                    <p className="top-section-sub">Download hand-written summaries and PDF guides</p>
                  </div>
                </div>

                <div className="top-notes-grid">
                  {notesData.map(note => (
                    <div key={note.id} className="top-note-card">
                      <div className="top-note-icon">
                        <FiFileText size={22} />
                      </div>
                      <div className="top-note-body">
                        <h4 className="top-note-title">{note.title}</h4>
                        <div className="top-note-meta">
                          <span>{note.format}</span> • <span>{note.size}</span> • <span>{note.pages} pages</span>
                        </div>
                      </div>
                      <button className="top-note-download-btn" onClick={() => alert(`Downloading: ${note.title}`)}>
                        <FiDownload size={16} /> Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Discussions Tab */}
            {activeTab === 'discussions' && (
              <div className="top-tab-content">
                <div className="top-section-bar">
                  <div>
                    <h3 className="top-section-heading">💬 Discussions & Q&A</h3>
                    <p className="top-section-sub">Ask doubts and interact with fellow peers</p>
                  </div>
                  <button 
                    className="top-ask-btn"
                    onClick={() => navigate('/dashboard/discussions')}
                  >
                    Ask a Question
                  </button>
                </div>

                <div className="top-disc-list">
                  {discussionsData.map(disc => (
                    <div key={disc.id} className="top-disc-card">
                      <div className="top-disc-main">
                        <h4 className="top-disc-title">{disc.title}</h4>
                        <div className="top-disc-meta">
                          <span>Posted by <strong>{disc.author}</strong></span>
                          <span>• {disc.time}</span>
                        </div>
                      </div>
                      <div className="top-disc-stats">
                        <span>💬 {disc.replies} Replies</span>
                        <span>👍 {disc.likes} Likes</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar Column */}
          <div className="top-side-col">
            {/* Card 1: Your Learning Path */}
            <div className="top-side-card">
              <div className="top-side-header">
                <span className="top-side-badge">A</span>
                <span className="top-side-title">Your Learning Path</span>
              </div>

              <div className="top-side-path-name">{topic.pathTitle}</div>

              <div className="top-side-prog-wrap">
                <div className="top-side-prog-lbl">
                  <span>Progress</span>
                  <span>{topic.progressPercent}%</span>
                </div>
                <div className="top-side-prog-bar-bg">
                  <div className="top-side-prog-bar-fill" style={{ width: `${topic.progressPercent}%` }} />
                </div>
              </div>

              <div className="top-side-subhead">Continue Learning</div>

              <div className="top-roadmap-list">
                {topic.roadmapTopics.map(step => (
                  <div 
                    key={step.id} 
                    className={`top-step-item ${step.active ? 'active' : ''}`}
                    onClick={() => navigate(`/dashboard/resources/topics/${step.id}`)}
                  >
                    <div className="top-step-dot">
                      {step.status === 'Completed' ? (
                        <FiCheckCircle size={14} className="done" />
                      ) : step.active ? (
                        <span className="active-dot" />
                      ) : (
                        <FiLock size={12} className="lock" />
                      )}
                    </div>
                    <span className="top-step-title">{step.title}</span>
                    <span className={`top-step-badge ${step.status.toLowerCase().replace(' ', '-')}`}>
                      {step.status}
                    </span>
                  </div>
                ))}
              </div>

              <button 
                className="top-side-btn-outline"
                onClick={() => navigate(`/dashboard/resources/paths/${topic.pathId}`)}
              >
                View Full Roadmap →
              </button>
            </div>

            {/* Card 2: Upcoming in This Path */}
            <div className="top-side-card">
              <div className="top-upcoming-header">
                <span>🗓️ Upcoming in This Path</span>
              </div>

              <div className="top-upcoming-box" onClick={() => navigate(`/dashboard/resources/topics/${topic.nextTopic.id}`)}>
                <div className="top-upcoming-left">
                  <div className="top-upcoming-tag">Next Topic</div>
                  <h5 className="top-upcoming-title">{topic.nextTopic.title}</h5>
                  <div className="top-upcoming-time">Estimated: {topic.nextTopic.estimatedDuration}</div>
                </div>
                <FiChevronRight size={20} className="top-upcoming-arrow" />
              </div>
            </div>

            {/* Card 3: Need Help Banner */}
            <div className="top-side-card help-card">
              <div className="top-help-header">
                <span className="top-help-icon">💬</span>
                <div>
                  <h5 className="top-help-title">Need Help?</h5>
                  <p className="top-help-sub">Stuck on something? Ask the community and get help from peers.</p>
                </div>
              </div>
              <button 
                className="top-help-btn"
                onClick={() => navigate('/dashboard/discussions')}
              >
                Ask in Community →
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
