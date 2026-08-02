import React from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import BookingsTable from '../features/bookings/BookingsTable';

export default function BookingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Bookings" 
        description="View platform bookings"
      />
      
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <BookingsTable />
      </div>
    </div>
  );
}
