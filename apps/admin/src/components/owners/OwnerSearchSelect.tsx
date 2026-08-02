import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, ChevronDown, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { createOwnersService } from '@vms/shared/services';

interface OwnerSearchSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function OwnerSearchSelect({ value, onChange, className = '' }: OwnerSearchSelectProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const ownersService = createOwnersService(supabase);

  const { data: owners, isLoading } = useQuery({
    queryKey: ['owners_search', query],
    queryFn: () => ownersService.searchOwners(query, 10),
  });

  const selectedOwner = owners?.find(o => o.id === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 px-3 shadow-sm sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      >
        <span className="truncate">
          {value ? (
            selectedOwner ? (
              `${selectedOwner.full_name} (${selectedOwner.business_name})`
            ) : (
              'Selected Owner'
            )
          ) : (
            <span className="text-slate-400">-- Unassigned --</span>
          )}
        </span>
        <ChevronDown size={16} className="text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full rounded-md bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 max-h-60 overflow-auto">
          <div className="sticky top-0 p-2 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search size={14} className="text-slate-400" />
              </div>
              <input
                type="text"
                className="block w-full rounded-md border-0 py-1.5 pl-9 pr-3 text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 ring-1 ring-inset ring-slate-300 dark:ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-blue-600"
                placeholder="Search owners..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
          
          <ul className="py-1 text-sm text-slate-700 dark:text-slate-300">
            <li
              className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-slate-100 dark:hover:bg-slate-700 ${!value ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100' : ''}`}
              onClick={() => {
                onChange('');
                setIsOpen(false);
              }}
            >
              <span className="block truncate">-- Unassigned --</span>
              {!value && (
                <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600 dark:text-blue-400">
                  <Check size={16} />
                </span>
              )}
            </li>
            
            {isLoading ? (
              <li className="py-2 px-3 text-slate-500 text-center">Searching...</li>
            ) : owners?.length === 0 ? (
              <li className="py-2 px-3 text-slate-500 text-center">No owners found</li>
            ) : (
              owners?.map((owner) => (
                <li
                  key={owner.id}
                  className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-slate-100 dark:hover:bg-slate-700 ${value === owner.id ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100' : ''}`}
                  onClick={() => {
                    onChange(owner.id);
                    setIsOpen(false);
                  }}
                >
                  <div className="flex flex-col">
                    <span className="block truncate font-medium">{owner.full_name}</span>
                    <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{owner.business_name} | {owner.email || 'No email'}</span>
                  </div>
                  {value === owner.id && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600 dark:text-blue-400">
                      <Check size={16} />
                    </span>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
