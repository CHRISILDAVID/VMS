import React from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import MembershipsTable from '../features/memberships/MembershipsTable';

export default function MembershipsPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Memberships" 
        description="View platform-wide membership slots and availability"
      />
      
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden h-[calc(100vh-140px)]">
        <MembershipsTable />
      </div>
    </div>
  );
}
