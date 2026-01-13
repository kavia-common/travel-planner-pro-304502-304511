import React from "react";
import { useNotifications } from "../../state/notifications";
import styles from "./NotificationToaster.module.css";

// PUBLIC_INTERFACE
export default function NotificationToaster() {
  /** Renders notifications in the top-right corner. */
  const { items, remove } = useNotifications();

  return (
    <div className={styles.toaster} aria-live="polite" aria-relevant="additions removals">
      {items.map((n) => (
        <div key={n.id} className={`${styles.toast} ${styles[n.type] || ""}`}>
          <div className={styles.toastHeader}>
            <div className={styles.toastTitle}>{n.title}</div>
            <button className={styles.closeBtn} onClick={() => remove(n.id)} aria-label="Dismiss notification">
              ×
            </button>
          </div>
          <div className={styles.toastMsg}>{n.message}</div>
        </div>
      ))}
    </div>
  );
}
