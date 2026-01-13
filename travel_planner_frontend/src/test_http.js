import { clearAuthSession, getAccessToken, getStoredUser, httpRequest, onUnauthorized, setAuthSession } from "./api/http";

describe("api/http edge cases", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    localStorage.clear();
  });

  test("setAuthSession/getAccessToken/getStoredUser round-trip", () => {
    setAuthSession({ accessToken: "abc123", user: { id: 7, email: "u@example.com" } });
    expect(getAccessToken()).toBe("abc123");
    expect(getStoredUser()).toEqual({ id: 7, email: "u@example.com" });
  });

  test("getStoredUser returns null on malformed JSON", () => {
    localStorage.setItem("tp_user", "{not-json");
    expect(getStoredUser()).toBeNull();
  });

  test("httpRequest attaches Authorization header when auth=true and token exists", async () => {
    setAuthSession({ accessToken: "token-1", user: { id: 1, email: "a@b.com" } });

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => "application/json" },
      json: async () => ({ ok: true }),
    });

    const res = await httpRequest("https://example.com/test");
    expect(res).toEqual({ ok: true });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [, options] = global.fetch.mock.calls[0];
    expect(options.headers.Authorization).toBe("Bearer token-1");
  });

  test("httpRequest does NOT attach Authorization when auth=false", async () => {
    setAuthSession({ accessToken: "token-2", user: { id: 1, email: "a@b.com" } });

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => "application/json" },
      json: async () => ({ ok: true }),
    });

    await httpRequest("https://example.com/test", { auth: false });

    const [, options] = global.fetch.mock.calls[0];
    expect(options.headers.Authorization).toBeUndefined();
  });

  test("401 response clears session and notifies unauthorized listeners", async () => {
    setAuthSession({ accessToken: "token-3", user: { id: 1, email: "a@b.com" } });

    const listener = jest.fn();
    const unsubscribe = onUnauthorized(listener);

    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      headers: { get: () => "application/json" },
      json: async () => ({ detail: "Missing Bearer token" }),
      text: async () => "Missing Bearer token",
    });

    await expect(httpRequest("https://example.com/protected")).rejects.toMatchObject({
      name: "ApiError",
      status: 401,
    });

    expect(getAccessToken()).toBe("");
    expect(getStoredUser()).toBeNull();
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
  });

  test("successful JSON response with invalid JSON throws ApiError(parse)", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => "application/json" },
      json: async () => {
        throw new Error("boom");
      },
    });

    await expect(httpRequest("https://example.com/bad-json")).rejects.toMatchObject({
      name: "ApiError",
      message: "Failed to parse JSON response",
      status: 200,
    });
  });

  test("204 returns null", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 204,
      headers: { get: () => "" },
      text: async () => "",
    });

    await expect(httpRequest("https://example.com/no-content")).resolves.toBeNull();
  });

  test("clearAuthSession removes stored keys", () => {
    localStorage.setItem("tp_access_token", "x");
    localStorage.setItem("tp_user", JSON.stringify({ id: 1 }));
    clearAuthSession();
    expect(localStorage.getItem("tp_access_token")).toBeNull();
    expect(localStorage.getItem("tp_user")).toBeNull();
  });
});
