import React from 'react';
import { FiBookmark, FiExternalLink, FiVideo, FiFileText, FiBookOpen, FiFile, FiLink, FiCheck } from 'react-icons/fi';
import { formatMinutes, humanize } from '../utils/label';

function typeIcon(type) {
  switch (String(type || '').toUpperCase()) {
    case 'VIDEO': return <FiVideo size={16} />;
    case 'PDF': return <FiFile size={16} />;
    case 'DOCUMENTATION': return <FiBookOpen size={16} />;
    case 'ARTICLE': return <FiFileText size={16} />;
    default: return <FiLink size={16} />;
  }
}

export default function ResourceCard({
  resource,
  bookmarked = false,
  completed = false,
  onToggleBookmark,
  onToggleComplete,
}) {
  const typeLabel = humanize(resource.type);
  const diffLabel = humanize(resource.difficulty);
  const minutes = formatMinutes(resource.estimatedMinutes);
  const meta = [typeLabel, resource.provider, minutes, diffLabel].filter(Boolean).join(' · ');

  const open = () => {
    if (resource.url) {
      window.open(resource.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className={`rc-row ${completed ? 'is-completed' : ''}`}>
      <div className="rc-row-icon" aria-hidden>{typeIcon(resource.type)}</div>
      <div className="rc-row-body">
        <h4 className="rc-row-title" onClick={open}>{resource.title}</h4>
        <p className="rc-row-meta">{meta}</p>
      </div>
      <div className="rc-row-actions">
        {onToggleComplete && (
          <button
            type="button"
            className={`rc-icon-action ${completed ? 'is-done' : ''}`}
            onClick={() => onToggleComplete(resource)}
            title={completed ? 'Undo complete' : 'Mark complete'}
            aria-label={completed ? 'Undo complete' : 'Mark complete'}
          >
            <FiCheck size={16} />
          </button>
        )}
        {onToggleBookmark && (
          <button
            type="button"
            className={`rc-icon-action ${bookmarked ? 'is-saved' : ''}`}
            onClick={() => onToggleBookmark(resource)}
            title={bookmarked ? 'Remove bookmark' : 'Bookmark'}
            aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark'}
          >
            <FiBookmark size={16} fill={bookmarked ? 'currentColor' : 'none'} />
          </button>
        )}
        <button type="button" className="rc-row-open" onClick={open} disabled={!resource.url}>
          Open <FiExternalLink size={13} />
        </button>
      </div>
    </div>
  );
}
