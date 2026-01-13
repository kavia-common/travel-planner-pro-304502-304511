import React from "react";
import { useLocation } from "react-router-dom";
import { useAppStore } from "../../state/appStore";
import { useNotifications } from "../../state/notifications";
import NotificationToaster from "../Notifications/NotificationToaster";
import styles from "./Topbar.module.css";

function titleFromPath(pathname) {
  if (pathname.startsWith("/trips")) return "Trips";
  if (pathname.startsWith("/destinations")) return "Destinations";
  if (pathname.startsWith("/itinerary")) return "Itinerary";
  if (pathname.startsWith("/bookings")) return "Bookings";
  if (pathname.startsWith("/favorites")) return "Favorites";
  if (pathname.startsWith("/map")) return "Map";
  return "Dashboard";
}

// PUBLIC_INTERFACE
export default function Topbar({ onToggleSidebar }) {
  /** Topbar with page title + notifications + auth controls. */
  const location = useLocation();
  const { state, actions } = useAppStore();
  const { items, notify } = useNotifications();

  const userLabel = state.auth?.user?.full_name || state.auth?.user?.email || "User";

  return (
    <header className={styles.topbar}>
      <button className={styles.menuBtn} onClick={onToggleSidebar} aria-label="Toggle sidebar">
        ☰
      </button>

      <div className={styles.title}>{titleFromPath(location.pathname)}</div>

      <div className={styles.actions}>
        <div className={styles.pill} title="Signed in user">
          {userLabel}
        </div>
        <div className={styles.pill} title="Notifications">
          {items.length ? `${items.length} alerts` : "No alerts"}
        </div>
        <button
          className={styles.pill}
          onClick={() => {
            actions.logout();
            notify({ type: "success", title: "Signed out", message: "You have been logged out." });
          }}
          aria-label="Logout"
        >
          Logout
        </button>
      </div>

      <NotificationToaster />
    </header>
  );
}
