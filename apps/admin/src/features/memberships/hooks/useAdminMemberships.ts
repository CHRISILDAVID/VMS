import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';

export function useAdminMemberships(search?: string) {
  return useQuery({
    queryKey: ['admin-memberships', search],
    queryFn: async () => {
      let query = supabase
        .from('membership_slots')
        .select(`
          *,
          venue:venues(name, owner:owners(full_name)),
          members(id)
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(1000);

      const { data, error } = await query;
      if (error) throw error;
      
      let res = data || [];
      if (search && search.trim() !== '') {
        const q = search.toLowerCase().trim();
        res = res.filter((slot: any) => 
          slot.name.toLowerCase().includes(q) ||
          slot.venue?.name?.toLowerCase().includes(q)
        );
      }
      
      // Calculate active members count client-side for simplicity in MVP
      return res.map((slot: any) => ({
        ...slot,
        active_members_count: slot.members ? slot.members.length : 0
      }));
    },
    enabled: true,
  });
}
