import React, { useMemo, useState } from "react";
import Modal from "../components/Modal/Modal";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "../components/Status/StatusBlocks";
import { Field, Select, TextArea, TextInput } from "../components/Form/FormControls";
import { useAppStore } from "../state/appStore";
import { useNotifications } from "../state/notifications";
import styles from "./Page.module.css";

function DestinationForm({ trips, value, onChange }) {
  return (
    <div className={styles.formGrid}>
      <Field label="Trip">
        <Select value={value.tripId} onChange={(e) => onChange({ ...value, tripId: e.target.value })}>
          <option value="">Select a trip</option>
          {trips.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Destination name">
        <TextInput value={value.name} onChange={(e) => onChange({ ...value, name: e.target.value })} placeholder="e.g., Kyoto" />
      </Field>
      <Field label="Country/Region" hint="Optional">
        <TextInput value={value.country} onChange={(e) => onChange({ ...value, country: e.target.value })} placeholder="e.g., Japan" />
      </Field>
      <Field label="Notes" hint="Optional">
        <TextArea rows={3} value={value.notes} onChange={(e) => onChange({ ...value, notes: e.target.value })} placeholder="Food, neighborhoods, day trips…" />
      </Field>
    </div>
  );
}

// PUBLIC_INTERFACE
export default function DestinationsPage() {
  /** Destinations list + create/edit/delete modals. */
  const { state, actions } = useAppStore();
  const { notify } = useNotifications();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const defaultDraft = useMemo(() => ({ id: "", tripId: "", name: "", country: "", notes: "" }), []);
  const [draft, setDraft] = useState(defaultDraft);

  const openCreate = () => {
    setEditing(null);
    setDraft(defaultDraft);
    setModalOpen(true);
  };

  const openEdit = (d) => {
    setEditing(d);
    setDraft({ ...d });
    setModalOpen(true);
  };

  const onSave = async () => {
    if (!draft.tripId) {
      notify({ type: "error", title: "Missing trip", message: "Please select a trip." });
      return;
    }
    if (!draft.name.trim()) {
      notify({ type: "error", title: "Missing name", message: "Destination name is required." });
      return;
    }
    const res = await actions.upsertDestination(draft);
    if (res.ok) {
      notify({ type: "success", title: "Saved", message: editing ? "Destination updated." : "Destination created." });
      setModalOpen(false);
    } else {
      notify({ type: "error", title: "Save failed", message: res.error || "Unable to save destination." });
    }
  };

  const onDelete = async (id) => {
    const res = await actions.removeDestination(id);
    if (res.ok) {
      notify({ type: "success", title: "Deleted", message: "Destination removed." });
    } else {
      notify({ type: "error", title: "Delete failed", message: res.error || "Unable to delete destination." });
    }
  };

  const tripName = (tripId) => state.trips.find((t) => t.id === tripId)?.name || "Unknown trip";

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.pageTitle}>Destinations</div>
          <div className={styles.pageSub}>Add places for each trip. These can later feed map markers.</div>
        </div>
        <button className={styles.primaryBtn} onClick={openCreate}>
          + New destination
        </button>
      </div>

      {state.loading?.destinations ? (
        <LoadingBlock title="Loading destinations…" message="Fetching destinations from the server." />
      ) : state.error?.destinations ? (
        <ErrorBlock title="Could not load destinations" message={String(state.error.destinations)} />
      ) : !state.destinations.length ? (
        <EmptyBlock title="No destinations yet" message="Create a destination and associate it with a trip." />
      ) : (
        <div className={styles.tableCard}>
          <div className={styles.table}>
            <div className={styles.trHead}>
              <div>Destination</div>
              <div>Trip</div>
              <div className={styles.trActionsCol}>Actions</div>
            </div>
            {state.destinations.map((d) => (
              <div key={d.id} className={styles.trRow}>
                <div className={styles.strong}>
                  {d.name} <span className={styles.muted}>{d.country ? `· ${d.country}` : ""}</span>
                </div>
                <div className={styles.muted}>{tripName(d.tripId)}</div>
                <div className={styles.rowActions}>
                  <button className={styles.secondaryBtn} onClick={() => openEdit(d)}>
                    Edit
                  </button>
                  <button className={styles.dangerBtn} onClick={() => onDelete(d.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal
        open={modalOpen}
        title={editing ? "Edit destination" : "Create destination"}
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
        <DestinationForm trips={state.trips} value={draft} onChange={setDraft} />
      </Modal>
    </div>
  );
}
