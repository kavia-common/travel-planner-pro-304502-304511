import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";
import { api } from "../api/client";
import { getStoredUser, onUnauthorized, setAuthSession, clearAuthSession } from "../api/http";

const AppStoreContext = createContext(null);

const initialState = {
  auth: {
    status: "anonymous", // "anonymous" | "authenticated"
    user: null,
    token: "", // stored in localStorage (source of truth), kept here for convenience
  },

  data: {
    trips: [],
    destinations: [],
    itineraryItems: [],
    bookings: [],
    favorites: [],
  },

  status: {
    bootstrapping: true,
    loading: {
      trips: false,
      destinations: false,
      itinerary: false,
      bookings: false,
      favorites: false,
      auth: false,
    },
    error: {
      trips: null,
      destinations: null,
      itinerary: null,
      bookings: null,
      favorites: null,
      auth: null,
    },
  },
};

function reducer(state, action) {
  switch (action.type) {
    case "BOOTSTRAP_START":
      return { ...state, status: { ...state.status, bootstrapping: true } };

    case "BOOTSTRAP_DONE":
      return { ...state, status: { ...state.status, bootstrapping: false } };

    case "AUTH_START":
      return { ...state, status: { ...state.status, loading: { ...state.status.loading, auth: true }, error: { ...state.status.error, auth: null } } };

    case "AUTH_SUCCESS":
      return {
        ...state,
        auth: { status: "authenticated", user: action.user, token: action.token || "" },
        status: { ...state.status, loading: { ...state.status.loading, auth: false }, error: { ...state.status.error, auth: null } },
      };

    case "AUTH_FAIL":
      return {
        ...state,
        auth: { status: "anonymous", user: null, token: "" },
        status: { ...state.status, loading: { ...state.status.loading, auth: false }, error: { ...state.status.error, auth: action.error || "Authentication failed" } },
      };

    case "LOGOUT":
      return {
        ...state,
        auth: { status: "anonymous", user: null, token: "" },
        data: { trips: [], destinations: [], itineraryItems: [], bookings: [], favorites: [] },
      };

    case "SET_LOADING":
      return {
        ...state,
        status: {
          ...state.status,
          loading: { ...state.status.loading, [action.key]: action.value },
        },
      };

    case "SET_ERROR":
      return {
        ...state,
        status: {
          ...state.status,
          error: { ...state.status.error, [action.key]: action.value },
        },
      };

    case "SET_TRIPS":
      return { ...state, data: { ...state.data, trips: action.items || [] } };
    case "SET_DESTINATIONS":
      return { ...state, data: { ...state.data, destinations: action.items || [] } };
    case "SET_ITINERARY":
      return { ...state, data: { ...state.data, itineraryItems: action.items || [] } };
    case "SET_BOOKINGS":
      return { ...state, data: { ...state.data, bookings: action.items || [] } };
    case "SET_FAVORITES":
      return { ...state, data: { ...state.data, favorites: action.items || [] } };

    default:
      return state;
  }
}

function toUiTrip(t) {
  return {
    id: String(t.id),
    name: t.name || "",
    startDate: t.start_date || "",
    endDate: t.end_date || "",
    notes: t.description || "",
  };
}

function fromUiTrip(draft) {
  return {
    name: draft.name?.trim() || "",
    start_date: draft.startDate || null,
    end_date: draft.endDate || null,
    description: draft.notes || "",
  };
}

function toUiDestination(d) {
  return {
    id: String(d.id),
    tripId: String(d.trip_id),
    name: d.name || "",
    country: d.country || "",
    notes: d.notes || "",
    // coords for MapPage placeholders (backend supports lat/lng fields)
    lat: typeof d.lat === "number" ? d.lat : null,
    lng: typeof d.lng === "number" ? d.lng : null,
  };
}

function fromUiDestination(draft) {
  return {
    trip_id: Number(draft.tripId),
    name: draft.name?.trim() || "",
    country: draft.country || "",
    notes: draft.notes || "",
    lat: draft.lat ?? null,
    lng: draft.lng ?? null,
  };
}

function toUiItineraryItem(i) {
  return {
    id: String(i.id),
    tripId: String(i.trip_id),
    date: i.date || "",
    title: i.title || "",
    location: i.location || "",
    notes: i.notes || "",
    destinationId: i.destination_id != null ? String(i.destination_id) : "",
    startTime: i.start_time || "",
    endTime: i.end_time || "",
  };
}

