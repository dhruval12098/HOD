'use client';

import { createContext, useCallback, useContext, useRef, useState } from 'react';

/* ─── Context ─── */
interface ToastContextValue {
  showToast: (msg: string) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

/* ─── Provider + UI ─── */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    setMessage(msg);
    setVisible(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(false), 3200);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast message={message} visible={visible} />
    </ToastContext.Provider>
  );
}

/* ─── Toast UI ─── */
interface ToastProps {
  message: string;
  visible: boolean;
}

export function Toast({ message, visible }: ToastProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: '30px',
        left: '50%',
        transform: visible
          ? 'translateX(-50%) translateY(0)'
          : 'translateX(-50%) translateY(100px)',
        background: 'var(--ink)',
        color: 'var(--bg)',
        padding: '14px 26px',
        borderRadius: '4px',
        fontSize: '11px',
        letterSpacing: '0.1em',
        zIndex: 10001,
        opacity: visible ? 1 : 0,
        transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
        maxWidth: '90%',
        textAlign: 'center',
        boxShadow: 'var(--shadow-lg)',
        borderLeft: '3px solid var(--theme-ink)',
        fontFamily: 'var(--sans)',
        pointerEvents: 'none',
      }}
    >
      {message}
    </div>
  );
}

/* ─── Standalone usage (no context needed) ─── */
export default Toast;
