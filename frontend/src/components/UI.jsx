import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

/* ---------- toasts + confirm dialog ---------- */
const UIContext = createContext(null);
export const useToast = () => useContext(UIContext).toast;
export const useConfirm = () => useContext(UIContext).confirm;

export function UIProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [dialog, setDialog] = useState(null);
  const id = useRef(0);

  const push = useCallback((text, error) => {
    const key = ++id.current;
    setToasts((t) => [...t, { key, text, error }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.key !== key)), 4000);
  }, []);
  const toast = useRef({ success: (t) => push(t, false), error: (t) => push(t, true) }).current;
  const confirm = useCallback((text) => new Promise((resolve) => setDialog({ text, resolve })), []);
  const answer = (v) => {
    dialog.resolve(v);
    setDialog(null);
  };

  return (
    <UIContext.Provider value={{ toast, confirm }}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.key}
              layout
              className={`toast glass ${t.error ? 'error' : 'ok'}`}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
            >
              {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {dialog && (
          <Modal onClose={() => answer(false)} small>
            <h3>Are you sure?</h3>
            <p className="muted">{dialog.text}</p>
            <div className="row end">
              <button className="btn ghost" onClick={() => answer(false)}>Cancel</button>
              <button className="btn danger" onClick={() => answer(true)}>Confirm</button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </UIContext.Provider>
  );
}

/* ---------- modal ---------- */
export function Modal({ onClose, children, small }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <motion.div
      className="overlay"
      onMouseDown={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className={`modal glass ${small ? 'small' : ''}`}
        role="dialog"
        aria-modal="true"
        onMouseDown={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
        transition={{ duration: 0.25 }}
      >
        <button className="close" onClick={onClose} aria-label="Close">×</button>
        {children}
      </motion.div>
    </motion.div>
  );
}

/* ---------- small bits ---------- */
export const Badge = ({ status }) => <span className={`badge ${status.toLowerCase()}`}>{status}</span>;

export function Photo({ url, name }) {
  return url ? <img className="photo" src={url} alt={name} loading="lazy" /> : <div className="photo none">No photo</div>;
}

export function PageHeader({ tag = 'Sri Lanka Lost & Found', title, accent, after, sub }) {
  return (
    <div className="page-head">
      <span className="chip glass">{tag}</span>
      <h1>
        {title} <em>{accent}</em> {after}
      </h1>
      {sub && <p className="lead">{sub}</p>}
    </div>
  );
}

export function Skeleton({ count = 3, variant = 'card' }) {
  return (
    <div className={variant === 'card' ? 'grid' : 'skeleton-rows'} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`skeleton glass ${variant}`} />
      ))}
    </div>
  );
}

export const EmptyState = ({ title, hint }) => (
  <div className="empty glass">
    <p className="empty-title">{title}</p>
    {hint && <p className="muted">{hint}</p>}
  </div>
);

/* thin progress bar shown briefly on every route change */
export function RouteProgress({ routeKey }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    setShow(true);
    const t = setTimeout(() => setShow(false), 600);
    return () => clearTimeout(t);
  }, [routeKey]);
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="progress"
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      )}
    </AnimatePresence>
  );
}

/* horizontal / vertical step tracker; `reached` is the index of the last completed step */
export function Stepper({ steps, reached, vertical }) {
  return (
    <ol className={`stepper ${vertical ? 'vertical' : ''}`}>
      {steps.map((s, i) => (
        <li key={s} className={i <= reached ? 'done' : ''}>
          <span className="dot" />
          <span className="step-label">{s}</span>
        </li>
      ))}
    </ol>
  );
}
