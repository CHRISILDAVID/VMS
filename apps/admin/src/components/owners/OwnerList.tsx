import React from 'react';
import { Link } from 'react-router';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { Card } from '../ui/Card';
import type { Owner } from '@vms/shared/types';

interface OwnerWithCount extends Owner {
  venues?: [{ count: number }];
}

interface OwnerListProps {
  owners: OwnerWithCount[];
  onDeactivate: (owner: OwnerWithCount) => void;
}

export function OwnerList({ owners, onDeactivate }: OwnerListProps) {
  if (owners.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        No owners found. Add your first owner to get started.
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
              Business Name
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-slate-200">
              Contact
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-slate-200">
              Venues
            </th>
            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
          {owners.map((owner) => {
            const venueCount = owner.venues?.[0]?.count || 0;
            return (
              <tr key={owner.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 dark:text-slate-200 sm:pl-6">
                  {owner.full_name}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 dark:text-slate-400">
                  {owner.business_name}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 dark:text-slate-400">
                  <div className="flex flex-col">
                    <span>{owner.phone}</span>
                    {owner.email && <span className="text-xs text-slate-400 dark:text-slate-500">{owner.email}</span>}
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 dark:text-slate-400">
                  {venueCount}
                </td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <div className="flex justify-end gap-3">
                    <Link to={`/owners/${owner.id}`} className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300" title="View Details">
                      <Eye className="h-5 w-5" />
                    </Link>
                    <Link to={`/owners/${owner.id}/edit`} className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200" title="Edit Owner">
                      <Edit className="h-5 w-5" />
                    </Link>
                    <button 
                      onClick={() => onDeactivate(owner)}
                      className="text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300"
                      title="Deactivate Owner"
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
