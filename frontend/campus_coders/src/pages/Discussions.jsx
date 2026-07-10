import React, { useState, useEffect, useCallback } from 'react';
import { FiMessageSquare, FiStar, FiChevronUp, FiChevronDown, FiEdit3, FiX, FiCheck, FiSend } from 'react-icons/fi';
import DashboardLayout from '../components/DashboardLayout';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';

const categories = [
  { name: 'All Topics', count: null, color: '#D4AF37' },
  { name: 'General',  count: null, color: '#6B7280' },
  { name: 'Java',     count: null, color: '#D4AF37' },
  { name: 'Python',   count: null, color: '#1E6BFA' },
  { name: 'Career Advice', count: null, color: '#6366f1' },
];

const trendingTags = ['#algorithms', '#internship', '#react', '#interview_prep', '#data_structures'];

const defaultDiscussions = [
  {
    id: 1,
    category: 'Java',
    catColor: '#D4AF37',
    time: 'Posted 2 hours ago',
    votes: 24,
    title: 'Optimization techniques for massive JSON processing in Spring Boot?',
    preview: "I'm working on a microservice that needs to handle 5GB+ JSON payloads daily. Jackson is getting slow, what are the best streaming parser…",
    content: "I'm working on a Spring Boot microservice that needs to parse and process over 5GB of JSON payloads daily. Jackson's default ObjectMapper is consuming too much memory and garbage collection is causing significant latency spikes. What are the best streaming parsing strategies or alternative libraries (like GSON, FastJSON, or DSL-JSON) to optimize memory footprint and throughput?",
    author: 'Sarah J.',
    tags: ['#data_structures', '#algorithms'],
    replies: [
      { author: 'Devon Miller', content: 'You should look into Jackson Streaming API (JsonParser and JsonGenerator). It processes tokens sequentially without building the full tree in memory.', time: '1 hour ago' },
      { author: 'Priya Nair', content: 'Seconding Devon. ObjectMapper.readValues() is also great for streaming lists of objects. Avoid loading the whole 5GB array.', time: '45 mins ago' }
    ],
    featured: true,
  },
  {
    id: 2,
    category: 'Career Advice',
    catColor: '#6366f1',
    time: 'Posted 5 hours ago',
    votes: 156,
    title: 'How to choose between Big Tech and early-stage AI startups?',
    preview: 'I have offers from a FAANG company and a Series A startup working on LLM infrastructure. The pay gap is significant but the equity potential is temptin…',
    content: "I'm currently at a crossroads in my career. I have two offers: one from a FAANG company as an L4 Software Engineer with great base compensation and stock options, and another from an early-stage Series A startup focused on LLM routing infrastructure. The startup offers less cash but significant equity upside and a chance to build from scratch. What factors should I weigh to make this decision?",
    author: 'Devon Miller',
    tags: ['#internship', '#interview_prep'],
    replies: [
      { author: 'Sarah J.', content: 'If you are early in your career, FAANG gives you great processes, mentorship, and a solid brand name. Startups are fantastic if you want to wear multiple hats.', time: '3 hours ago' }
    ],
    featured: false,
  },
  {
    id: 3,
    category: 'Python',
    catColor: '#1E6BFA',
    time: 'Posted 8 hours ago',
    votes: 8,
    title: 'FastAPI vs Flask for real-time sensor data dashboards?',
    preview: "Need to build a dashboard that updates every 200ms. I'm leaning towards FastAPI due to native async support but my team is more comfortable with…",
    content: "We are designing a telemetry dashboard that needs to display real-time sensor data streaming at 200ms intervals. I am leaning heavily towards FastAPI because of its native WebSocket and async capabilities. However, the rest of my development team is more familiar with Flask. Is it worth the transition effort to FastAPI?",
    author: 'Aria_Code',
    tags: ['#react', '#algorithms'],
    replies: [],
    featured: false,
  },
];

