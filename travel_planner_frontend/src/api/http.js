/**
 * Low-level HTTP helpers with consistent error handling.
 */

class ApiError extends Error {
  constructor(message, { status, details } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

// PUBLIC_INTERFACE
export async function httpRequest(url, { method = "GET", headers, body, signal } = {}) {
  /**
   * Execute an HTTP request and return parsed JSON (or null for 204 / empty body).
   * Throws ApiError on non-2xx responses or JSON parse issues when applicable.
   */
  const res = await fetch(url, {
    method,
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
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
    throw new ApiError(`Request failed (${res.status})`, { status: res.status, details });
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
