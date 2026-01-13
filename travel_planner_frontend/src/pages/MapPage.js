import React, { useMemo, useState } from "react";
import MapPlaceholder from "../components/Map/MapPlaceholder";
import { useAppStore } from "../state/appStore";
import styles from "./Page.module.css";

// PUBLIC_INTERFACE
export default function MapPage() {
  /** Map placeholder page. */
  const { state } = useAppStore();
  const [selectedTripId, setSelectedTripId] = useState(state.trips[0]?.id || "");

  const destinations = state.destinations.filter((d) => (selectedTripId ? d.tripId === selectedTripId : true));

  // Placeholder coordinates (spread out) until real geo fields exist.
  const markers = useMemo(() => {
    const baseLat = 37.7749;
    const baseLng = -122.4194;
    return destinations.map((d, idx) => ({
      id: d.id,
      label: d.name,
      lat: baseLat + idx * 0.02,
      lng: baseLng + idx * 0.02,
    }));
  }, [destinations]);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.pageTitle}>Map</div>
          <div className={styles.pageSub}>A placeholder component with a clear prop interface for future provider integration.</div>
        </div>

        <div className={styles.headerControls}>
          {state.trips.length ? (
            <select className={styles.inlineSelect} value={selectedTripId} onChange={(e) => setSelectedTripId(e.target.value)} aria-label="Select trip for map">
              {state.trips.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          ) : null}
        </div>
      </div>

      <MapPlaceholder
        provider="unset"
        center={markers.length ? { lat: markers[0].lat, lng: markers[0].lng } : { lat: 37.7749, lng: -122.4194 }}
        zoom={markers.length ? 10 : 2}
        markers={markers}
        onMarkerClick={() => {}}
        height={460}
      />
    </div>
  );
}
