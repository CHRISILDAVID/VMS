import React from 'react';
import { useParams, Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { Edit } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { createOwnersService } from '@vms/shared/services';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { formatPhone } from '@vms/shared/utils';

export function OwnerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const ownersService = createOwnersService(supabase);

  const { data: owner, isLoading, error } = useQuery({
    queryKey: ['owner', id, 'venues'],
    queryFn: () => ownersService.getOwnerWithVenues(id!)
  });

  if (isLoading) return <div className="p-8">Loading owner details...</div>;
  if (error || !owner) return <div className="p-8 text-red-500">Error loading owner details.</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <PageHeader title="Owner Details" description="View owner profile and associated venues." />
        <Link
          to={`/owners/${owner.id}/edit`}
          className="inline-flex items-center gap-2 rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <Edit className="h-4 w-4" />
          Edit Owner
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Full Name</dt>
                <dd className="mt-1 text-sm text-slate-900 dark:text-slate-200">{owner.full_name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Business Name</dt>
                <dd className="mt-1 text-sm text-slate-900 dark:text-slate-200">{owner.business_name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Phone</dt>
                <dd className="mt-1 text-sm text-slate-900 dark:text-slate-200">{formatPhone(owner.phone || "")}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Email</dt>
                <dd className="mt-1 text-sm text-slate-900 dark:text-slate-200">{owner.email || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Created At</dt>
                <dd className="mt-1 text-sm text-slate-900 dark:text-slate-200">{new Date(owner.created_at).toLocaleDateString()}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Associated Venues</CardTitle>
          </CardHeader>
          <CardContent>
            {!owner.venues || owner.venues.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No venues associated with this owner yet.</p>
            ) : (
              <ul className="divide-y divide-slate-200 dark:divide-slate-800">
                {owner.venues.map((venue: any) => (
                  <li key={venue.id} className="py-4 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{venue.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{venue.address}</p>
                    </div>
                    {/* Add link to venue detail later when venues page exists */}
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                      {venue.deleted_at ? 'Inactive' : 'Active'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
