import React, { useMemo, useState } from "react";
import Modal from "../components/Modal/Modal";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "../components/Status/StatusBlocks";
import { Field, Select, TextInput } from "../components/Form/FormControls";
import { useAppStore } from "../state/appStore";
import { useNotifications } from "../state/notifications";
import styles from "./Page.module.css";

function BookingForm({ trips, value, onChange }) {
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
      <Field label="Date" hint="Optional">
        <TextInput type="date" value={value.date} onChange={(e) => onChange({ ...value, date: e.target.value })} />
      </Field>
      <Field label="Type">
        <Select value={value.type} onChange={(e) => onChange({ ...value, type: e.target.value })}>
          <option value="Flight">Flight</option>
          <option value="Hotel">Hotel</option>
          <option value="Train">Train</option>
          <option value="Car">Car</option>
          <option value="Activity">Activity</option>
          <option value="Other">Other</option>
        </Select>
      </Field>
      <Field label="Provider" hint="Optional">
        <TextInput value={value.provider} onChange={(e) => onChange({ ...value, provider: e.target.value })} placeholder="e.g., Airline / Hotel name" />
      </Field>
      <Field label="Reference" hint="Optional">
        <TextInput value={value.reference} onChange={(e) => onChange({ ...value, reference: e.target.value })} placeholder="Confirmation code / PNR" />
      </Field>
    </div>
  );
}

// PUBLIC_INTERFACE
export default function BookingsPage() {
  /** Bookings list + create/edit/delete modal. */
  const { state, actions } = useAppStore();
  const { notify } = useNotifications();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const defaultDraft = useMemo(() => ({ id: "", tripId: "", date: "", type: "Flight", provider: "", reference: "" }), []);
  const [draft, setDraft] = useState(defaultDraft);

  const tripName = (tripId) => state.trips.find((t) => t.id === tripId)?.name || "Unknown trip";

  const openCreate = () => {
    setEditing(null);
    setDraft(defaultDraft);
    setModalOpen(true);
  };

  const openEdit = (b) => {
    setEditing(b);
    setDraft({ ...b });
    setModalOpen(true);
  };

  const onSave = async () => {
    if (!draft.tripId) {
      notify({ type: "error", title: "Missing trip", message: "Please select a trip." });
      return;
    }
    const res = await actions.upsertBooking(draft);
    if (res.ok) {
      notify({ type: "success", title: "Saved", message: editing ? "Booking updated." : "Booking created." });
      setModalOpen(false);
    } else {
      notify({ type: "error", title: "Save failed", message: res.error || "Unable to save booking." });
    }
  };

  const onDelete = async (id) => {
    const res = await actions.removeBooking(id);
    if (res.ok) {
      notify({ type: "success", title: "Deleted", message: "Booking removed." });
    } else {
      notify({ type: "error", title: "Delete failed", message: res.error || "Unable to delete booking." });
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.pageTitle}>Bookings</div>
          <div className={styles.pageSub}>Track confirmations and reservations for your trips.</div>
        </div>
        <button className={styles.primaryBtn} onClick={openCreate}>
          + New booking
        </button>
      </div>

      {state.loading?.bookings ? (
        <LoadingBlock title="Loading bookings…" message="Fetching bookings from the server." />
      ) : state.error?.bookings ? (
        <ErrorBlock title="Could not load bookings" message={String(state.error.bookings)} />
      ) : !state.bookings.length ? (
        <EmptyBlock title="No bookings yet" message="Add flight/hotel/train confirmations here." />
      ) : (
        <div className={styles.tableCard}>
          <div className={styles.table}>
            <div className={styles.trHead}>
              <div>Booking</div>
              <div>Trip</div>
              <div className={styles.trActionsCol}>Actions</div>
            </div>
            {state.bookings.map((b) => (
              <div key={b.id} className={styles.trRow}>
                <div className={styles.strong}>
                  {b.type} <span className={styles.muted}>{b.provider ? `· ${b.provider}` : ""}</span>{" "}
                  <span className={styles.muted}>{b.reference ? `· ${b.reference}` : ""}</span>
                </div>
                <div className={styles.muted}>{tripName(b.tripId)}</div>
                <div className={styles.rowActions}>
                  <button className={styles.secondaryBtn} onClick={() => openEdit(b)}>
                    Edit
                  </button>
                  <button className={styles.dangerBtn} onClick={() => onDelete(b.id)}>
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
        title={editing ? "Edit booking" : "Create booking"}
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
        <BookingForm trips={state.trips} value={draft} onChange={setDraft} />
      </Modal>
    </div>
  );
}
