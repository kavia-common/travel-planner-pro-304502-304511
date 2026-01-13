import React, { useMemo, useState } from "react";
import CalendarView from "../components/Calendar/CalendarView";
import Modal from "../components/Modal/Modal";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "../components/Status/StatusBlocks";
import { Field, Select, TextArea, TextInput } from "../components/Form/FormControls";
import { useAppStore } from "../state/appStore";
import { useNotifications } from "../state/notifications";
import styles from "./Page.module.css";

function ItineraryForm({ trips, value, onChange }) {
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
      <Field label="Date">
        <TextInput type="date" value={value.date} onChange={(e) => onChange({ ...value, date: e.target.value })} />
      </Field>
      <Field label="Title">
        <TextInput value={value.title} onChange={(e) => onChange({ ...value, title: e.target.value })} placeholder="e.g., Museum + lunch" />
      </Field>
      <Field label="Location" hint="Optional">
        <TextInput value={value.location} onChange={(e) => onChange({ ...value, location: e.target.value })} placeholder="e.g., Ueno Park" />
      </Field>
      <Field label="Notes" hint="Optional">
        <TextArea rows={3} value={value.notes} onChange={(e) => onChange({ ...value, notes: e.target.value })} placeholder="Tickets, timings, links…" />
      </Field>
    </div>
  );
}

// PUBLIC_INTERFACE
export default function ItineraryPage() {
  /** Itinerary calendar view + list + create/edit/delete modal. */
  const { state, actions } = useAppStore();
  const { notify } = useNotifications();

  const [selectedTripId, setSelectedTripId] = useState(state.trips[0]?.id || "");
  const [month, setMonth] = useState(() => new Date());

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const defaultDraft = useMemo(
    () => ({
      id: "",
      tripId: selectedTripId || "",
      date: new Date().toISOString().slice(0, 10),
      title: "",
      location: "",
      notes: "",
    }),
    [selectedTripId]
  );

  const [draft, setDraft] = useState(defaultDraft);

  const tripItems = state.itineraryItems.filter((i) => (selectedTripId ? i.tripId === selectedTripId : true));

  const openCreateForDate = (isoDate) => {
    setEditing(null);
    setDraft({ ...defaultDraft, tripId: selectedTripId || "", date: isoDate });
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setDraft({ ...item });
    setModalOpen(true);
  };

  const onSave = async () => {
    if (!draft.tripId) {
      notify({ type: "error", title: "Missing trip", message: "Please select a trip." });
      return;
    }
    if (!draft.date) {
      notify({ type: "error", title: "Missing date", message: "Date is required." });
      return;
    }
    if (!draft.title.trim()) {
      notify({ type: "error", title: "Missing title", message: "Title is required." });
      return;
    }
    const res = await actions.upsertItineraryItem(draft);
    if (res.ok) {
      notify({ type: "success", title: "Saved", message: editing ? "Itinerary item updated." : "Itinerary item created." });
      setModalOpen(false);
    } else {
      notify({ type: "error", title: "Save failed", message: res.error || "Unable to save itinerary item." });
    }
  };

  const onDelete = async (id) => {
    const res = await actions.removeItineraryItem(id);
    if (res.ok) {
      notify({ type: "success", title: "Deleted", message: "Itinerary item removed." });
    } else {
      notify({ type: "error", title: "Delete failed", message: res.error || "Unable to delete itinerary item." });
    }
  };

  const changeMonth = (delta) => {
    const next = new Date(month);
    next.setMonth(next.getMonth() + delta);
    setMonth(next);
  };

  if (state.loading?.trips) {
    return (
      <div className={styles.page}>
        <LoadingBlock title="Loading trips…" message="Fetching trips required for itinerary." />
      </div>
    );
  }

  if (state.error?.trips) {
    return (
      <div className={styles.page}>
        <ErrorBlock title="Could not load trips" message={String(state.error.trips)} />
      </div>
    );
  }

  if (!state.trips.length) {
    return (
      <div className={styles.page}>
        <EmptyBlock title="Create a trip first" message="Itinerary items are attached to trips." />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.pageTitle}>Itinerary</div>
          <div className={styles.pageSub}>Plan day-by-day. Calendar view shows itinerary items by date.</div>
        </div>

        <div className={styles.headerControls}>
          <select className={styles.inlineSelect} value={selectedTripId} onChange={(e) => setSelectedTripId(e.target.value)} aria-label="Select trip">
            {state.trips.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          <button className={styles.secondaryBtn} onClick={() => changeMonth(-1)}>
            ←
          </button>
          <button className={styles.secondaryBtn} onClick={() => setMonth(new Date())}>
            Today
          </button>
          <button className={styles.secondaryBtn} onClick={() => changeMonth(1)}>
            →
          </button>
        </div>
      </div>

      <div className={styles.twoCol}>
        <CalendarView month={month} items={tripItems} onSelectDate={openCreateForDate} />

        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>Items</div>
            <button className={styles.primaryBtn} onClick={() => openCreateForDate(new Date().toISOString().slice(0, 10))}>
              + Add
            </button>
          </div>

          {!tripItems.length ? (
            <div className={styles.cardBody}>
              <EmptyBlock title="No itinerary items yet" message="Click a date in the calendar to add an item." />
            </div>
          ) : (
            <div className={styles.list}>
              {tripItems
                .slice()
                .sort((a, b) => (a.date || "").localeCompare(b.date || ""))
                .map((it) => (
                  <div key={it.id} className={styles.listRow}>
                    <div>
                      <div className={styles.strong}>
                        {it.title} <span className={styles.muted}>{it.location ? `· ${it.location}` : ""}</span>
                      </div>
                      <div className={styles.muted}>{it.date}</div>
                    </div>
                    <div className={styles.rowActions}>
                      <button className={styles.secondaryBtn} onClick={() => openEdit(it)}>
                        Edit
                      </button>
                      <button className={styles.dangerBtn} onClick={() => onDelete(it.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </section>
      </div>

      <Modal
        open={modalOpen}
        title={editing ? "Edit itinerary item" : "Create itinerary item"}
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
        <ItineraryForm trips={state.trips} value={draft} onChange={setDraft} />
      </Modal>
    </div>
  );
}
