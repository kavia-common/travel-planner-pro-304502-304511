/* eslint-disable no-undef */
// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

/**
 * Global network guard for Jest:
 * Many components trigger API calls during initial render (AppStore bootstrap/refresh).
 * In unit tests we don't want real HTTP requests to localhost, so we install a default
 * `global.fetch` mock that returns empty JSON payloads.
 *
 * Individual tests can still override `global.fetch` with their own mocks.
 */
beforeEach(() => {
  if (!global.fetch || !global.fetch._isMockFunction) {
    global.fetch = jest.fn(async () => ({
      ok: true,
      status: 200,
      headers: { get: () => "application/json" },
      json: async () => ([]),
      text: async () => "",
    }));
  }
});
