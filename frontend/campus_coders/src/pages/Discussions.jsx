import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  FiArrowLeft, FiChevronDown, FiChevronUp, FiEdit3,
  FiMessageSquare, FiSearch, FiSend, FiX, FiMoreVertical
} from 'react-icons/fi';
import DashboardLayout from '../components/DashboardLayout';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

const FILTERS = [
  { id: 'latest', label: 'Latest' },
  { id: 'top', label: 'Top' },
  { id: 'unanswered', label: 'Unanswered' },
];

function parseTags(tags) {
  if (!tags) return [];
  return String(tags).split(',').map((t) => t.trim()).filter(t => t && ALLOWED_TAGS.includes(t));
}

function initials(name) {
  if (!name) return 'U';
  return name.slice(0, 2).toUpperCase();
}

function timeAgo(iso) {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  const sec = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (sec < 60) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(iso).toLocaleDateString();
}

function VoteRail({ score, userVote, onVote }) {
  const vote = Number(userVote) || 0;
  const displayScore = Number(score) || 0;
  const downDisabled = displayScore <= 0 && vote !== 1;

  return (
    <div className="disc-vote-col">
      <button
        type="button"
        className={`disc-vote-btn up ${vote === 1 ? 'active' : ''}`}
        aria-label="Upvote"
        onClick={(e) => { e.stopPropagation(); onVote(1); }}
      >
        <FiChevronUp size={22} />
      </button>
      <span className="disc-vote-count">{displayScore}</span>
      <button
        type="button"
        className={`disc-vote-btn down ${vote === -1 ? 'active' : ''}`}
        aria-label="Downvote"
        disabled={downDisabled}
        onClick={(e) => {
          e.stopPropagation();
          if (downDisabled) return;
          onVote(-1);
        }}
      >
        <FiChevronDown size={22} />
      </button>
    </div>
  );
}

const ALLOWED_TAGS = [
  "java", "python", "c++", "javascript", "typescript", "go", "rust", "sql", "html", "css",
  "react", "spring-boot", "nodejs", "django", "angular", "vue", "express", "mongodb", "postgresql", "docker", "aws", "git",
  "frontend", "backend", "full-stack", "mobile", "machine-learning", "data-science", "devops", "cloud", "cybersecurity",
  "dsa", "system-design", "object-oriented-programming", "database-design", "api", "testing",
  "interview-experience", "resume-review", "compensation", "tips", "off-campus", "internship", "hackathon", "competitive-programming", "contest",
  "array", "string", "dynamic-programming", "two-pointers", "graph", "tree", "greedy", "math"
];

function TagSelector({ selectedTagsStr, onChange }) {
  const selectedTags = parseTags(selectedTagsStr);

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter(t => t !== tag).join(', '));
    } else {
      if (selectedTags.length >= 5) {
        alert("You can only select up to 5 tags.");
        return;
      }
      onChange([...selectedTags, tag].join(', '));
    }
  };

  return (
    <div className="disc-tag-selector-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '150px', overflowY: 'auto', padding: '10px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--surface-hover)' }}>
      {ALLOWED_TAGS.map(tag => (
        <button
          key={tag}
          type="button"
          onClick={() => toggleTag(tag)}
          style={{
            padding: '4px 10px',
            borderRadius: '12px',
            border: 'none',
            fontSize: '12px',
            cursor: 'pointer',
            backgroundColor: selectedTags.includes(tag) ? 'var(--primary)' : 'var(--border)',
            color: selectedTags.includes(tag) ? 'white' : 'var(--text)',
            transition: 'all 0.2s'
          }}
        >
          #{tag}
        </button>
      ))}
    </div>
  );
}