export default function Discussions() {
  const { user } = useAuth();

  /* ── State ── */
  const [discussionList, setDiscussionList] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All Topics');
  const [activeTag, setActiveTag] = useState(null);

  // Modals state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [activeDiscussion, setActiveDiscussion] = useState(null);

  // New Discussion Form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('General');
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

  // Initialize from LocalStorage
  useEffect(() => {
    const stored = localStorage.getItem('cc-discussions');
    if (stored) {
      setDiscussionList(JSON.parse(stored));
    } else {
      localStorage.setItem('cc-discussions', JSON.stringify(defaultDiscussions));
      setDiscussionList(defaultDiscussions);
    }
  }, []);

  // Update localStorage when discussionList changes
  const saveDiscussions = (newList) => {
    setDiscussionList(newList);
    localStorage.setItem('cc-discussions', JSON.stringify(newList));
  };

  // Filter discussions list
  const filteredDiscussions = discussionList.filter(d => {
    const matchesCategory = activeCategory === 'All Topics' || d.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesTag = !activeTag || d.tags.includes(activeTag);
    return matchesCategory && matchesTag;
  });



  // Create new discussion
  const handleCreateDiscussion = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      showToast('error', 'Please fill in the title and description.');
      return;
    }

    const catObj = categories.find(c => c.name.toLowerCase() === newCategory.toLowerCase()) || categories[1];
    
    // Parse tags: split by comma, clean whitespaces, prepend # if missing
    const parsedTags = newTags
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0)
      .map(t => t.startsWith('#') ? t : `#${t}`);

    const newDiscussion = {
      id: Date.now(),
      category: newCategory,
      catColor: catObj.color,
      time: 'Just now',
      votes: 1,
      title: newTitle.trim(),
      preview: newContent.trim().slice(0, 140) + (newContent.trim().length > 140 ? '…' : ''),
      content: newContent.trim(),
      author: user?.name || 'Alex Rivera',
      tags: parsedTags,
      replies: [],
      featured: false,
    };

    const updated = [newDiscussion, ...discussionList];
    saveDiscussions(updated);

    // Reset form & close
    setNewTitle('');
    setNewCategory('General');
    setNewContent('');
    setNewTags('');
    setIsNewModalOpen(false);
    showToast('success', 'Discussion thread posted successfully!');
  };

  // Post a reply
  const handlePostReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) {
      showToast('error', 'Reply comment cannot be empty.');
      return;
    }

    const newReply = {
      author: user?.name || 'Alex Rivera',
      content: replyText.trim(),
      time: 'Just now'
    };

    const updatedDiscussions = discussionList.map(d => {
      if (d.id === activeDiscussion.id) {
        const newReplies = [...d.replies, newReply];
        return { ...d, replies: newReplies };
      }
      return d;
    });

    saveDiscussions(updatedDiscussions);
    
    // Update active discussion state to render the reply immediately
    setActiveDiscussion(prev => ({
      ...prev,
      replies: [...prev.replies, newReply]
    }));

    setReplyText('');
    showToast('success', 'Comment posted!');
  };

  // Helper to count category totals
  const getCategoryCount = (catName) => {
    if (catName === 'All Topics') return discussionList.length;
    return discussionList.filter(d => d.category.toLowerCase() === catName.toLowerCase()).length;
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
                {categories.map(cat => {
                  const isActive = activeCategory === cat.name && !activeTag;
                  return (
                    <li
                      key={cat.name}
                      className={`disc-cat-item ${isActive ? 'active' : ''}`}
                      onClick={() => {
                        setActiveCategory(cat.name);
                        setActiveTag(null);
                      }}
                    >
                      <span className="disc-cat-dot" style={{ background: cat.color }} />
                      <span className="disc-cat-name">{cat.name}</span>
                      <span className="disc-cat-count">{getCategoryCount(cat.name)}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="disc-sidebar-card">
              <h4 className="disc-sidebar-title">TRENDING TAGS</h4>
              <div className="disc-tags-wrap">
                {trendingTags.map(tag => {
                  const isActive = activeTag === tag;
                  return (
                    <span 
                      key={tag} 
                      className={`disc-tag ${isActive ? 'active' : ''}`}
                      onClick={() => {
                        setActiveTag(isActive ? null : tag);
                        setActiveCategory('All Topics');
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      {tag}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main List */}
          <div className="disc-main">
            {/* Active Filter Indicator */}
            {(activeCategory !== 'All Topics' || activeTag) && (
              <div className="disc-filter-badge-row">
                <span className="disc-filter-info">
                  Showing threads in{' '}
                  <strong>
                    {activeTag ? `tag: ${activeTag}` : `category: ${activeCategory}`}
                  </strong>
                </span>
                <button 
                  className="disc-clear-filter-btn"
                  onClick={() => {
                    setActiveCategory('All Topics');
                    setActiveTag(null);
                  }}
                >
                  Clear filter <FiX size={12} />
                </button>
              </div>
            )}

            <div className="disc-thread-list">
              {filteredDiscussions.length === 0 ? (
                <div className="disc-empty-state">
                  <p>No discussion threads found matching this filter.</p>
                  <button className="disc-empty-reset" onClick={() => { setActiveCategory('All Topics'); setActiveTag(null); }}>Show All Topics</button>
                </div>
              ) : (
                filteredDiscussions.map(d => (
                  <div 
                    key={d.id} 
                    className="disc-thread" 
                    id={`discussion-${d.id}`}
                    onClick={() => setActiveDiscussion(d)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="disc-thread-body">
                      <div className="disc-thread-meta">
                        <span className="disc-thread-cat" style={{ background: `${d.catColor}18`, color: d.catColor }}>
                          {d.category}
                        </span>
                        <span className="disc-thread-time">• {d.time}</span>
                      </div>
                      <h3 className="disc-thread-title">{d.title}</h3>
                      <p className="disc-thread-preview">{d.preview}</p>
                      
                      <div className="disc-thread-tags">
                        {d.tags && d.tags.map(t => (
                          <span key={t} className="disc-thread-tag-pill">{t}</span>
                        ))}
                      </div>

                      <div className="disc-thread-footer">
                        <div className="disc-thread-author">
                          <div className="disc-author-avatar">
                            {d.author.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <span>{d.author}</span>
                        </div>
                        <span className="disc-thread-replies">
                          <FiMessageSquare size={13} style={{ marginRight: '4px' }} /> {d.replies.length} replies
                        </span>
                        {d.featured && (
                          <span className="disc-thread-featured">
                            <FiStar size={12} /> Featured
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
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
                    value={newCategory} 
                    onChange={e => setNewCategory(e.target.value)}
                  >
                    <option value="General">General</option>
                    <option value="Java">Java</option>
                    <option value="Python">Python</option>
                    <option value="Career Advice">Career Advice</option>
                  </select>
                </div>

                <div className="disc-form-group" style={{ flex: 1.2 }}>
                  <label>Tags (comma separated)</label>
                  <input 
                    type="text" 
                    value={newTags} 
                    onChange={e => setNewTags(e.target.value)} 
                    placeholder="e.g. react, algorithms, vscode"
                  />
                </div>
              </div>

              <div className="disc-form-group">
                <label>Detailed Description</label>
                <textarea 
                  value={newContent} 
                  onChange={e => setNewContent(e.target.value)} 
                  placeholder="Provide context, details, code snippets, or anything to help others understand..."
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
              <span className="disc-thread-cat" style={{ background: `${activeDiscussion.catColor}18`, color: activeDiscussion.catColor }}>
                {activeDiscussion.category}
              </span>
              <button className="disc-modal-close" onClick={() => setActiveDiscussion(null)}>
                <FiX size={20} />
              </button>
            </div>

            <div className="disc-detail-scrollable">
              {/* Opener post */}
              <div className="disc-detail-main">
                <h2 className="disc-detail-title">{activeDiscussion.title}</h2>
                <div className="disc-detail-meta">
                  <div className="disc-thread-author">
                    <div className="disc-author-avatar">
                      {activeDiscussion.author.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <span><strong>{activeDiscussion.author}</strong></span>
                  </div>
                  <span className="disc-detail-time">• {activeDiscussion.time}</span>
                </div>

                <div className="disc-detail-content">
                  {activeDiscussion.content}
                </div>

                <div className="disc-detail-tags">
                  {activeDiscussion.tags && activeDiscussion.tags.map(t => (
                    <span key={t} className="disc-thread-tag-pill">{t}</span>
                  ))}
                </div>


              </div>

              {/* Replies Section */}
              <div className="disc-replies-section">
                <h3>Replies ({activeDiscussion.replies.length})</h3>
                
                <div className="disc-replies-list">
                  {activeDiscussion.replies.length === 0 ? (
                    <div className="disc-no-replies">
                      <p>No replies yet. Be the first to answer!</p>
                    </div>
                  ) : (
                    activeDiscussion.replies.map((reply, index) => (
                      <div key={index} className="disc-reply-item">
                        <div className="disc-reply-header">
                          <div className="disc-thread-author">
                            <div className="disc-author-avatar small">
                              {reply.author.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <span><strong>{reply.author}</strong></span>
                          </div>
                          <span className="disc-reply-time">{reply.time}</span>
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
