import React, { useEffect } from 'react';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';

/**
 * Toast notification component — renders a dismissible inline alert.
 *
 * @param {string}   type      - 'success' | 'error' | 'info'
 * @param {string}   message   - The message to display
 * @param {boolean}  show      - Whether to show the toast
 * @param {function} onClose   - Called to dismiss the toast
 * @param {number}   duration  - Auto-dismiss after ms (default 4000, 0 = no auto)
 */
export default function Toast({ type = 'success', message, show, onClose, duration = 4000 }) {
  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => onClose?.(), duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show) return null;

  const config = {
    success: { icon: <FiCheckCircle size={18} />, className: 'toast-success' },
    error:   { icon: <FiAlertCircle size={18} />,  className: 'toast-error'   },
    info:    { icon: <FiInfo size={18} />,          className: 'toast-info'    },
  };

  const { icon, className } = config[type] || config.success;

  return (
    <div className={`toast-notification ${className}`} role="alert">
      <span className="toast-icon">{icon}</span>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose} aria-label="Dismiss">
        <FiX size={14} />
      </button>
    </div>
  );
}
