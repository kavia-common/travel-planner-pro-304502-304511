import React, { useMemo, useState } from "react";
import Modal from "../components/Modal/Modal";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "../components/Status/StatusBlocks";
import { Field, Select } from "../components/Form/FormControls";
import { useAppStore } from "../state/appStore";
import { useNotifications } from "../state/notifications";
import styles from "./Page.module.css";

function FavoriteDestinationForm({ destinations, value, onChange }) {
  return (
    <div className={styles.formGrid} style={{ gridTemplateColumns: "1fr" }}>
      <Field label="Destination">
        <Select value={value.destinationId} onChange={(e) => onChange({ ...value, destinationId: e.target.value })}>
          <option value="">Select a destination</option>
          {destinations.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </Select>
      </Field>
      <div className={styles.muted} style={{ fontSize: 12 }}>
        Favorites are tied to destinations in the backend API.
      </div>
    </div>
  );
}

function favoriteLabel(fav, destinationsById, tripsById) {
  const dest = destinationsById.get(String(fav.destination_id));
  if (!dest) return `Destination #${fav.destination_id}`;
  const trip = tripsById.get(String(dest.tripId));
  return `${dest.name}${trip ? ` · ${trip.name}` : ""}`;
}

// PUBLIC_INTERFACE
export default function FavoritesPage() {
  /** Favorite destinations list + add/remove modal (backend contract: destination favorites). */
  const { state, actions } = useAppStore();
  const { notify } = useNotifications();

  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState({ destinationId: "" });

  const destinations = useMemo(() => state.destinations || [], [state.destinations]);
  const destinationsById = useMemo(() => new Map(destinations.map((d) => [String(d.id), d])), [destinations]);
  const tripsById = useMemo(() => new Map((state.trips || []).map((t) => [String(t.id), t])), [state.trips]);

  const openCreate = () => {
    setDraft({ destinationId: "" });
    setModalOpen(true);
  };

  const onSave = async () => {
    if (!draft.destinationId) {
      notify({ type: "error", title: "Missing destination", message: "Please select a destination." });
      return;
    }
    const res = await actions.addFavoriteByDestinationId(draft.destinationId);
    if (res.ok) {
      notify({ type: "success", title: "Saved", message: "Destination added to favorites." });
      setModalOpen(false);
    } else {
      notify({ type: "error", title: "Save failed", message: res.error || "Unable to add favorite." });
    }
  };

  const onDelete = async (favoriteId) => {
    const res = await actions.removeFavorite(favoriteId);
    if (res.ok) {
      notify({ type: "success", title: "Deleted", message: "Favorite removed." });
    } else {
      notify({ type: "error", title: "Delete failed", message: res.error || "Unable to remove favorite." });
    }
  };

  const favoriteDestIds = useMemo(() => new Set((state.favorites || []).map((f) => String(f.destination_id))), [state.favorites]);
  const eligibleDestinations = destinations.filter((d) => !favoriteDestIds.has(String(d.id)));

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.pageTitle}>Favorites</div>
          <div className={styles.pageSub}>Favorite destinations from your trips (synced with backend).</div>
        </div>
        <button className={styles.primaryBtn} onClick={openCreate} disabled={state.loading?.favorites || !eligibleDestinations.length}>
          + Add favorite
        </button>
      </div>

      {state.loading?.favorites ? (
        <LoadingBlock title="Loading favorites…" message="Fetching favorites from the server." />
      ) : state.error?.favorites ? (
        <ErrorBlock title="Could not load favorites" message={String(state.error.favorites)} />
      ) : !(state.favorites || []).length ? (
        <EmptyBlock title="No favorites yet" message="Add a destination as a favorite." />
      ) : (
        <div className={styles.tableCard}>
          <div className={styles.table}>
            <div className={styles.trHead}>
              <div>Favorite</div>
              <div>Destination ID</div>
              <div className={styles.trActionsCol}>Actions</div>
            </div>
            {(state.favorites || []).map((f) => (
              <div key={f.id} className={styles.trRow}>
                <div className={styles.strong}>{favoriteLabel(f, destinationsById, tripsById)}</div>
                <div className={styles.muted}>{String(f.destination_id)}</div>
                <div className={styles.rowActions}>
                  <button className={styles.dangerBtn} onClick={() => onDelete(f.id)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal
        open={modalOpen}
        title="Add favorite destination"
        onClose={() => setModalOpen(false)}
        footer={
          <div className={styles.modalFooter}>
            <button className={styles.secondaryBtn} onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button className={styles.primaryBtn} onClick={onSave}>
              Save
            </button>
          </div>
        }
      >
        <FavoriteDestinationForm destinations={eligibleDestinations} value={draft} onChange={setDraft} />
      </Modal>
    </div>
  );
}
