import React from 'react';
import {
  FiBookmark, FiExternalLink, FiCheck, FiVideo,
  FiFileText, FiBookOpen, FiFile, FiLink, FiAward
} from 'react-icons/fi';
import { useProgress } from '../context/ProgressContext';

export default function ResourceCard({
  resource,
  compact = false,
  onToggleBookmark,
  onToggleCompleted
}) {
  const { isBookmarked, isCompleted, toggleBookmark, toggleCompleted } = useProgress();
  const bookmarked = isBookmarked(resource.id, resource.bookmarked);
  const completed = isCompleted(resource.id, resource.completed);

  const handleBookmark = (e) => {
    e.stopPropagation();
    toggleBookmark(resource.id);
    if (onToggleBookmark) onToggleBookmark(resource.id, !bookmarked);
  };

  const handleCompleted = (e) => {
    e.stopPropagation();
    toggleCompleted(resource.id);
    if (onToggleCompleted) onToggleCompleted(resource.id, !completed);
  };

  const handleOpen = () => {
    if (resource.url && resource.url !== '#pdf' && resource.url !== '#pdf-download') {
      window.open(resource.url, '_blank', 'noopener,noreferrer');
    } else {
      alert(`Opening resource: ${resource.title} (${resource.fileName || 'Document'})`);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Video': return <FiVideo size={14} />;
      case 'PDF': return <FiFile size={14} />;
      case 'Documentation': return <FiBookOpen size={14} />;
      case 'Article': return <FiFileText size={14} />;
      default: return <FiLink size={14} />;
    }
  };

  const getDifficultyBadgeClass = (diff) => {
    switch (diff) {
      case 'Beginner': return 'badge-diff-beginner';
      case 'Intermediate': return 'badge-diff-intermediate';
      case 'Advanced': return 'badge-diff-advanced';
      default: return 'badge-diff-beginner';
    }
  };

  if (compact) {
    return (
      <div className={`rc-card-compact ${completed ? 'completed' : ''}`}>
        <div 
          className="rc-compact-thumb"
          style={{ background: resource.thumbnailBg || 'var(--color-dark-card)' }}
        >
          {getTypeIcon(resource.type)}
        </div>
        <div className="rc-compact-body">
          <div className="rc-compact-title" title={resource.title}>{resource.title}</div>
          <div className="rc-compact-meta">
            <span className={`rc-type-tag ${resource.type.toLowerCase()}`}>{resource.type}</span>
            <span className={`rc-diff-tag ${getDifficultyBadgeClass(resource.difficulty)}`}>{resource.difficulty}</span>
            <span>• {resource.duration}</span>
            {resource.recommended && (
              <span className="rc-club-tag" title="Club Recommended">
                <FiAward size={12} /> Recommended
              </span>
            )}
          </div>
        </div>
        <div className="rc-compact-actions">
          <button 
            className={`rc-icon-btn ${bookmarked ? 'bookmarked' : ''}`}
            onClick={handleBookmark}
            title={bookmarked ? 'Remove Bookmark' : 'Bookmark Resource'}
          >
            <FiBookmark size={16} fill={bookmarked ? 'currentColor' : 'none'} />
          </button>
          <button className="rc-open-btn" onClick={handleOpen} title="Open Resource">
            <FiExternalLink size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`rc-card ${completed ? 'is-completed' : ''}`}>
      {/* Thumbnail / Header Box */}
      <div 
        className="rc-thumb"
        style={{ background: resource.thumbnailBg || '#181C24' }}
      >
        <span className="rc-thumb-tag">{resource.thumbnailTag || resource.type}</span>
        <div className="rc-thumb-center-icon">
          {getTypeIcon(resource.type)}
        </div>
        {resource.recommended && (
          <span className="rc-recommended-badge">
            ⭐ Recommended
          </span>
        )}
      </div>

      {/* Body Content */}
      <div className="rc-content">
        <div className="rc-header-row">
          <span className={`rc-type-badge ${resource.type.toLowerCase()}`}>
            {getTypeIcon(resource.type)} {resource.type.toUpperCase()}
          </span>
          {resource.source && (
            <span className="rc-source-name">
              {resource.source} {resource.verifiedSource && <span className="rc-verified-check">✓</span>}
            </span>
          )}
        </div>

        <h4 className="rc-title" onClick={handleOpen}>{resource.title}</h4>

        <div className="rc-details-row">
          <span className="rc-detail-item">{resource.duration}</span>
          <span className={`rc-diff-pill ${getDifficultyBadgeClass(resource.difficulty)}`}>
            ● {resource.difficulty}
          </span>
          {resource.bookmarkCount > 0 && (
            <span className="rc-detail-item">🔖 {resource.bookmarkCount} Bookmarks</span>
          )}
        </div>

        {/* Tags */}
        {resource.tags && resource.tags.length > 0 && (
          <div className="rc-tags-list">
            {resource.tags.map((t, idx) => (
              <span key={idx} className="rc-tag-chip">#{t}</span>
            ))}
          </div>
        )}

        {/* Actions Footer */}
        <div className="rc-footer-actions" style={{ justifyContent: 'flex-end' }}>
          <div className="rc-footer-right">
            <button 
              className={`rc-btn-bookmark ${bookmarked ? 'active' : ''}`}
              onClick={handleBookmark}
              title={bookmarked ? 'Bookmarked' : 'Bookmark'}
            >
              <FiBookmark size={16} fill={bookmarked ? 'currentColor' : 'none'} />
            </button>
            <button className="rc-btn-open" onClick={handleOpen}>
              Open <FiExternalLink size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
