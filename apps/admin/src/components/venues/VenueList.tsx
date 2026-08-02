import React from 'react';
import { Link } from 'react-router';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { Card } from '../ui/Card';
import type { Venue } from '@vms/shared/types';

interface VenueWithCount extends Venue {
  owners?: { full_name: string; business_name: string };
  courts?: { id: string; deleted_at: string | null; is_active: boolean }[];
}

interface VenueListProps {
  venues: VenueWithCount[];
  onDeactivate: (venue: VenueWithCount) => void;
}

export function VenueList({ venues, onDeactivate }: VenueListProps) {
  if (venues.length === 0) {
    return (
      <div className="text-center py-10 text-slate-500 dark:text-slate-400">
        No venues found.
      </div>
    );
  }

  return (
    <Card className="overflow-x-auto overflow-hidden">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
        <thead className="bg-slate-50 dark:bg-slate-800/50">
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-200 sm:pl-6">
              Name
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-slate-200">
              City
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-slate-200">
              Owner
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-slate-200">
              Courts Count
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-slate-200">
              Status
            </th>
            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
          {venues.map((venue) => {
            const activeCourts = venue.courts?.filter(c => !c.deleted_at) || [];
            const courtCount = activeCourts.length;
            return (
              <tr key={venue.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 dark:text-slate-200 sm:pl-6">
                  {venue.name}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 dark:text-slate-400">
                  {venue.city || 'N/A'}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 dark:text-slate-400">
                  {venue.owners ? (
                    <div className="flex flex-col">
                      <span>{venue.owners.full_name}</span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">{venue.owners.business_name}</span>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">Unassigned</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 dark:text-slate-400">
                  {courtCount}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm">
                  <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${venue.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400'}`}>
                    {venue.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <div className="flex justify-end gap-3">
                    <Link to={`/venues/${venue.id}`} className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300" title="View Details">
                      <Eye className="h-5 w-5" />
                    </Link>
                    <Link to={`/venues/${venue.id}/edit`} className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200" title="Edit Venue">
                      <Edit className="h-5 w-5" />
                    </Link>
                    <button 
                      onClick={() => onDeactivate(venue)}
                      className="text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300"
                      title="Deactivate Venue"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}
