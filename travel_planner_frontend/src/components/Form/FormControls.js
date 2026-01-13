import React from "react";
import styles from "./FormControls.module.css";

// PUBLIC_INTERFACE
export function Field({ label, hint, children }) {
  /** Wrapper for labeled form fields. */
  return (
    <label className={styles.field}>
      <div className={styles.labelRow}>
        <span className={styles.label}>{label}</span>
        {hint ? <span className={styles.hint}>{hint}</span> : null}
      </div>
      {children}
    </label>
  );
}

// PUBLIC_INTERFACE
export function TextInput(props) {
  /** Styled text input. */
  return <input {...props} className={`${styles.input} ${props.className || ""}`} />;
}

// PUBLIC_INTERFACE
export function TextArea(props) {
  /** Styled textarea. */
  return <textarea {...props} className={`${styles.textarea} ${props.className || ""}`} />;
}

// PUBLIC_INTERFACE
export function Select(props) {
  /** Styled select. */
  return <select {...props} className={`${styles.select} ${props.className || ""}`} />;
}
