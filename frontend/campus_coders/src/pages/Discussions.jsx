import React, { useState, useEffect, useCallback } from 'react';
import { FiMessageSquare, FiEdit3, FiX, FiSend, FiChevronUp, FiCheckCircle } from 'react-icons/fi';
import DashboardLayout from '../components/DashboardLayout';
import Toast from '../components/Toast';
import api from '../api/client';

export default function Discussions() {
  /* ── State ── */
  const [categories, setCategories] = useState([]);
  const [discussionList, setDiscussionList] = useState([]);
  const [activeCategorySlug, setActiveCategorySlug] = useState('all');
  const [activeTag, setActiveTag] = useState(null);
  const [activeFilter, setActiveFilter] = useState('latest');
  const [loading, setLoading] = useState(true);

  // Sidebar states
  const [topContributors, setTopContributors] = useState([]);
  const [popularTags, setPopularTags] = useState([]);

  // Modals state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [activeDiscussion, setActiveDiscussion] = useState(null);

  // New Discussion Form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategoryId, setNewCategoryId] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');

  // Reply Form state
  const [replyText, setReplyText] = useState('');

  /* ── Toast ── */
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });
  const showToast = useCallback((type, message) => {
    setToast({ show: true, type, message });
  }, []);
  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, show: false }));
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get('/discussion-categories');
      setCategories(res.data || []);
      if (res.data && res.data.length > 0) {
        setNewCategoryId(res.data[0].id);
      }
    } catch (err) {
      showToast('error', 'Failed to load discussion categories.');
    }
  }, [showToast]);

  const fetchDiscussions = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/discussions?page=0&size=20&filter=${activeFilter}`;
      if (activeCategorySlug !== 'all') {
        url += `&categorySlug=${activeCategorySlug}`;
      }
      const res = await api.get(url);
      setDiscussionList(res.data.content || []);
    } catch (err) {
      showToast('error', 'Failed to load discussions.');
    } finally {
      setLoading(false);
    }
  }, [activeCategorySlug, activeFilter, showToast]);

  const fetchSidebars = useCallback(async () => {
    try {
      const [contribRes, tagRes] = await Promise.all([
        api.get('/discussions/contributors/top'),
        api.get('/discussions/tags/popular')
      ]);
      setTopContributors(contribRes.data || []);
      setPopularTags(tagRes.data || []);
    } catch (err) {
      console.error('Failed to load sidebars', err);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchSidebars();
  }, [fetchCategories, fetchSidebars]);

  useEffect(() => {
    fetchDiscussions();
  }, [fetchDiscussions]);

  const handleVote = async (e, postId, value) => {
    e.stopPropagation();
    try {
      const res = await api.post(`/discussions/${postId}/vote`, { voteValue: value });
      // Optimistically update list
      setDiscussionList(prev => prev.map(p => p.id === postId ? res.data : p));
      if (activeDiscussion && activeDiscussion.id === postId) {
        setActiveDiscussion(res.data);
      }
    } catch (err) {
      showToast('error', 'Failed to vote.');
    }
  };

  // Filter discussions by active tag or local search
  const filteredDiscussions = discussionList.filter(d => {
    const matchesTag = !activeTag || (d.tags && d.tags.includes(activeTag));
    return matchesTag;
  });

  // Create new discussion
  const handleCreateDiscussion = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim() || !newCategoryId) {
      showToast('error', 'Please fill in all required fields.');
      return;
    }

    try {
      await api.post('/discussions', {
        title: newTitle.trim(),
        content: newContent.trim(),
        categoryId: Number(newCategoryId),
        tags: newTags.trim()
      });

      setNewTitle('');
      setNewContent('');
      setNewTags('');
      setIsNewModalOpen(false);
      showToast('success', 'Discussion thread posted successfully!');
      fetchDiscussions();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to post discussion.');
    }
  };

  // Post a reply
  const handlePostReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !activeDiscussion) {
      showToast('error', 'Reply comment cannot be empty.');
      return;
    }

    try {
      const res = await api.post(`/discussions/${activeDiscussion.id}/replies`, {
        content: replyText.trim()
      });

      const newReply = res.data;
      
      // Update active discussion state to render the reply immediately
      setActiveDiscussion(prev => ({
        ...prev,
        replies: [...(prev.replies || []), newReply]
      }));

      setReplyText('');
      showToast('success', 'Comment posted!');
      fetchDiscussions();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to post reply.');
    }
  };

  return (
    <DashboardLayout>
      <div className="disc-page">
        {/* ── Toast ── */}
        <Toast
          type={toast.type}
          message={toast.message}
          show={toast.show}
          onClose={hideToast}
        />

        <div className="disc-header">
          <div>
            <h2 className="disc-title">Community Discussions</h2>
            <p className="disc-subtitle">
              Connect with peer developers, share insights, and get help with complex engineering challenges.
            </p>
          </div>
          <button className="disc-new-btn" id="new-discussion-btn" onClick={() => setIsNewModalOpen(true)}>
            <FiEdit3 size={16} /> New Discussion
          </button>
        </div>

        <div className="disc-layout">
          {/* Left sidebar */}
          <div className="disc-sidebar">
            <div className="disc-sidebar-card">
              <h4 className="disc-sidebar-title">CATEGORIES</h4>
              <ul className="disc-cat-list">
                <li
                  className={`disc-cat-item ${activeCategorySlug === 'all' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveCategorySlug('all');
                    setActiveTag(null);
                  }}
                >
                  <span className="disc-cat-dot" style={{ background: '#D4AF37' }} />
                  <span className="disc-cat-name">All Topics</span>
                </li>
                {categories.map(cat => {
                  const isActive = activeCategorySlug === cat.slug;
                  return (
                    <li
                      key={cat.id}
                      className={`disc-cat-item ${isActive ? 'active' : ''}`}
                      onClick={() => {
                        setActiveCategorySlug(cat.slug);
                        setActiveTag(null);
                      }}
                    >
                      <span className="disc-cat-dot" style={{ background: cat.colorHex || '#6366f1' }} />
                      <span className="disc-cat-name">{cat.name}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Main List */}
          <div className="disc-main" style={{ display: 'flex', gap: '24px' }}>
            
            <div className="disc-thread-section" style={{ flex: 1 }}>
              {/* Filter Tabs */}
              <div className="disc-filters" style={{ display: 'flex', gap: '16px', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                {['latest', 'unanswered', 'most_replied', 'featured'].map(filter => (
                  <button 
                    key={filter}
                    className={`disc-filter-btn ${activeFilter === filter ? 'active' : ''}`}
                    onClick={() => setActiveFilter(filter)}
                    style={{ 
                      background: 'none', border: 'none', cursor: 'pointer', 
                      color: activeFilter === filter ? '#D4AF37' : '#64748b',
                      fontWeight: activeFilter === filter ? 'bold' : 'normal',
                      padding: '4px 8px'
                    }}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1).replace('_', ' ')}
                  </button>
                ))}
              </div>

              <div className="disc-thread-list">
                {loading ? (
                  <p style={{ color: '#64748b' }}>Loading discussions...</p>
                ) : filteredDiscussions.length === 0 ? (
                  <div className="disc-empty-state">
                    <p>No discussion threads found in this category.</p>
                    <button className="disc-empty-reset" onClick={() => { setActiveCategorySlug('all'); setActiveTag(null); }}>Show All Topics</button>
                  </div>
                ) : (
                  filteredDiscussions.map(d => (
                    <div 
                      key={d.id} 
                      className="disc-thread" 
                      id={`discussion-${d.id}`}
                      onClick={() => setActiveDiscussion(d)}
                      style={{ cursor: 'pointer', display: 'flex', gap: '16px', alignItems: 'flex-start' }}
                    >
                      {/* Upvote column */}
                      <div className="disc-thread-vote" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '40px' }}>
                        <button 
                          onClick={(e) => handleVote(e, d.id, 1)} 
                          style={{ 
                            background: 'none', border: 'none', cursor: 'pointer', 
                            color: d.userVote === 1 ? '#ef4444' : '#94a3b8' 
                          }}
                        >
                          <FiChevronUp size={24} />
                        </button>
                        <span style={{ fontWeight: 'bold', color: '#334155' }}>{d.voteScore || 0}</span>
                      </div>

                      <div className="disc-thread-body" style={{ flex: 1 }}>
                        <div className="disc-thread-meta">
                          <span className="disc-thread-cat" style={{ background: '#6366f118', color: '#6366f1' }}>
                            {d.categoryName}
                          </span>
                          <span className="disc-thread-time">• {d.createdAt ? new Date(d.createdAt).toLocaleDateString() : 'Recent'}</span>
                        </div>
                        <h3 className="disc-thread-title">{d.title}</h3>
                        
                        <div className="disc-thread-tags" style={{ display: 'flex', gap: '6px', margin: '8px 0' }}>
                          {d.tags && d.tags.split(',').map(tag => (
                            <span key={tag} style={{ background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '12px', fontSize: '11px' }}>
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className="disc-thread-footer">
                          <div className="disc-thread-author">
                            <div className="disc-author-avatar">
                              {d.authorName ? d.authorName.slice(0, 2).toUpperCase() : 'U'}
                            </div>
                            <span>{d.authorName}</span>
                          </div>
                          <span className="disc-thread-replies">
                            <FiMessageSquare size={13} style={{ marginRight: '4px' }} /> {d.repliesCount || 0} replies
                          </span>
                          {d.hasAcceptedAnswer && (
                            <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', fontSize: '12px', gap: '4px' }}>
                              <FiCheckCircle size={14} /> Accepted Answer
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Sidebars */}
            <div className="disc-right-sidebar" style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Top Contributors */}
              <div className="disc-sidebar-card" style={{ background: '#fff', borderRadius: '8px', padding: '16px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#1e293b' }}>Top Contributors</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {topContributors.map((c, i) => (
                    <li key={c.userId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#94a3b8', fontSize: '12px' }}>{i + 1}</span>
                        <div className="disc-author-avatar" style={{ width: '24px', height: '24px', fontSize: '10px' }}>
                          {c.fullName.slice(0, 2).toUpperCase()}
                        </div>
                        <span style={{ color: '#334155', fontWeight: '500' }}>{c.fullName}</span>
                      </div>
                      <span style={{ color: '#64748b', fontSize: '11px' }}>{c.repliesCount} replies</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Popular Tags */}
              <div className="disc-sidebar-card" style={{ background: '#fff', borderRadius: '8px', padding: '16px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#1e293b' }}>Popular Tags</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {popularTags.map(t => (
                    <span 
                      key={t.tag} 
                      style={{ 
                        background: '#f8fafc', color: '#475569', padding: '4px 10px', 
                        borderRadius: '16px', fontSize: '12px', border: '1px solid #e2e8f0',
                        cursor: 'pointer'
                      }}
                      onClick={() => setActiveTag(t.tag)}
                    >
                      {t.tag} <span style={{ color: '#94a3b8', fontSize: '10px' }}>{t.count}</span>
                    </span>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* ── CREATE NEW DISCUSSION MODAL ── */}
      {isNewModalOpen && (
        <div className="disc-modal-overlay">
          <div className="disc-modal-container">
            <div className="disc-modal-header">
              <h3>Create New Discussion</h3>
              <button className="disc-modal-close" onClick={() => setIsNewModalOpen(false)}>
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateDiscussion} className="disc-modal-form">
              <div className="disc-form-group">
                <label>Discussion Title</label>
                <input 
                  type="text" 
                  value={newTitle} 
                  onChange={e => setNewTitle(e.target.value)} 
                  placeholder="What is your discussion thread about?"
                  required
                />
              </div>

              <div className="disc-form-row">
                <div className="disc-form-group" style={{ flex: 1 }}>
                  <label>Category</label>
                  <select 
                    value={newCategoryId} 
                    onChange={e => setNewCategoryId(e.target.value)}
                    required
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="disc-form-group">
                <label>Detailed Description</label>
                <textarea 
                  value={newContent} 
                  onChange={e => setNewContent(e.target.value)} 
                  placeholder="Provide details or questions..."
                  rows={6}
                  required
                />
              </div>

              <div className="disc-modal-footer">
                <button type="button" className="disc-btn-cancel" onClick={() => setIsNewModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="disc-btn-submit">
                  Post Discussion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DISCUSSION DETAIL & REPLIES MODAL ── */}
      {activeDiscussion && (
        <div className="disc-modal-overlay">
          <div className="disc-modal-container detail-modal">
            <div className="disc-modal-header">
              <span className="disc-thread-cat" style={{ background: '#6366f118', color: '#6366f1' }}>
                {activeDiscussion.categoryName}
              </span>
              <button className="disc-modal-close" onClick={() => setActiveDiscussion(null)}>
                <FiX size={20} />
              </button>
            </div>

            <div className="disc-detail-scrollable">
              <div className="disc-detail-main">
                <h2 className="disc-detail-title">{activeDiscussion.title}</h2>
                <div className="disc-detail-meta">
                  <div className="disc-thread-author">
                    <div className="disc-author-avatar">
                      {activeDiscussion.authorName ? activeDiscussion.authorName.slice(0, 2).toUpperCase() : 'U'}
                    </div>
                    <span><strong>{activeDiscussion.authorName}</strong></span>
                  </div>
                </div>

                <div className="disc-detail-content" style={{ marginTop: '16px' }}>
                  {activeDiscussion.content}
                </div>
              </div>

              {/* Replies Section */}
              <div className="disc-replies-section">
                <h3>Replies ({activeDiscussion.replies ? activeDiscussion.replies.length : 0})</h3>
                
                <div className="disc-replies-list">
                  {!activeDiscussion.replies || activeDiscussion.replies.length === 0 ? (
                    <div className="disc-no-replies">
                      <p>No replies yet. Be the first to answer!</p>
                    </div>
                  ) : (
                    activeDiscussion.replies.map((reply) => (
                      <div key={reply.id} className="disc-reply-item">
                        <div className="disc-reply-header">
                          <div className="disc-thread-author">
                            <div className="disc-author-avatar small">
                              {reply.authorName ? reply.authorName.slice(0, 2).toUpperCase() : 'U'}
                            </div>
                            <span><strong>{reply.authorName}</strong></span>
                          </div>
                        </div>
                        <div className="disc-reply-body">
                          {reply.content}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Post reply box sticky footer */}
            <form onSubmit={handlePostReply} className="disc-reply-form">
              <textarea 
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Write a reply or comment..."
                rows={2}
                required
              />
              <button type="submit" className="disc-reply-submit">
                <FiSend size={15} />
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
