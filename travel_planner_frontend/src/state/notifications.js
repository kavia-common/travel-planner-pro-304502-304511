import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

const NotificationContext = createContext(null);

function createNotification({ type, title, message }) {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type,
    title,
    message,
  };
}

// PUBLIC_INTERFACE
export function NotificationProvider({ children }) {
  /** Provides global notifications and a simple toaster UI. */
  const [items, setItems] = useState([]);

  const remove = useCallback((id) => {
    setItems((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const notify = useCallback((notification) => {
    const n = createNotification(notification);
    setItems((prev) => [n, ...prev].slice(0, 5));
    // Auto-dismiss after 4.5s
    window.setTimeout(() => remove(n.id), 4500);
    return n.id;
  }, [remove]);

  const value = useMemo(() => ({ items, notify, remove }), [items, notify, remove]);

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

// PUBLIC_INTERFACE
export function useNotifications() {
  /** Hook to access notify/remove. */
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return ctx;
}
