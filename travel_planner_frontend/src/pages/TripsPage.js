import React, { useMemo, useState } from "react";
import Modal from "../components/Modal/Modal";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "../components/Status/StatusBlocks";
import { Field, TextArea, TextInput } from "../components/Form/FormControls";
import { useAppStore } from "../state/appStore";
import { useNotifications } from "../state/notifications";
import styles from "./Page.module.css";

function TripForm({ value, onChange }) {
  return (
    <div className={styles.formGrid}>
      <Field label="Trip name">
        <TextInput value={value.name} onChange={(e) => onChange({ ...value, name: e.target.value })} placeholder="e.g., Japan Spring 2026" />
      </Field>
      <Field label="Start date">
        <TextInput type="date" value={value.startDate} onChange={(e) => onChange({ ...value, startDate: e.target.value })} />
      </Field>
      <Field label="End date">
        <TextInput type="date" value={value.endDate} onChange={(e) => onChange({ ...value, endDate: e.target.value })} />
      </Field>
      <Field label="Notes" hint="Optional">
        <TextArea rows={3} value={value.notes} onChange={(e) => onChange({ ...value, notes: e.target.value })} placeholder="Ideas, constraints, budget…" />
      </Field>
    </div>
  );
}

// PUBLIC_INTERFACE
export default function TripsPage() {
  /** Trips list + create/edit/delete modals. */
  const { state, actions } = useAppStore();
  const { notify } = useNotifications();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const defaultDraft = useMemo(
    () => ({ id: "", name: "", startDate: new Date().toISOString().slice(0, 10), endDate: new Date().toISOString().slice(0, 10), notes: "" }),
    []
  );
  const [draft, setDraft] = useState(defaultDraft);

  const openCreate = () => {
    setEditing(null);
    setDraft(defaultDraft);
    setModalOpen(true);
  };

  const openEdit = (trip) => {
    setEditing(trip);
    setDraft({ ...trip });
    setModalOpen(true);
  };

  const onSave = async () => {
    if (!draft.name.trim()) {
      notify({ type: "error", title: "Missing name", message: "Trip name is required." });
      return;
    }
    const res = await actions.upsertTrip(draft);
    if (res.ok) {
      notify({ type: "success", title: "Saved", message: editing ? "Trip updated." : "Trip created." });
      setModalOpen(false);
    } else {
      notify({ type: "error", title: "Save failed", message: res.error || "Unable to save trip." });
    }
  };

  const onDelete = async (id) => {
    const res = await actions.removeTrip(id);
    if (res.ok) {
      notify({ type: "success", title: "Deleted", message: "Trip removed." });
    } else {
      notify({ type: "error", title: "Delete failed", message: res.error || "Unable to delete trip." });
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.pageTitle}>Trips</div>
          <div className={styles.pageSub}>Create and manage your trips.</div>
        </div>
        <button className={styles.primaryBtn} onClick={openCreate}>
          + New trip
        </button>
      </div>

      {state.loading?.trips ? (
        <LoadingBlock title="Loading trips…" message="Fetching your trips from the server." />
      ) : state.error?.trips ? (
        <ErrorBlock title="Could not load trips" message={String(state.error.trips)} />
      ) : !state.trips.length ? (
        <EmptyBlock title="No trips yet" message="Create a trip to start adding destinations and itinerary items." />
      ) : (
        <div className={styles.tableCard}>
          <div className={styles.table}>
            <div className={styles.trHead}>
              <div>Name</div>
              <div>Dates</div>
              <div className={styles.trActionsCol}>Actions</div>
            </div>
            {state.trips.map((t) => (
              <div key={t.id} className={styles.trRow}>
                <div className={styles.strong}>{t.name}</div>
                <div className={styles.muted}>
                  {t.startDate || "—"} → {t.endDate || "—"}
                </div>
                <div className={styles.rowActions}>
                  <button className={styles.secondaryBtn} onClick={() => openEdit(t)}>
                    Edit
                  </button>
                  <button className={styles.dangerBtn} onClick={() => onDelete(t.id)}>
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
        title={editing ? "Edit trip" : "Create trip"}
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
        <TripForm value={draft} onChange={setDraft} />
      </Modal>
    </div>
  );
}
