import React, { useMemo } from "react";
import styles from "./CalendarView.module.css";

function startOfMonth(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), 1);
  return d;
}

function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function toIsoDate(d) {
  return d.toISOString().slice(0, 10);
}

function addDays(d, days) {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return next;
}

function weekdayIndexMon0(d) {
  // Convert JS Sunday=0.. to Monday=0..
  const js = d.getDay();
  return (js + 6) % 7;
}

// PUBLIC_INTERFACE
export default function CalendarView({ month, items, onSelectDate }) {
  /**
   * Calendar month view.
   * Props:
   * - month: Date (any day within target month)
   * - items: Array<{id, date: 'YYYY-MM-DD', title: string}>
   * - onSelectDate: (isoDate: string) => void
   */
  const model = useMemo(() => {
    const m = month instanceof Date ? month : new Date();
    const first = startOfMonth(m);
    const last = endOfMonth(m);

    const gridStart = addDays(first, -weekdayIndexMon0(first));
    const gridEnd = addDays(last, (6 - weekdayIndexMon0(last)));

    const days = [];
    for (let d = gridStart; d <= gridEnd; d = addDays(d, 1)) {
      days.push(new Date(d));
    }

    const byDate = new Map();
    (items || []).forEach((it) => {
      if (!it?.date) return;
      const arr = byDate.get(it.date) || [];
      arr.push(it);
      byDate.set(it.date, arr);
    });

    return { first, last, days, byDate };
  }, [month, items]);

  const monthLabel = useMemo(() => {
    const d = month instanceof Date ? month : new Date();
    return d.toLocaleString(undefined, { month: "long", year: "numeric" });
  }, [month]);

  return (
    <section className={styles.card} aria-label="Calendar">
      <div className={styles.header}>
        <div className={styles.headerTitle}>{monthLabel}</div>
        <div className={styles.headerHint}>Click a date to add an itinerary item</div>
      </div>

      <div className={styles.weekdays} aria-hidden="true">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((w) => (
          <div key={w} className={styles.weekday}>
            {w}
          </div>
        ))}
      </div>

      <div className={styles.grid}>
        {model.days.map((d) => {
          const iso = toIsoDate(d);
          const inMonth = d.getMonth() === model.first.getMonth();
          const dayItems = model.byDate.get(iso) || [];
          return (
            <button
              key={iso}
              className={`${styles.day} ${inMonth ? "" : styles.dayMuted}`}
              onClick={() => onSelectDate?.(iso)}
              aria-label={`Select ${iso}`}
            >
              <div className={styles.dayNum}>{d.getDate()}</div>
              <div className={styles.dayItems}>
                {dayItems.slice(0, 2).map((it) => (
                  <div key={it.id} className={styles.pill} title={it.title}>
                    {it.title}
                  </div>
                ))}
                {dayItems.length > 2 ? <div className={styles.more}>+{dayItems.length - 2} more</div> : null}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
