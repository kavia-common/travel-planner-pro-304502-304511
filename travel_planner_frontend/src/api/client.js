import { API_CONFIG } from "./config";
import { httpRequest } from "./http";

function buildUrl(path, id) {
  const base = API_CONFIG.baseUrl + path;
  return id ? `${base}/${encodeURIComponent(id)}` : base;
}

/**
 * NOTE: Backend endpoints may not exist yet.
 * The UI will gracefully show error notifications if calls fail.
 */

// PUBLIC_INTERFACE
export const api = {
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
    list: () => httpRequest(buildUrl(API_CONFIG.paths.destinations)),
    create: (payload) => httpRequest(buildUrl(API_CONFIG.paths.destinations), { method: "POST", body: payload }),
    update: (id, payload) => httpRequest(buildUrl(API_CONFIG.paths.destinations, id), { method: "PUT", body: payload }),
    remove: (id) => httpRequest(buildUrl(API_CONFIG.paths.destinations, id), { method: "DELETE" }),
  },

  itinerary: {
    list: () => httpRequest(buildUrl(API_CONFIG.paths.itineraryItems)),
    create: (payload) => httpRequest(buildUrl(API_CONFIG.paths.itineraryItems), { method: "POST", body: payload }),
    update: (id, payload) => httpRequest(buildUrl(API_CONFIG.paths.itineraryItems, id), { method: "PUT", body: payload }),
    remove: (id) => httpRequest(buildUrl(API_CONFIG.paths.itineraryItems, id), { method: "DELETE" }),
  },

  bookings: {
    list: () => httpRequest(buildUrl(API_CONFIG.paths.bookings)),
    create: (payload) => httpRequest(buildUrl(API_CONFIG.paths.bookings), { method: "POST", body: payload }),
    update: (id, payload) => httpRequest(buildUrl(API_CONFIG.paths.bookings, id), { method: "PUT", body: payload }),
    remove: (id) => httpRequest(buildUrl(API_CONFIG.paths.bookings, id), { method: "DELETE" }),
  },

  favorites: {
    list: () => httpRequest(buildUrl(API_CONFIG.paths.favorites)),
    create: (payload) => httpRequest(buildUrl(API_CONFIG.paths.favorites), { method: "POST", body: payload }),
    update: (id, payload) => httpRequest(buildUrl(API_CONFIG.paths.favorites, id), { method: "PUT", body: payload }),
    remove: (id) => httpRequest(buildUrl(API_CONFIG.paths.favorites, id), { method: "DELETE" }),
  },
};
