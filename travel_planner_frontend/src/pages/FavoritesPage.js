import React, { useMemo, useState } from "react";
import Modal from "../components/Modal/Modal";
import { EmptyBlock } from "../components/Status/StatusBlocks";
import { Field, Select, TextArea, TextInput } from "../components/Form/FormControls";
import { useAppStore } from "../state/appStore";
import { useNotifications } from "../state/notifications";
import styles from "./Page.module.css";

function FavoriteForm({ value, onChange }) {
  return (
    <div className={styles.formGrid}>
      <Field label="Place name">
        <TextInput value={value.name} onChange={(e) => onChange({ ...value, name: e.target.value })} placeholder="e.g., Senso-ji Temple" />
      </Field>
      <Field label="Category" hint="Optional">
        <Select value={value.category} onChange={(e) => onChange({ ...value, category: e.target.value })}>
          <option value="Restaurant">Restaurant</option>
          <option value="Cafe">Cafe</option>
          <option value="Attraction">Attraction</option>
          <option value="Museum">Museum</option>
          <option value="Park">Park</option>
          <option value="Viewpoint">Viewpoint</option>
          <option value="Shopping">Shopping</option>
          <option value="Other">Other</option>
        </Select>
      </Field>
      <Field label="Notes" hint="Optional">
        <TextArea rows={3} value={value.notes} onChange={(e) => onChange({ ...value, notes: e.target.value })} placeholder="Why you saved it, links, best time to visit…" />
      </Field>
    </div>
  );
}

// PUBLIC_INTERFACE
export default function FavoritesPage() {
  /** Favorite places list + create/edit/delete modal. */
  const { state, actions } = useAppStore();
  const { notify } = useNotifications();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const defaultDraft = useMemo(() => ({ id: "", name: "", category: "Attraction", notes: "" }), []);
  const [draft, setDraft] = useState(defaultDraft);

  const openCreate = () => {
    setEditing(null);
    setDraft(defaultDraft);
    setModalOpen(true);
  };

  const openEdit = (f) => {
    setEditing(f);
    setDraft({ ...f });
    setModalOpen(true);
  };

  const onSave = () => {
    if (!draft.name.trim()) {
      notify({ type: "error", title: "Missing name", message: "Place name is required." });
      return;
    }
    actions.upsertFavorite(draft);
    notify({ type: "success", title: "Saved", message: editing ? "Favorite updated." : "Favorite created." });
    setModalOpen(false);
  };

  const onDelete = (id) => {
    actions.removeFavorite(id);
    notify({ type: "success", title: "Deleted", message: "Favorite removed." });
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.pageTitle}>Favorites</div>
          <div className={styles.pageSub}>Save places you may want to visit across trips.</div>
        </div>
        <button className={styles.primaryBtn} onClick={openCreate}>
          + New favorite
        </button>
      </div>

      {!state.favorites.length ? (
        <EmptyBlock title="No favorites yet" message="Save a place to quickly access it later." />
      ) : (
        <div className={styles.tableCard}>
          <div className={styles.table}>
            <div className={styles.trHead}>
              <div>Place</div>
              <div>Category</div>
              <div className={styles.trActionsCol}>Actions</div>
            </div>
            {state.favorites.map((f) => (
              <div key={f.id} className={styles.trRow}>
                <div className={styles.strong}>{f.name}</div>
                <div className={styles.muted}>{f.category}</div>
                <div className={styles.rowActions}>
                  <button className={styles.secondaryBtn} onClick={() => openEdit(f)}>
                    Edit
                  </button>
                  <button className={styles.dangerBtn} onClick={() => onDelete(f.id)}>
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
        title={editing ? "Edit favorite" : "Create favorite"}
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
        <FavoriteForm value={draft} onChange={setDraft} />
      </Modal>
    </div>
  );
}
