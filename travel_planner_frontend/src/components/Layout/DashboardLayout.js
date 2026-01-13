import React, { useMemo, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import Topbar from "./Topbar";
import styles from "./DashboardLayout.module.css";

// PUBLIC_INTERFACE
export default function DashboardLayout() {
  /** Dashboard shell with responsive sidebar + topbar + main content outlet. */
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = useMemo(
    () => [
      { to: "/trips", label: "Trips" },
      { to: "/destinations", label: "Destinations" },
      { to: "/itinerary", label: "Itinerary" },
      { to: "/bookings", label: "Bookings" },
      { to: "/favorites", label: "Favorites" },
      { to: "/map", label: "Map" },
    ],
    []
  );

  return (
    <div className={styles.shell}>
      <aside className={`${styles.sidebar} ${mobileOpen ? styles.sidebarOpen : ""}`} aria-label="Sidebar navigation">
        <div className={styles.brandRow}>
          <div className={styles.brandMark} aria-hidden="true" />
          <div className={styles.brandText}>
            <div className={styles.brandName}>Travel Planner</div>
            <div className={styles.brandSub}>Dashboard</div>
          </div>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.hint}>
            API: <code className={styles.code}>{process.env.REACT_APP_API_BASE_URL || "http://localhost:8000"}</code>
          </div>
        </div>
      </aside>

      <div className={styles.main}>
        <Topbar onToggleSidebar={() => setMobileOpen((v) => !v)} />
        <main className={styles.content} role="main">
          <Outlet />
        </main>
      </div>

      {mobileOpen ? <button className={styles.backdrop} onClick={() => setMobileOpen(false)} aria-label="Close menu" /> : null}
    </div>
  );
}
