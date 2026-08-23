import React from 'react';

export default function EmptyState({ title, description, action, children }) {
  return (
    <div className="empty-state">
      {title && <h3>{title}</h3>}
      {description && <p>{description}</p>}
      {action}
      {children}
    </div>
  );
}
