import React from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import CustomersTable from '../features/customers/CustomersTable';

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Customers" 
        description="View platform customers"
      />
      
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <CustomersTable />
      </div>
    </div>
  );
}
