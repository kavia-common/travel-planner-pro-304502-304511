import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import DashboardLayout from "./components/Layout/DashboardLayout";
import TripsPage from "./pages/TripsPage";
import DestinationsPage from "./pages/DestinationsPage";
import ItineraryPage from "./pages/ItineraryPage";
import BookingsPage from "./pages/BookingsPage";
import FavoritesPage from "./pages/FavoritesPage";
import MapPage from "./pages/MapPage";
import NotFoundPage from "./pages/NotFoundPage";
import { NotificationProvider } from "./state/notifications";
import { AppStoreProvider } from "./state/appStore";
import "./styles/theme.css";

// PUBLIC_INTERFACE
function App() {
  /** Application entry: providers + routes + dashboard shell. */
  return (
    <NotificationProvider>
      <AppStoreProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<DashboardLayout />}>
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
