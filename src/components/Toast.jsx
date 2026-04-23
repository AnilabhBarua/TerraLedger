import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext(null);

let _toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    // Remove from DOM after exit animation (300ms)
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }, 350);
  }, []);

  /**
   * addToast: display a notification toast.
   * @param {string} title   - Short title line
   * @param {string} message - Detail line (optional)
   * @param {'pending'|'success'|'error'|'info'} status
   * @param {number}  duration - Auto-dismiss ms (0 = sticky until dismiss)
   * @returns {number} id — use to update the toast later with updateToast()
   */
  const addToast = useCallback((title, message = '', status = 'info', duration = 4000) => {
    const id = ++_toastId;
    setToasts(prev => [...prev, { id, title, message, status, exiting: false }]);

    if (duration > 0) {
      timers.current[id] = setTimeout(() => dismiss(id), duration);
    }
    return id;
  }, [dismiss]);

  /**
   * updateToast: mutate an existing toast in place (e.g. pending → success).
   */
  const updateToast = useCallback((id, title, message = '', status = 'info', duration = 4000) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, title, message, status } : t));

    // Reset auto-dismiss timer
    if (timers.current[id]) clearTimeout(timers.current[id]);
    if (duration > 0) {
      timers.current[id] = setTimeout(() => dismiss(id), duration);
    }
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ addToast, updateToast, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

// ─── Internal container rendered via portal ───────────────────────────────────

import { createPortal } from 'react-dom';
import './Toast.css';

function ToastContainer({ toasts, dismiss }) {
  return createPortal(
    <div className="toast-viewport" aria-live="polite" aria-atomic="false">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
      ))}
    </div>,
    document.body
  );
}

function ToastItem({ toast, onDismiss }) {
  const icons = {
    pending: (
      <svg className="toast-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
        <path d="M12 2a10 10 0 0 1 10 10" />
      </svg>
    ),
    success: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    error: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
    info: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  };

  return (
    <div className={`toast toast--${toast.status} ${toast.exiting ? 'toast--exit' : 'toast--enter'}`} role="alert">
      <div className={`toast__icon-wrap toast__icon-wrap--${toast.status}`}>
        {icons[toast.status] || icons.info}
      </div>
      <div className="toast__body">
        <p className="toast__title">{toast.title}</p>
        {toast.message && <p className="toast__message">{toast.message}</p>}
      </div>
      <button className="toast__close" onClick={onDismiss} aria-label="Dismiss">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