export default function Discussions() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [categories, setCategories] = useState([]);
  const [discussionList, setDiscussionList] = useState([]);
  const [activeCategorySlug, setActiveCategorySlug] = useState('all');
  const [activeTag, setActiveTag] = useState(null);
  const [activeFilter, setActiveFilter] = useState('latest');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [thread, setThread] = useState(null);
  const [threadLoading, setThreadLoading] = useState(false);
  const [popularTags, setPopularTags] = useState([]);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategoryId, setNewCategoryId] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');
  const [replyText, setReplyText] = useState('');
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const [editPostModal, setEditPostModal] = useState({ isOpen: false, id: null, title: '', categoryId: '', content: '', tags: '' });
  const [editReplyModal, setEditReplyModal] = useState({ isOpen: false, id: null, content: '' });

  useEffect(() => {
    const closeDropdown = () => setActiveDropdown(null);
    window.addEventListener('click', closeDropdown);
    return () => window.removeEventListener('click', closeDropdown);
  }, []);

  const handleCategoryClick = (slug) => {
    setActiveCategorySlug(slug);
    setActiveTag(null);
    if (postId) navigate('/dashboard/discussions');
  };

  const handleTagClick = (tag) => {
    setActiveTag(tag === activeTag ? null : tag);
    if (postId) navigate('/dashboard/discussions');
  };
  const showToast = useCallback((type, message) => setToast({ show: true, type, message }), []);
  const hideToast = useCallback(() => setToast((p) => ({ ...p, show: false })), []);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/discussion-categories');
        setCategories(res.data || []);
        if (res.data?.[0]) setNewCategoryId(String(res.data[0].id));
      } catch {
        showToast('error', 'Could not load categories.');
      }
    })();
  }, [showToast]);

  useEffect(() => {
    (async () => {
      try {
        const tagRes = await api.get('/discussions/tags/popular');
        setPopularTags(tagRes.data || []);
      } catch {
        setPopularTags([]);
      }
    })();
  }, []);

  const fetchDiscussions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: '0', size: '30', filter: activeFilter });
      if (activeCategorySlug !== 'all') params.set('categorySlug', activeCategorySlug);
      if (search) params.set('search', search);
      const res = await api.get(`/discussions?${params.toString()}`);
      let list = res.data?.content || [];
      if (activeTag) {
        list = list.filter((d) => parseTags(d.tags).some((t) => t.toLowerCase() === activeTag.toLowerCase()));
      }
      setDiscussionList(list);
    } catch {
      showToast('error', 'Could not load discussions.');
      setDiscussionList([]);
    } finally {
      setLoading(false);
    }
  }, [activeCategorySlug, activeFilter, search, activeTag, showToast]);

  useEffect(() => { fetchDiscussions(); }, [fetchDiscussions]);

  useEffect(() => {
    if (!postId) {
      setThread(null);
      setReplyText('');
      return;
    }
    let cancelled = false;
    (async () => {
      setThreadLoading(true);
      try {
        const res = await api.get(`/discussions/${postId}`);
        if (!cancelled) setThread(res.data);
      } catch {
        if (!cancelled) {
          setThread(null);
          showToast('error', 'Thread not found.');
        }
      } finally {
        if (!cancelled) setThreadLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [postId, showToast]);

  const applyVoteToList = (updated) => {
    setDiscussionList((prev) => prev.map((p) => (Number(p.id) === Number(updated.id)
      ? { ...p, voteScore: updated.voteScore, userVote: updated.userVote }
      : p)));
  };

  const handleVote = async (id, value) => {
    try {
      const res = await api.post(`/discussions/${id}/vote`, { voteValue: value });
      applyVoteToList(res.data);
      if (thread && Number(thread.id) === Number(id)) {
        setThread((prev) => ({ ...prev, voteScore: res.data.voteScore, userVote: res.data.userVote }));
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Could not vote.');
    }
  };

  const handleCreateDiscussion = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim() || !newCategoryId) {
      showToast('error', 'Title, category, and content are required.');
      return;
    }
    try {
      await api.post('/discussions', {
        title: newTitle.trim(),
        content: newContent.trim(),
        categoryId: Number(newCategoryId),
        tags: newTags.trim() || null,
      });
      setNewTitle('');
      setNewContent('');
      setNewTags('');
      setIsNewModalOpen(false);
      showToast('success', 'Thread posted.');
      fetchDiscussions();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Could not post.');
    }
  };

  const handlePostReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !thread) return;
    try {
      const res = await api.post(`/discussions/${thread.id}/replies`, { content: replyText.trim() });
      setThread((prev) => ({
        ...prev,
        replies: [...(prev.replies || []), res.data],
        repliesCount: (prev.repliesCount || 0) + 1,
      }));
      setReplyText('');
      fetchDiscussions();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Could not reply.');
    }
  };

  const handleEditPost = async (e) => {
    e.preventDefault();
    if (!editPostModal.title.trim() || !editPostModal.content.trim() || !editPostModal.categoryId) return;
    try {
      const res = await api.put(`/discussions/${editPostModal.id}`, {
        title: editPostModal.title.trim(),
        content: editPostModal.content.trim(),
        categoryId: Number(editPostModal.categoryId),
        tags: editPostModal.tags.trim() || null,
      });
      setThread((prev) => ({ ...prev, ...res.data }));
      setEditPostModal({ isOpen: false, id: null, title: '', categoryId: '', content: '', tags: '' });
      showToast('success', 'Thread updated.');
      fetchDiscussions();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Could not update thread.');
    }
  };

  const handleEditReply = async (e) => {
    e.preventDefault();
    if (!editReplyModal.content.trim()) return;
    try {
      const res = await api.put(`/discussions/replies/${editReplyModal.id}`, {
        content: editReplyModal.content.trim(),
      });
      setThread((prev) => ({
        ...prev,
        replies: (prev.replies || []).map((r) => r.id === editReplyModal.id ? { ...r, content: res.data.content } : r),
      }));
      setEditReplyModal({ isOpen: false, id: null, content: '' });
      showToast('success', 'Reply updated.');
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Could not update reply.');
    }
  };

  const isAuthor = thread && user?.id && thread.authorId === user.id;
  const isAdmin = user?.role === 'admin';
  const canModerate = isAuthor || isAdmin;

  const deleteReply = (replyId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Reply',
      message: 'Are you sure you want to delete this reply? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await api.delete(`/discussions/replies/${replyId}`);
          setThread((prev) => ({
            ...prev,
            replies: (prev.replies || []).filter((r) => r.id !== replyId),
            repliesCount: Math.max(0, (prev.repliesCount || 0) - 1)
          }));
          showToast('success', 'Reply deleted');
        } catch (err) {
          showToast('error', err.response?.data?.message || 'Could not delete reply.');
        }
        setConfirmModal({ isOpen: false });
      }
    });
  };

  const deletePost = () => {
    if (!thread) return;
    setConfirmModal({
      isOpen: true,
      title: 'Delete Discussion',
      message: 'Are you sure you want to delete this entire discussion? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await api.delete(`/discussions/${thread.id}`);
          showToast('success', 'Discussion deleted');
          navigate('/dashboard/discussions');
        } catch (err) {
          showToast('error', err.response?.data?.message || 'Could not delete discussion.');
        }
        setConfirmModal({ isOpen: false });
      }
    });
  };

  const toggleClosed = async () => {
    if (!thread) return;
    try {
      const path = thread.closed ? 'reopen' : 'close';
      const res = await api.patch(`/discussions/${thread.id}/${path}`);
      setThread((prev) => ({ ...prev, closed: res.data.closed }));
      applyVoteToList(res.data);
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Could not update thread.');
    }
  };

  return (
    <DashboardLayout>
      <div className="disc-page">
        <Toast type={toast.type} message={toast.message} show={toast.show} onClose={hideToast} />

        <div className="disc-header">
          <div className="disc-page-intro">
            <h1>Discussions</h1>
            <p>Ask, vote, and help other learners.</p>
          </div>
          <button type="button" className="disc-new-btn" onClick={() => setIsNewModalOpen(true)}>
            <FiEdit3 size={16} /> New thread
          </button>
        </div>

        <div className="disc-layout">
          <aside className="disc-sidebar">
            <div className="disc-sidebar-card">
              <h4 className="disc-sidebar-title">Categories</h4>
              <ul className="disc-cat-list">
                <li
                  className={`disc-cat-item ${activeCategorySlug === 'all' ? 'active' : ''}`}
                  onClick={() => handleCategoryClick('all')}
                >
                  <span className="disc-cat-dot" style={{ background: 'var(--gold)' }} />
                  <span className="disc-cat-name">All</span>
                </li>
                {categories.map((cat) => (
                  <li
                    key={cat.id}
                    className={`disc-cat-item ${activeCategorySlug === cat.slug ? 'active' : ''}`}
                    onClick={() => handleCategoryClick(cat.slug)}
                  >
                    <span className="disc-cat-dot" style={{ background: cat.color || 'var(--gold)' }} />
                    <span className="disc-cat-name">{cat.name}</span>
                  </li>
                ))}
              </ul>
            </div>
            {popularTags.filter(t => ALLOWED_TAGS.includes(t.tag)).length > 0 && (
              <div className="disc-sidebar-card">
                <h4 className="disc-sidebar-title">Popular tags</h4>
                <div className="disc-tags-wrap">
                  {popularTags.filter(t => ALLOWED_TAGS.includes(t.tag)).map((t) => (
                    <button
                      key={t.tag}
                      type="button"
                      className={`disc-tag ${activeTag === t.tag ? 'active' : ''}`}
                      onClick={() => handleTagClick(t.tag)}
                    >
                      #{t.tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </aside>

          <div className="disc-feed">
            {postId ? (
              <div className="disc-thread-view">
                <button type="button" className="disc-back-link" onClick={() => navigate('/dashboard/discussions')}>
                  <FiArrowLeft size={16} /> All threads
                </button>
                {threadLoading && <p className="sd-muted">Loading thread...</p>}
                {!threadLoading && !thread && <p className="sd-muted">This thread is not available.</p>}
                {thread && (
                  <>
                    <article className="disc-post-card">
                      <VoteRail
                        score={thread.voteScore}
                        userVote={thread.userVote}
                        onVote={(v) => handleVote(thread.id, v)}
                      />
                      <div className="disc-thread-body">
                        <div className="disc-thread-meta">
                          <span className="disc-thread-cat" style={{ background: `${thread.categoryColor || '#C5A028'}22`, color: thread.categoryColor || '#7A6410' }}>
                            {thread.categoryName}
                          </span>
                          {thread.featured && <span className="disc-thread-featured">Featured</span>}
                          {thread.closed && <span className="disc-pill-closed">Closed</span>}
                          <span className="disc-thread-time">{timeAgo(thread.createdAt)}</span>
                        </div>
                        <h2 className="disc-detail-title">{thread.title}</h2>
                        <p className="disc-detail-content">{thread.content}</p>
                        <div className="disc-thread-tags">
                          {parseTags(thread.tags).map((tag) => (
                            <span key={tag} className="disc-thread-tag-pill">#{tag}</span>
                          ))}
                        </div>
                        <div className="disc-thread-footer">
                          <div className="disc-thread-author">
                            <Link to={`/dashboard/profile/${thread.authorId}`} className="disc-author-avatar-link" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'inherit' }}>
                              <div className="disc-author-avatar">{initials(thread.authorName)}</div>
                              <span>{thread.authorName}</span>
                            </Link>
                          </div>
                          {canModerate && (
                            <div className="disc-dropdown-container">
                              <button type="button" className="disc-icon-btn" onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === `post-${thread.id}` ? null : `post-${thread.id}`); }}>
                                <FiMoreVertical size={18} />
                              </button>
                              {activeDropdown === `post-${thread.id}` && (
                                <div className="disc-dropdown-menu">
                                  <button type="button" onClick={() => { 
                                    setActiveDropdown(null); 
                                    setEditPostModal({
                                      isOpen: true,
                                      id: thread.id,
                                      title: thread.title,
                                      categoryId: thread.categoryId,
                                      content: thread.content,
                                      tags: thread.tags
                                    });
                                  }}>
                                    Edit post
                                  </button>
                                  <button type="button" onClick={() => { setActiveDropdown(null); toggleClosed(); }}>
                                    {thread.closed ? 'Reopen' : 'Close thread'}
                                  </button>
                                  <button type="button" onClick={() => { setActiveDropdown(null); deletePost(); }} style={{color: '#ff4d4f'}}>
                                    Delete post
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </article>

                    <h3 className="disc-replies-heading">
                      {thread.repliesCount || (thread.replies || []).length} replies
                    </h3>
                    {(thread.replies || []).length === 0 ? (
                      <p className="sd-muted">No replies yet.</p>
                    ) : (
                      <div className="disc-replies-list">
                        {(thread.replies || []).map((reply) => (
                          <div key={reply.id} className="disc-reply-item">
                            <div className="disc-reply-header">
                              <div className="disc-thread-author">
                                <Link to={`/dashboard/profile/${reply.authorId}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'inherit' }}>
                                  <div className="disc-author-avatar small">{initials(reply.authorName)}</div>
                                  <span><strong>{reply.authorName}</strong></span>
                                </Link>
                              </div>
                              <span className="disc-reply-time">{timeAgo(reply.createdAt)}</span>
                              {(isAdmin || (user?.id === reply.authorId)) && (
                                <div className="disc-dropdown-container">
                                  <button type="button" className="disc-icon-btn" onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === `reply-${reply.id}` ? null : `reply-${reply.id}`); }}>
                                    <FiMoreVertical size={18} />
                                  </button>
                                  {activeDropdown === `reply-${reply.id}` && (
                                    <div className="disc-dropdown-menu">
                                      <button type="button" onClick={() => {
                                        setActiveDropdown(null);
                                        setEditReplyModal({
                                          isOpen: true,
                                          id: reply.id,
                                          content: reply.content
                                        });
                                      }}>
                                        Edit reply
                                      </button>
                                      <button type="button" onClick={() => { setActiveDropdown(null); deleteReply(reply.id); }} style={{color: '#ff4d4f'}}>
                                        Delete reply
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="disc-reply-body">{reply.content}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {thread.closed ? (
                      <p className="sd-muted">This thread is closed.</p>
                    ) : (
                      <form onSubmit={handlePostReply} className="disc-reply-form inline">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write a reply..."
                          rows={3}
                          required
                        />
                        <button type="submit" className="disc-reply-submit"><FiSend size={15} /> Reply</button>
                      </form>
                    )}
                  </>
                )}
              </div>
            ) : (
              <>
                <div className="disc-toolbar">
                  <div className="disc-search-wrap">
                    <FiSearch size={15} />
                    <input
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      placeholder="Search threads..."
                    />
                  </div>
                  <div className="disc-filters">
                    {FILTERS.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        className={`disc-filter-btn ${activeFilter === f.id ? 'active' : ''}`}
                        onClick={() => {
                          setActiveFilter(f.id);
                          if (postId) navigate('/dashboard/discussions');
                        }}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {activeTag && (
                  <div className="disc-filter-badge-row">
                    <span className="disc-filter-info">Tag: #{activeTag}</span>
                    <button type="button" className="disc-clear-filter-btn" onClick={() => setActiveTag(null)}>
                      Clear
                    </button>
                  </div>
                )}

                <div className="disc-thread-list">
                  {loading && <p className="sd-muted">Loading...</p>}
                  {!loading && discussionList.length === 0 && (
                    <div className="disc-empty-state">
                      <p>No threads here yet. Start one.</p>
                    </div>
                  )}
                  {!loading && discussionList.map((d) => (
                    <article
                      key={d.id}
                      className="disc-thread"
                      onClick={() => navigate(`/dashboard/discussions/${d.id}`)}
                    >
                      <VoteRail
                        score={d.voteScore}
                        userVote={d.userVote}
                        onVote={(v) => handleVote(d.id, v)}
                      />
                      <div className="disc-thread-body">
                        <div className="disc-thread-meta">
                          <span className="disc-thread-cat" style={{ background: `${d.categoryColor || '#C5A028'}22`, color: d.categoryColor || '#7A6410' }}>
                            {d.categoryName}
                          </span>
                          {d.featured && <span className="disc-thread-featured">Featured</span>}
                          {d.closed && <span className="disc-pill-closed">Closed</span>}
                          <span className="disc-thread-time">{timeAgo(d.createdAt)}</span>
                        </div>
                        <h3 className="disc-thread-title">{d.title}</h3>
                        {d.contentPreview && <p className="disc-thread-preview">{d.contentPreview}</p>}
                        <div className="disc-thread-tags">
                          {parseTags(d.tags).map((tag) => (
                            <span
                              key={tag}
                              className="disc-thread-tag-pill"
                              onClick={(e) => { e.stopPropagation(); setActiveTag(tag); }}
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                        <div className="disc-thread-footer">
                          <div className="disc-thread-author">
                            <Link to={`/dashboard/profile/${d.authorId}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'inherit' }}>
                              <div className="disc-author-avatar">{initials(d.authorName)}</div>
                              <span>{d.authorName}</span>
                            </Link>
                          </div>
                          <span className="disc-thread-replies">
                            <FiMessageSquare size={13} /> {d.repliesCount || 0}
                          </span>

                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {isNewModalOpen && (
        <div className="disc-modal-overlay" onClick={() => setIsNewModalOpen(false)}>
          <div className="disc-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="disc-modal-header">
              <h3>New thread</h3>
              <button type="button" className="disc-modal-close" onClick={() => setIsNewModalOpen(false)}>
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateDiscussion} className="disc-modal-form">
              <div className="disc-form-group">
                <label>Title</label>
                <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required />
              </div>
              <div className="disc-form-group">
                <label>Category</label>
                <select value={newCategoryId} onChange={(e) => setNewCategoryId(e.target.value)} required>
                  <option value="" disabled>Select a category...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="disc-form-group">
                <label>Body</label>
                <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} rows={6} required />
              </div>
              <div className="disc-form-group">
                <label>Select up to 5 tags</label>
                <TagSelector selectedTagsStr={newTags} onChange={setNewTags} />
              </div>
              <div className="disc-modal-footer">
                <button type="button" className="disc-btn-cancel" onClick={() => setIsNewModalOpen(false)}>Cancel</button>
                <button type="submit" className="disc-btn-submit">Post</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editPostModal.isOpen && (
        <div className="disc-modal-overlay" onClick={() => setEditPostModal({ isOpen: false, id: null, title: '', categoryId: '', content: '', tags: '' })}>
          <div className="disc-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="disc-modal-header">
              <h3>Edit thread</h3>
              <button type="button" className="disc-modal-close" onClick={() => setEditPostModal({ isOpen: false, id: null, title: '', categoryId: '', content: '', tags: '' })}>
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleEditPost} className="disc-modal-form">
              <div className="disc-form-group">
                <label>Title</label>
                <input value={editPostModal.title} onChange={(e) => setEditPostModal({ ...editPostModal, title: e.target.value })} required />
              </div>
              <div className="disc-form-group">
                <label>Category</label>
                <select value={editPostModal.categoryId} onChange={(e) => setEditPostModal({ ...editPostModal, categoryId: e.target.value })} required>
                  <option value="" disabled>Select a category...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="disc-form-group">
                <label>Body</label>
                <textarea value={editPostModal.content} onChange={(e) => setEditPostModal({ ...editPostModal, content: e.target.value })} rows={6} required />
              </div>
              <div className="disc-form-group">
                <label>Select up to 5 tags</label>
                <TagSelector selectedTagsStr={editPostModal.tags} onChange={(tags) => setEditPostModal({ ...editPostModal, tags })} />
              </div>
              <div className="disc-modal-footer">
                <button type="button" className="disc-btn-cancel" onClick={() => setEditPostModal({ isOpen: false, id: null, title: '', categoryId: '', content: '', tags: '' })}>Cancel</button>
                <button type="submit" className="disc-btn-submit">Save changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editReplyModal.isOpen && (
        <div className="disc-modal-overlay" onClick={() => setEditReplyModal({ isOpen: false, id: null, content: '' })}>
          <div className="disc-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="disc-modal-header">
              <h3>Edit reply</h3>
              <button type="button" className="disc-modal-close" onClick={() => setEditReplyModal({ isOpen: false, id: null, content: '' })}>
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleEditReply} className="disc-modal-form">
              <div className="disc-form-group">
                <label>Reply Body</label>
                <textarea value={editReplyModal.content} onChange={(e) => setEditReplyModal({ ...editReplyModal, content: e.target.value })} rows={5} required />
              </div>
              <div className="disc-modal-footer">
                <button type="button" className="disc-btn-cancel" onClick={() => setEditReplyModal({ isOpen: false, id: null, content: '' })}>Cancel</button>
                <button type="submit" className="disc-btn-submit">Save reply</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmModal.isOpen && (
        <div className="disc-modal-overlay" onClick={() => setConfirmModal({ isOpen: false })}>
          <div className="disc-modal-container confirm" onClick={(e) => e.stopPropagation()}>
            <div className="disc-modal-header">
              <h3>{confirmModal.title}</h3>
              <button type="button" className="disc-modal-close" onClick={() => setConfirmModal({ isOpen: false })}>
                <FiX size={20} />
              </button>
            </div>
            <div className="disc-modal-body" style={{ padding: '20px', color: 'var(--ink-light)' }}>
              {confirmModal.message}
            </div>
            <div className="disc-modal-footer">
              <button type="button" className="disc-btn-cancel" onClick={() => setConfirmModal({ isOpen: false })}>Cancel</button>
              <button type="button" className="disc-btn-submit" style={{ background: '#ff4d4f', color: '#fff', border: 'none' }} onClick={confirmModal.onConfirm}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <Toast
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={hideToast}
      />
    </DashboardLayout>
  );
}
