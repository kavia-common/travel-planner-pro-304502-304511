/**
 * Centralized API configuration (base URL + paths).
 *
 * - Base URL is configurable via REACT_APP_API_BASE_URL.
 * - No backend port is hardcoded; a sensible default is used for local dev.
 */

const DEFAULT_API_BASE_URL = "http://localhost:3001";

// PUBLIC_INTERFACE
export const API_CONFIG = Object.freeze({
  /** Base URL for the backend API. Override with REACT_APP_API_BASE_URL. */
  baseUrl: (process.env.REACT_APP_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, ""),
  /** URL path segments for backend resources. */
  paths: Object.freeze({
    authLogin: "/auth/login",
    authRegister: "/auth/register",
    authMe: "/auth/me",

    trips: "/trips",
    destinations: "/destinations",
    itineraryItems: "/itinerary",
    bookings: "/bookings",
    favorites: "/favorites",
  }),
});
