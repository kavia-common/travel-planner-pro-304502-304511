import React from "react";
import styles from "./StatusBlocks.module.css";

// PUBLIC_INTERFACE
export function LoadingBlock({ title = "Loading…", message = "Please wait." }) {
  /** Simple loading UI block. */
  return (
    <div className={styles.block}>
      <div className={styles.title}>{title}</div>
      <div className={styles.message}>{message}</div>
    </div>
  );
}

// PUBLIC_INTERFACE
export function EmptyBlock({ title = "Nothing here yet", message = "Create your first item to get started." }) {
  /** Simple empty-state UI block. */
  return (
    <div className={styles.block}>
      <div className={styles.title}>{title}</div>
      <div className={styles.message}>{message}</div>
    </div>
  );
}

// PUBLIC_INTERFACE
export function ErrorBlock({ title = "Something went wrong", message }) {
  /** Simple error UI block. */
  return (
    <div className={`${styles.block} ${styles.error}`}>
      <div className={styles.title}>{title}</div>
      <div className={styles.message}>{message || "Please try again."}</div>
    </div>
  );
}
