import React, { createContext, useCallback, useContext, useMemo, useReducer } from "react";

const AppStoreContext = createContext(null);

function nowIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

const initialState = {
  trips: [
    { id: "trip-1", name: "Summer Escape", startDate: nowIsoDate(), endDate: nowIsoDate(), notes: "Sample trip" },
  ],
  destinations: [
    { id: "dest-1", tripId: "trip-1", name: "Lisbon", country: "Portugal", notes: "Try pastel de nata" },
  ],
  itineraryItems: [
    { id: "it-1", tripId: "trip-1", date: nowIsoDate(), title: "Arrive + Check-in", location: "Hotel", notes: "" },
  ],
  bookings: [
    { id: "book-1", tripId: "trip-1", type: "Flight", provider: "Airline", reference: "ABC123", date: nowIsoDate() },
  ],
  favorites: [
    { id: "fav-1", name: "Miradouro da Graça", category: "Viewpoint", notes: "Sunset spot" },
  ],
};

function upsertById(list, item) {
  const idx = list.findIndex((x) => x.id === item.id);
  if (idx === -1) return [item, ...list];
  const next = list.slice();
  next[idx] = { ...next[idx], ...item };
  return next;
}

function removeById(list, id) {
  return list.filter((x) => x.id !== id);
}

function reducer(state, action) {
  switch (action.type) {
    case "UPSERT_TRIP":
      return { ...state, trips: upsertById(state.trips, action.payload) };
    case "REMOVE_TRIP":
      return {
        ...state,
        trips: removeById(state.trips, action.id),
        destinations: state.destinations.filter((d) => d.tripId !== action.id),
        itineraryItems: state.itineraryItems.filter((i) => i.tripId !== action.id),
        bookings: state.bookings.filter((b) => b.tripId !== action.id),
      };

    case "UPSERT_DESTINATION":
      return { ...state, destinations: upsertById(state.destinations, action.payload) };
    case "REMOVE_DESTINATION":
      return { ...state, destinations: removeById(state.destinations, action.id) };

    case "UPSERT_ITINERARY":
      return { ...state, itineraryItems: upsertById(state.itineraryItems, action.payload) };
    case "REMOVE_ITINERARY":
      return { ...state, itineraryItems: removeById(state.itineraryItems, action.id) };

    case "UPSERT_BOOKING":
      return { ...state, bookings: upsertById(state.bookings, action.payload) };
    case "REMOVE_BOOKING":
      return { ...state, bookings: removeById(state.bookings, action.id) };

    case "UPSERT_FAVORITE":
      return { ...state, favorites: upsertById(state.favorites, action.payload) };
    case "REMOVE_FAVORITE":
      return { ...state, favorites: removeById(state.favorites, action.id) };

    default:
      return state;
  }
}

// PUBLIC_INTERFACE
export function AppStoreProvider({ children }) {
  /** Local-first store used for UX; can be replaced with API-backed queries later. */
  const [state, dispatch] = useReducer(reducer, initialState);

  const actions = useMemo(() => {
    const mkId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

    return {
      upsertTrip: (trip) => dispatch({ type: "UPSERT_TRIP", payload: { ...trip, id: trip.id || mkId("trip") } }),
      removeTrip: (id) => dispatch({ type: "REMOVE_TRIP", id }),

      upsertDestination: (d) =>
        dispatch({ type: "UPSERT_DESTINATION", payload: { ...d, id: d.id || mkId("dest") } }),
      removeDestination: (id) => dispatch({ type: "REMOVE_DESTINATION", id }),

      upsertItineraryItem: (i) =>
        dispatch({ type: "UPSERT_ITINERARY", payload: { ...i, id: i.id || mkId("it") } }),
      removeItineraryItem: (id) => dispatch({ type: "REMOVE_ITINERARY", id }),

      upsertBooking: (b) =>
        dispatch({ type: "UPSERT_BOOKING", payload: { ...b, id: b.id || mkId("book") } }),
      removeBooking: (id) => dispatch({ type: "REMOVE_BOOKING", id }),

      upsertFavorite: (f) =>
        dispatch({ type: "UPSERT_FAVORITE", payload: { ...f, id: f.id || mkId("fav") } }),
      removeFavorite: (id) => dispatch({ type: "REMOVE_FAVORITE", id }),
    };
  }, []);

  const value = useMemo(() => ({ state, actions }), [state, actions]);

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

// PUBLIC_INTERFACE
export function useAppStore() {
  /** Hook to access { state, actions } */
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error("useAppStore must be used within AppStoreProvider");
  return ctx;
}

// PUBLIC_INTERFACE
export function useSelectedTrip(tripId) {
  /** Convenience selector; returns {trip, destinations, itineraryItems, bookings}. */
  const { state } = useAppStore();
  const trip = state.trips.find((t) => t.id === tripId) || null;
  return {
    trip,
    destinations: state.destinations.filter((d) => d.tripId === tripId),
    itineraryItems: state.itineraryItems.filter((i) => i.tripId === tripId),
    bookings: state.bookings.filter((b) => b.tripId === tripId),
  };
}
