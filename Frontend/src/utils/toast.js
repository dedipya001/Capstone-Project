// src/utils/toast.js
import { toast } from 'react-toastify';

// Store IDs of notifications to prevent duplication
const shownNotifications = new Set();

/**
 * Show a toast notification only once per session
 * @param {string} id - Unique identifier for this notification
 * @param {string} message - Notification message
 * @param {string} type - Notification type (info, success, warning, error)
 * @param {object} options - Additional toast options
 */
export const showOnce = (id, message, type = 'info', options = {}) => {
  if (shownNotifications.has(id)) return;
  
  shownNotifications.add(id);
  
  switch (type) {
    case 'success':
      toast.success(message, options);
      break;
    case 'warning':
      toast.warning(message, options);
      break;
    case 'error':
      toast.error(message, options);
      break;
    case 'info':
    default:
      toast.info(message, options);
      break;
  }
};

/**
 * Clear all shown notification records
 * Useful when user logs out or for testing
 */
export const resetNotificationHistory = () => {
  shownNotifications.clear();
};

/**
 * Standard toast methods (these will show every time called)
 */
export const showToast = {
  success: (message, options = {}) => toast.success(message, options),
  error: (message, options = {}) => toast.error(message, options),
  info: (message, options = {}) => toast.info(message, options),
  warning: (message, options = {}) => toast.warning(message, options),
};