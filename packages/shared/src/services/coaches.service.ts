import type { SupabaseClient } from '@supabase/supabase-js';
import type { Coach, CreateCoachInput, UpdateCoachInput } from '../types';

/**
 * Coaches service factory — used by both the Player App (Train sub-tab)
 * and the Admin Panel (Coach Management).
 */
export function createCoachesService(supabase: SupabaseClient) {
  /**
   * Fetch all active coaches, optionally filtered by venue.
   * Joins venue name for display.
   */
  async function getCoaches(venueId?: string): Promise<Coach[]> {
    let query = supabase
      .from('coaches')
      .select(`
        *,
        venue:venues(id, name, city)
      `)
      .eq('is_active', true)
      .order('full_name');

    if (venueId) {
      query = query.eq('venue_id', venueId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as Coach[];
  }

  /**
   * Fetch all coaches (active + inactive) for admin management table.
   */
  async function getAllCoaches(): Promise<Coach[]> {
    const { data, error } = await supabase
      .from('coaches')
      .select(`
        *,
        venue:venues(id, name, city)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as Coach[];
  }

  /**
   * Fetch a single coach by ID.
   */
  async function getCoach(id: string): Promise<Coach | null> {
    const { data, error } = await supabase
      .from('coaches')
      .select(`
        *,
        venue:venues(id, name, city)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as Coach;
  }

  /**
   * Admin: Create a new coach profile.
   */
  async function createCoach(
    adminUserId: string,
    input: CreateCoachInput
  ): Promise<Coach> {
    const { data, error } = await supabase
      .from('coaches')
      .insert({
        full_name: input.full_name,
        venue_id: input.venue_id ?? null,
        photo_url: input.photo_url ?? null,
        specialty: input.specialty ?? [],
        bio: input.bio ?? null,
        price_per_session: input.price_per_session,
        is_active: true,
        created_by: adminUserId,
      })
      .select(`*, venue:venues(id, name, city)`)
      .single();

    if (error) throw error;
    return data as Coach;
  }

  /**
   * Admin: Update a coach profile.
   */
  async function updateCoach(id: string, input: UpdateCoachInput): Promise<Coach> {
    const { data, error } = await supabase
      .from('coaches')
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`*, venue:venues(id, name, city)`)
      .single();

    if (error) throw error;
    return data as Coach;
  }

  /**
   * Admin: Deactivate a coach (soft-disable, not delete).
   */
  async function deactivateCoach(id: string): Promise<void> {
    const { error } = await supabase
      .from('coaches')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Admin: Reactivate a deactivated coach.
   */
  async function reactivateCoach(id: string): Promise<void> {
    const { error } = await supabase
      .from('coaches')
      .update({ is_active: true, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }

  return {
    getCoaches,
    getAllCoaches,
    getCoach,
    createCoach,
    updateCoach,
    deactivateCoach,
    reactivateCoach,
  };
}
