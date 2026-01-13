import React, { useEffect } from "react";
import styles from "./Modal.module.css";

// PUBLIC_INTERFACE
export default function Modal({ open, title, children, onClose, footer }) {
  /** Accessible modal dialog with backdrop and escape key handling. */
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={styles.overlay} role="presentation">
      <button className={styles.backdrop} aria-label="Close dialog" onClick={onClose} />
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label={title || "Dialog"}>
        <div className={styles.header}>
          <div className={styles.title}>{title}</div>
          <button className={styles.close} onClick={onClose} aria-label="Close dialog">
            ×
          </button>
        </div>
        <div className={styles.body}>{children}</div>
        {footer ? <div className={styles.footer}>{footer}</div> : null}
      </div>
    </div>
  );
}
