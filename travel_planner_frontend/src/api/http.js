/**
 * Low-level HTTP helpers with consistent error handling.
 *
 * Adds:
 * - Bearer token support (stored in localStorage)
 * - 401 handling (auto-logout + optional callback)
 */

class ApiError extends Error {
  constructor(message, { status, details } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

const TOKEN_STORAGE_KEY = "tp_access_token";
const USER_STORAGE_KEY = "tp_user";

/**
 * A small module-level listener system so non-React code (http.js) can trigger logout behavior
 * inside the React app.
 */
const unauthorizedListeners = new Set();

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

// PUBLIC_INTERFACE
export function setAuthSession({ accessToken, user }) {
  /** Persist auth session to localStorage so API requests can attach Authorization header. */
  if (accessToken) localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
  if (user) localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

// PUBLIC_INTERFACE
export function clearAuthSession() {
  /** Clear persisted auth session. */
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
}

// PUBLIC_INTERFACE
export function getAccessToken() {
  /** Get current access token (if any). */
  return localStorage.getItem(TOKEN_STORAGE_KEY) || "";
}

// PUBLIC_INTERFACE
export function getStoredUser() {
  /** Get stored user profile (if any). */
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  return raw ? safeJsonParse(raw) : null;
}

// PUBLIC_INTERFACE
export function onUnauthorized(listener) {
  /**
   * Subscribe to 401 events.
   * Returns an unsubscribe function.
   */
  unauthorizedListeners.add(listener);
  return () => unauthorizedListeners.delete(listener);
}

function emitUnauthorized() {
  unauthorizedListeners.forEach((fn) => {
    try {
      fn();
    } catch {
      // ignore listener errors
    }
  });
}

function normalizeDetails(details) {
  // FastAPI commonly returns: { detail: "..." } or { detail: [ ... ] }
  if (details && typeof details === "object" && "detail" in details) return details.detail;
  return details;
}

// PUBLIC_INTERFACE
export async function httpRequest(url, { method = "GET", headers, body, signal, auth = true } = {}) {
  /**
   * Execute an HTTP request and return parsed JSON (or null for 204 / empty body).
   * Throws ApiError on non-2xx responses or JSON parse issues when applicable.
   *
   * Options:
   * - auth: boolean (default true). When true, attaches Authorization: Bearer <token> if available.
   */
  const token = auth ? getAccessToken() : "";
  const res = await fetch(url, {
    method,
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });

  const contentType = res.headers.get("content-type") || "";
  const hasJson = contentType.includes("application/json");

  if (!res.ok) {
    let details;
    try {
      details = hasJson ? await res.json() : await res.text();
    } catch {
      details = undefined;
    }

    if (res.status === 401) {
      // Ensure UI can react (redirect to login, show a toast, etc.)
      clearAuthSession();
      emitUnauthorized();
    }

    throw new ApiError(`Request failed (${res.status})`, { status: res.status, details: normalizeDetails(details) });
  }

  if (res.status === 204) return null;

  if (hasJson) {
    try {
      return await res.json();
    } catch (e) {
      throw new ApiError("Failed to parse JSON response", { status: res.status, details: String(e) });
    }
  }

  // Allow non-JSON success responses (rare); return text.
  return await res.text();
}
