import React from "react";
import { Link } from "react-router-dom";
import styles from "./Page.module.css";

// PUBLIC_INTERFACE
export default function NotFoundPage() {
  /** 404 page for unknown routes. */
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>Page not found</div>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.pageSub}>The page you requested does not exist.</div>
          <div style={{ marginTop: 12 }}>
            <Link to="/trips" className={styles.linkBtn}>
              Go to Trips
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
