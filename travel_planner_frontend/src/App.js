import React from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import DashboardLayout from "./components/Layout/DashboardLayout";
import TripsPage from "./pages/TripsPage";
import DestinationsPage from "./pages/DestinationsPage";
import ItineraryPage from "./pages/ItineraryPage";
import BookingsPage from "./pages/BookingsPage";
import FavoritesPage from "./pages/FavoritesPage";
import MapPage from "./pages/MapPage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import { NotificationProvider } from "./state/notifications";
import { AppStoreProvider, useAppStore } from "./state/appStore";
import "./styles/theme.css";

function RequireAuth({ children }) {
  const { state } = useAppStore();
  const location = useLocation();

  if (state.bootstrapping) return null; // keep UI clean; pages show toasts on demand
  if (state.auth?.status !== "authenticated") {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}

// PUBLIC_INTERFACE
function App() {
  /** Application entry: providers + routes + dashboard shell. */
  return (
    <NotificationProvider>
      <AppStoreProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
              element={
                <RequireAuth>
                  <DashboardLayout />
                </RequireAuth>
              }
            >
              <Route path="/" element={<Navigate to="/trips" replace />} />
              <Route path="/trips" element={<TripsPage />} />
              <Route path="/destinations" element={<DestinationsPage />} />
              <Route path="/itinerary" element={<ItineraryPage />} />
              <Route path="/bookings" element={<BookingsPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppStoreProvider>
    </NotificationProvider>
  );
}

export default App;
