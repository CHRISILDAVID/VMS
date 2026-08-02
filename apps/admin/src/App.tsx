import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router';
import { AdminLayout } from './components/layout/AdminLayout';
import DashboardPage from './pages/DashboardPage';
import { OwnersPage } from './pages/OwnersPage';
import { OwnerFormPage } from './pages/OwnerFormPage';
import { OwnerDetailPage } from './pages/OwnerDetailPage';
import { VenuesPage } from './pages/VenuesPage';
import { VenueFormPage } from './pages/VenueFormPage';
import { VenueDetailPage } from './pages/VenueDetailPage';
import { VenueSchedulePage } from './pages/VenueSchedulePage';
import BookingsPage from './pages/BookingsPage';
import CustomersPage from './pages/CustomersPage';
import { PageHeader } from './components/ui/PageHeader';
import MembershipsPage from './pages/MembershipsPage';
import PaymentsPage from './pages/PaymentsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="owners" element={<OwnersPage />} />
            <Route path="owners/new" element={<OwnerFormPage />} />
            <Route path="owners/:id" element={<OwnerDetailPage />} />
            <Route path="owners/:id/edit" element={<OwnerFormPage />} />
            <Route path="venues" element={<VenuesPage />} />
            <Route path="/venues/new" element={<VenueFormPage />} />
            <Route path="/venues/:id" element={<VenueDetailPage />} />
            <Route path="/venues/:id/edit" element={<VenueFormPage />} />
            <Route path="/venues/:id/schedule" element={<VenueSchedulePage />} />
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="memberships" element={<MembershipsPage />} />
            <Route path="payments" element={<PaymentsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
