import { render, screen } from "@testing-library/react";
import App from "./App";

afterEach(() => {
  // Ensure tests are isolated: AppStore bootstraps from localStorage.
  localStorage.clear();
});

test("redirects unauthenticated users to Login (auth-gated routing)", async () => {
  render(<App />);

  // RequireAuth redirects anonymous users to /login.
  // "Sign in" appears multiple times on the page (title + submit button),
  // so use an unambiguous, accessible selector for the submit button.
  expect(await screen.findByRole("button", { name: /sign in/i })).toBeInTheDocument();
  expect(screen.getByText(/Demo credentials/i)).toBeInTheDocument();
});

test("renders dashboard (Trips) when a user is already in storage", async () => {
  // AppStoreProvider checks for stored user to mark authenticated on bootstrap.
  localStorage.setItem("tp_user", JSON.stringify({ id: 1, email: "demo@example.com", full_name: "Demo User" }));
  // Token isn't required for initial render; API calls may happen, but UI should show layout.
  localStorage.setItem("tp_access_token", "test-token");

  render(<App />);

  // Trips page header comes from TripsPage.
  expect(await screen.findByText(/^Trips$/i)).toBeInTheDocument();
});
