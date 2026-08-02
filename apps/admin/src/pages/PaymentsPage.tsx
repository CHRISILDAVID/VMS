import React from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import PaymentsTable from '../features/payments/PaymentsTable';

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Payments & Revenue" 
        description="Platform-wide unified view of booking and membership payments"
      />
      
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden h-[calc(100vh-140px)]">
        <PaymentsTable />
      </div>
    </div>
  );
}
