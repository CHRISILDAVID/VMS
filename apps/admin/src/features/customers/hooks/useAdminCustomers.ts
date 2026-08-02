import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';

export function useAdminCustomers(search?: string, tab?: string) {
  return useQuery({
    queryKey: ['admin-customers', search, tab],
    queryFn: async () => {
      let query = supabase
        .from('customers')
        .select(`
          *,
          owner:owners (
            full_name
          )
        `)
        .is('deleted_at', null)
        .order('total_visits', { ascending: false });

      if (search && search.trim() !== '') {
        const term = search.trim();
        query = query.or(`full_name.ilike.%${term}%,phone.ilike.%${term}%`);
      }

      // Limit to 1000 for global view
      query = query.limit(1000);

      const { data, error } = await query;
      if (error) throw error;
      
      let res = data || [];
      if (tab === 'Frequent') {
        res = res.filter((c: any) => (c.total_visits || 0) >= 3);
      } else if (tab === 'Recent') {
        res = res.filter((c: any) => (c.total_visits || 0) < 3);
      }
      return res;
    },
    enabled: true,
  });
}
