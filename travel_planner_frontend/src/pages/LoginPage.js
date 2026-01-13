import React, { useMemo, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Field, TextInput } from "../components/Form/FormControls";
import { useAppStore } from "../state/appStore";
import { useNotifications } from "../state/notifications";
import styles from "./Page.module.css";

function cardStyle() {
  return {
    maxWidth: 520,
    width: "100%",
    margin: "0 auto",
  };
}

// PUBLIC_INTERFACE
export default function LoginPage() {
  /** Login page: email/password -> backend token -> store -> redirect back to app. */
  const { state, actions } = useAppStore();
  const { notify } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const from = useMemo(() => {
    const s = location.state;
    return s?.from?.pathname || "/trips";
  }, [location.state]);

  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("demo123");

  if (state.auth?.status === "authenticated") {
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      notify({ type: "error", title: "Missing credentials", message: "Please enter email and password." });
      return;
    }

    const res = await actions.login({ email, password });
    if (res.ok) {
      notify({ type: "success", title: "Welcome", message: "You are now signed in." });
      navigate(from, { replace: true });
    } else {
      notify({
        type: "error",
        title: "Login failed",
        message: "Invalid credentials or server unreachable. Try demo@example.com / demo123.",
      });
    }
  };

  return (
    <div className={styles.page} style={{ minHeight: "calc(100vh - 64px)" }}>
      <div className={styles.card} style={cardStyle()}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>Sign in</div>
          <div className={styles.muted} style={{ fontSize: 12 }}>
            Demo credentials: <code>demo@example.com</code> / <code>demo123</code>
          </div>
        </div>
        <div className={styles.cardBody}>
          <form onSubmit={onSubmit} className={styles.formGrid} style={{ gridTemplateColumns: "1fr" }}>
            <Field label="Email">
              <TextInput value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </Field>
            <Field label="Password">
              <TextInput
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </Field>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={() => {
                  setEmail("demo@example.com");
                  setPassword("demo123");
                }}
              >
                Use demo
              </button>
              <button type="submit" className={styles.primaryBtn} disabled={state.loading?.auth}>
                {state.loading?.auth ? "Signing in…" : "Sign in"}
              </button>
            </div>

            {state.error?.auth ? (
              <div className={styles.muted} style={{ marginTop: 6 }}>
                {String(state.error.auth)}
              </div>
            ) : null}
          </form>
        </div>
      </div>
    </div>
  );
}
