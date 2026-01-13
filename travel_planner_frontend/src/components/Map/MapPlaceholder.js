import React from "react";
import styles from "./MapPlaceholder.module.css";

// PUBLIC_INTERFACE
export default function MapPlaceholder({
  provider,
  center,
  zoom,
  markers,
  onMarkerClick,
  height = 420,
}) {
  /**
   * Map placeholder component.
   *
   * Props (intended for future provider integration):
   * - provider: string (e.g., "google", "mapbox", "leaflet")
   * - center: { lat: number, lng: number }
   * - zoom: number
   * - markers: Array<{ id: string, lat: number, lng: number, label?: string }>
   * - onMarkerClick: (marker) => void
   * - height: number (px)
   */
  return (
    <section className={styles.card} style={{ height }} aria-label="Map">
      <div className={styles.header}>
        <div className={styles.title}>Map</div>
        <div className={styles.sub}>
          Placeholder — provider integration pending.{" "}
          <span className={styles.mono}>provider={provider || "unset"}</span>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.kv}>
          <div className={styles.k}>Center</div>
          <div className={styles.v}>
            {center ? `${center.lat.toFixed(4)}, ${center.lng.toFixed(4)}` : "not set"}
          </div>
        </div>
        <div className={styles.kv}>
          <div className={styles.k}>Zoom</div>
          <div className={styles.v}>{typeof zoom === "number" ? zoom : "not set"}</div>
        </div>
        <div className={styles.kv}>
          <div className={styles.k}>Markers</div>
          <div className={styles.v}>{markers?.length || 0}</div>
        </div>

        {markers?.length ? (
          <div className={styles.markerList}>
            {markers.map((m) => (
              <button key={m.id} className={styles.markerBtn} onClick={() => onMarkerClick?.(m)}>
                {m.label || m.id} — {m.lat.toFixed(3)},{m.lng.toFixed(3)}
              </button>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>Add destinations to see markers here.</div>
        )}
      </div>
    </section>
  );
}
