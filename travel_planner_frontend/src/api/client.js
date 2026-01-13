import { API_CONFIG } from "./config";
import { httpRequest } from "./http";

function buildUrl(path, id) {
  const base = API_CONFIG.baseUrl + path;
  return id !== undefined && id !== null && id !== "" ? `${base}/${encodeURIComponent(id)}` : base;
}

function buildUrlWithQuery(path, query) {
  const url = new URL(API_CONFIG.baseUrl + path);
  Object.entries(query || {}).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    url.searchParams.set(k, String(v));
  });
  return url.toString();
}

/**
 * API client for the Travel Planner backend (FastAPI).
 * Auth: Authorization: Bearer <access_token>
 */

// PUBLIC_INTERFACE
export const api = {
  auth: {
    /** Login with email/password (returns {access_token, user}). */
    login: (payload) => httpRequest(buildUrl(API_CONFIG.paths.authLogin), { method: "POST", body: payload, auth: false }),
    /** Register new user (returns {access_token, user}). */
    register: (payload) =>
      httpRequest(buildUrl(API_CONFIG.paths.authRegister), { method: "POST", body: payload, auth: false }),
    /** Get current user profile. */
    me: () => httpRequest(buildUrl(API_CONFIG.paths.authMe)),
  },

  trips: {
    /** List trips. */
    list: () => httpRequest(buildUrl(API_CONFIG.paths.trips)),
    /** Create a trip. */
    create: (payload) => httpRequest(buildUrl(API_CONFIG.paths.trips), { method: "POST", body: payload }),
    /** Update a trip by id. */
    update: (id, payload) => httpRequest(buildUrl(API_CONFIG.paths.trips, id), { method: "PUT", body: payload }),
    /** Delete a trip by id. */
    remove: (id) => httpRequest(buildUrl(API_CONFIG.paths.trips, id), { method: "DELETE" }),
  },

  destinations: {
    /** List destinations (optional filter: {trip_id}). */
    list: ({ trip_id } = {}) => httpRequest(buildUrlWithQuery(API_CONFIG.paths.destinations, { trip_id })),
    create: (payload) => httpRequest(buildUrl(API_CONFIG.paths.destinations), { method: "POST", body: payload }),
    update: (id, payload) => httpRequest(buildUrl(API_CONFIG.paths.destinations, id), { method: "PUT", body: payload }),
    remove: (id) => httpRequest(buildUrl(API_CONFIG.paths.destinations, id), { method: "DELETE" }),
  },

  itinerary: {
    /** List itinerary items (optional filter: {trip_id}). */
    list: ({ trip_id } = {}) => httpRequest(buildUrlWithQuery(API_CONFIG.paths.itineraryItems, { trip_id })),
    create: (payload) => httpRequest(buildUrl(API_CONFIG.paths.itineraryItems), { method: "POST", body: payload }),
    update: (id, payload) => httpRequest(buildUrl(API_CONFIG.paths.itineraryItems, id), { method: "PUT", body: payload }),
    remove: (id) => httpRequest(buildUrl(API_CONFIG.paths.itineraryItems, id), { method: "DELETE" }),
  },

  bookings: {
    /** List bookings (optional filter: {trip_id}). */
    list: ({ trip_id } = {}) => httpRequest(buildUrlWithQuery(API_CONFIG.paths.bookings, { trip_id })),
    create: (payload) => httpRequest(buildUrl(API_CONFIG.paths.bookings), { method: "POST", body: payload }),
    update: (id, payload) => httpRequest(buildUrl(API_CONFIG.paths.bookings, id), { method: "PUT", body: payload }),
    remove: (id) => httpRequest(buildUrl(API_CONFIG.paths.bookings, id), { method: "DELETE" }),
  },

  favorites: {
    /** List favorites. */
    list: () => httpRequest(buildUrl(API_CONFIG.paths.favorites)),
    /** Add favorite: { destination_id }. */
    create: (payload) => httpRequest(buildUrl(API_CONFIG.paths.favorites), { method: "POST", body: payload }),
    /** Remove favorite by favorite id. */
    remove: (id) => httpRequest(buildUrl(API_CONFIG.paths.favorites, id), { method: "DELETE" }),
  },
};