function fromUiItineraryItem(draft) {
  return {
    trip_id: Number(draft.tripId),
    date: draft.date || "",
    title: draft.title?.trim() || "",
    location: draft.location || "",
    notes: draft.notes || "",
    destination_id: draft.destinationId ? Number(draft.destinationId) : null,
    start_time: draft.startTime || null,
    end_time: draft.endTime || null,
  };
}

function toUiBooking(b) {
  return {
    id: String(b.id),
    tripId: String(b.trip_id),
    type: b.type || "Other",
    provider: b.provider || "",
    reference: b.reference || "",
    date: b.start_date || "", // UI uses a single date; map to start_date on backend
  };
}

function fromUiBooking(draft) {
  return {
    trip_id: Number(draft.tripId),
    type: draft.type || "Other",
    provider: draft.provider || "",
    reference: draft.reference || "",
    start_date: draft.date || null,
    end_date: null,
    notes: "",
  };
}

// PUBLIC_INTERFACE
export function AppStoreProvider({ children }) {
  /**
   * API-backed store with minimal auth.
   *
   * Responsibilities:
   * - maintain auth session (token/user)
   * - load resources after login
   * - provide CRUD actions used by pages
   */
  const [state, dispatch] = useReducer(reducer, initialState);

  const refreshAll = useCallback(async () => {
    dispatch({ type: "SET_ERROR", key: "trips", value: null });
    dispatch({ type: "SET_ERROR", key: "destinations", value: null });
    dispatch({ type: "SET_ERROR", key: "itinerary", value: null });
    dispatch({ type: "SET_ERROR", key: "bookings", value: null });
    dispatch({ type: "SET_ERROR", key: "favorites", value: null });

    dispatch({ type: "SET_LOADING", key: "trips", value: true });
    dispatch({ type: "SET_LOADING", key: "destinations", value: true });
    dispatch({ type: "SET_LOADING", key: "itinerary", value: true });
    dispatch({ type: "SET_LOADING", key: "bookings", value: true });
    dispatch({ type: "SET_LOADING", key: "favorites", value: true });

    try {
      const [trips, destinations, itinerary, bookings, favorites] = await Promise.all([
        api.trips.list(),
        api.destinations.list(),
        api.itinerary.list(),
        api.bookings.list(),
        api.favorites.list(),
      ]);

      dispatch({ type: "SET_TRIPS", items: (trips || []).map(toUiTrip) });
      dispatch({ type: "SET_DESTINATIONS", items: (destinations || []).map(toUiDestination) });
      dispatch({ type: "SET_ITINERARY", items: (itinerary || []).map(toUiItineraryItem) });
      dispatch({ type: "SET_BOOKINGS", items: (bookings || []).map(toUiBooking) });
      dispatch({ type: "SET_FAVORITES", items: favorites || [] });
    } catch (e) {
      const msg = e?.details ? JSON.stringify(e.details) : e?.message || "Failed to refresh data";
      // Keep it simple; pages also surface errors via notifications.
      dispatch({ type: "SET_ERROR", key: "trips", value: msg });
    } finally {
      dispatch({ type: "SET_LOADING", key: "trips", value: false });
      dispatch({ type: "SET_LOADING", key: "destinations", value: false });
      dispatch({ type: "SET_LOADING", key: "itinerary", value: false });
      dispatch({ type: "SET_LOADING", key: "bookings", value: false });
      dispatch({ type: "SET_LOADING", key: "favorites", value: false });
    }
  }, []);

  // Bootstrap: if a user exists in storage, mark authenticated and load data.
  useEffect(() => {
    dispatch({ type: "BOOTSTRAP_START" });

    const storedUser = getStoredUser();
    if (storedUser) {
      // Token is still stored in localStorage; http.js reads it on demand.
      dispatch({ type: "AUTH_SUCCESS", user: storedUser, token: "" });
      refreshAll().finally(() => dispatch({ type: "BOOTSTRAP_DONE" }));
    } else {
      dispatch({ type: "BOOTSTRAP_DONE" });
    }

    const unsub = onUnauthorized(() => {
      clearAuthSession();
      dispatch({ type: "LOGOUT" });
    });

    return unsub;
  }, [refreshAll]);

  const actions = useMemo(() => {
    return {
      // PUBLIC_INTERFACE
      login: async ({ email, password }) => {
        /** Login via backend and store token; then load all resources. */
        dispatch({ type: "AUTH_START" });
        try {
          const res = await api.auth.login({ email, password });
          setAuthSession({ accessToken: res.access_token, user: res.user });
          dispatch({ type: "AUTH_SUCCESS", user: res.user, token: res.access_token });
          await refreshAll();
          return { ok: true };
        } catch (e) {
          const msg = e?.details ? JSON.stringify(e.details) : e?.message || "Login failed";
          dispatch({ type: "AUTH_FAIL", error: msg });
          return { ok: false, error: msg };
        }
      },

      // PUBLIC_INTERFACE
      logout: () => {
        /** Logout locally. */
        clearAuthSession();
        dispatch({ type: "LOGOUT" });
      },

      // PUBLIC_INTERFACE
      refreshAll: async () => {
        /** Reload all resource lists. */
        await refreshAll();
      },

      // PUBLIC_INTERFACE
      upsertTrip: async (draft) => {
        /** Create or update a trip, then refresh trips list. */
        dispatch({ type: "SET_LOADING", key: "trips", value: true });
        try {
          if (draft.id) {
            await api.trips.update(Number(draft.id), fromUiTrip(draft));
          } else {
            await api.trips.create(fromUiTrip(draft));
          }
          const trips = await api.trips.list();
          dispatch({ type: "SET_TRIPS", items: (trips || []).map(toUiTrip) });
          return { ok: true };
        } catch (e) {
          const msg = e?.details ? JSON.stringify(e.details) : e?.message || "Failed to save trip";
          dispatch({ type: "SET_ERROR", key: "trips", value: msg });
          return { ok: false, error: msg };
        } finally {
          dispatch({ type: "SET_LOADING", key: "trips", value: false });
        }
      },

      // PUBLIC_INTERFACE
      removeTrip: async (id) => {
        /** Delete a trip and refresh all resources (nested items cascade on backend). */
        dispatch({ type: "SET_LOADING", key: "trips", value: true });
        try {
          await api.trips.remove(Number(id));
          await refreshAll();
          return { ok: true };
        } catch (e) {
          const msg = e?.details ? JSON.stringify(e.details) : e?.message || "Failed to delete trip";
          dispatch({ type: "SET_ERROR", key: "trips", value: msg });
          return { ok: false, error: msg };
        } finally {
          dispatch({ type: "SET_LOADING", key: "trips", value: false });
        }
      },

      // PUBLIC_INTERFACE
      upsertDestination: async (draft) => {
        /** Create/update a destination and refresh destinations list. */
        dispatch({ type: "SET_LOADING", key: "destinations", value: true });
        try {
          if (draft.id) {
            await api.destinations.update(Number(draft.id), fromUiDestination(draft));
          } else {
            await api.destinations.create(fromUiDestination(draft));
          }
          const items = await api.destinations.list();
          dispatch({ type: "SET_DESTINATIONS", items: (items || []).map(toUiDestination) });
          return { ok: true };
        } catch (e) {
          const msg = e?.details ? JSON.stringify(e.details) : e?.message || "Failed to save destination";
          dispatch({ type: "SET_ERROR", key: "destinations", value: msg });
          return { ok: false, error: msg };
        } finally {
          dispatch({ type: "SET_LOADING", key: "destinations", value: false });
        }
      },

      // PUBLIC_INTERFACE
      removeDestination: async (id) => {
        /** Delete destination and refresh destinations/favorites/itinerary (may reference destination). */
        dispatch({ type: "SET_LOADING", key: "destinations", value: true });
        try {
          await api.destinations.remove(Number(id));
          await refreshAll();
          return { ok: true };
        } catch (e) {
          const msg = e?.details ? JSON.stringify(e.details) : e?.message || "Failed to delete destination";
          dispatch({ type: "SET_ERROR", key: "destinations", value: msg });
          return { ok: false, error: msg };
        } finally {
          dispatch({ type: "SET_LOADING", key: "destinations", value: false });
        }
      },

      // PUBLIC_INTERFACE
      upsertItineraryItem: async (draft) => {
        /** Create/update itinerary item and refresh itinerary list. */
        dispatch({ type: "SET_LOADING", key: "itinerary", value: true });
        try {
          if (draft.id) {
            await api.itinerary.update(Number(draft.id), fromUiItineraryItem(draft));
          } else {
            await api.itinerary.create(fromUiItineraryItem(draft));
          }
          const items = await api.itinerary.list();
          dispatch({ type: "SET_ITINERARY", items: (items || []).map(toUiItineraryItem) });
          return { ok: true };
        } catch (e) {
          const msg = e?.details ? JSON.stringify(e.details) : e?.message || "Failed to save itinerary item";
          dispatch({ type: "SET_ERROR", key: "itinerary", value: msg });
          return { ok: false, error: msg };
        } finally {
          dispatch({ type: "SET_LOADING", key: "itinerary", value: false });
        }
      },

      // PUBLIC_INTERFACE
      removeItineraryItem: async (id) => {
        /** Delete itinerary item and refresh. */
        dispatch({ type: "SET_LOADING", key: "itinerary", value: true });
        try {
          await api.itinerary.remove(Number(id));
          const items = await api.itinerary.list();
          dispatch({ type: "SET_ITINERARY", items: (items || []).map(toUiItineraryItem) });
          return { ok: true };
        } catch (e) {
          const msg = e?.details ? JSON.stringify(e.details) : e?.message || "Failed to delete itinerary item";
          dispatch({ type: "SET_ERROR", key: "itinerary", value: msg });
          return { ok: false, error: msg };
        } finally {
          dispatch({ type: "SET_LOADING", key: "itinerary", value: false });
        }
      },

      // PUBLIC_INTERFACE
      upsertBooking: async (draft) => {
        /** Create/update booking and refresh bookings list. */
        dispatch({ type: "SET_LOADING", key: "bookings", value: true });
        try {
          if (draft.id) {
            await api.bookings.update(Number(draft.id), fromUiBooking(draft));
          } else {
            await api.bookings.create(fromUiBooking(draft));
          }
          const items = await api.bookings.list();
          dispatch({ type: "SET_BOOKINGS", items: (items || []).map(toUiBooking) });
          return { ok: true };
        } catch (e) {
          const msg = e?.details ? JSON.stringify(e.details) : e?.message || "Failed to save booking";
          dispatch({ type: "SET_ERROR", key: "bookings", value: msg });
          return { ok: false, error: msg };
        } finally {
          dispatch({ type: "SET_LOADING", key: "bookings", value: false });
        }
      },

      // PUBLIC_INTERFACE
      removeBooking: async (id) => {
        /** Delete booking and refresh bookings list. */
        dispatch({ type: "SET_LOADING", key: "bookings", value: true });
        try {
          await api.bookings.remove(Number(id));
          const items = await api.bookings.list();
          dispatch({ type: "SET_BOOKINGS", items: (items || []).map(toUiBooking) });
          return { ok: true };
        } catch (e) {
          const msg = e?.details ? JSON.stringify(e.details) : e?.message || "Failed to delete booking";
          dispatch({ type: "SET_ERROR", key: "bookings", value: msg });
          return { ok: false, error: msg };
        } finally {
          dispatch({ type: "SET_LOADING", key: "bookings", value: false });
        }
      },

      // PUBLIC_INTERFACE
      addFavoriteByDestinationId: async (destinationId) => {
        /** Favorite a destination (backend contract: {destination_id}). */
        dispatch({ type: "SET_LOADING", key: "favorites", value: true });
        try {
          await api.favorites.create({ destination_id: Number(destinationId) });
          const favs = await api.favorites.list();
          dispatch({ type: "SET_FAVORITES", items: favs || [] });
          return { ok: true };
        } catch (e) {
          const msg = e?.details ? JSON.stringify(e.details) : e?.message || "Failed to add favorite";
          dispatch({ type: "SET_ERROR", key: "favorites", value: msg });
          return { ok: false, error: msg };
        } finally {
          dispatch({ type: "SET_LOADING", key: "favorites", value: false });
        }
      },

      // PUBLIC_INTERFACE
      removeFavorite: async (favoriteId) => {
        /** Remove favorite by favorite id. */
        dispatch({ type: "SET_LOADING", key: "favorites", value: true });
        try {
          await api.favorites.remove(Number(favoriteId));
          const favs = await api.favorites.list();
          dispatch({ type: "SET_FAVORITES", items: favs || [] });
          return { ok: true };
        } catch (e) {
          const msg = e?.details ? JSON.stringify(e.details) : e?.message || "Failed to remove favorite";
          dispatch({ type: "SET_ERROR", key: "favorites", value: msg });
          return { ok: false, error: msg };
        } finally {
          dispatch({ type: "SET_LOADING", key: "favorites", value: false });
        }
      },
    };
  }, [refreshAll]);

  const value = useMemo(() => {
    // Provide old property names used by pages for minimal churn
    return {
      state: {
        ...state.data,
        auth: state.auth,
        bootstrapping: state.status.bootstrapping,
        loading: state.status.loading,
        error: state.status.error,
      },
      actions,
    };
  }, [state, actions]);

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
  const trip = state.trips.find((t) => String(t.id) === String(tripId)) || null;
  return {
    trip,
    destinations: state.destinations.filter((d) => String(d.tripId) === String(tripId)),
    itineraryItems: state.itineraryItems.filter((i) => String(i.tripId) === String(tripId)),
    bookings: state.bookings.filter((b) => String(b.tripId) === String(tripId)),
  };
}
