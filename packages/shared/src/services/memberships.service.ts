import type { SupabaseClient } from '@supabase/supabase-js'
import type { 
  MembershipSlot, 
  Member, 
  MembershipApplication, 
  GuestPlay, 
  MembershipSlotRelease,
  Customer,
  Court,
  ApplicationStatus,
  GuestPlayStatus
} from '../types'
import { createCustomersService } from './customers.service'

export interface MemberWithDetails extends Member {
  customer?: Customer;
  slot?: MembershipSlot;
  latest_payment?: {
    status: 'paid' | 'due' | 'overdue';
    amount?: number;
    due_date?: string;
  };
}

export interface MembershipSlotWithDetails extends MembershipSlot {
  court?: Court;
  members?: MemberWithDetails[];
  active_count?: number;
}

export interface MembershipApplicationWithDetails extends MembershipApplication {
  slot?: MembershipSlot;
}

export interface GuestPlayWithDetails extends GuestPlay {
  slot?: MembershipSlot;
  application?: MembershipApplication;
}

export const createMembershipsService = (supabase: SupabaseClient) => {
  const customersService = createCustomersService(supabase);

  return {
    async getSlots(venueId: string): Promise<MembershipSlotWithDetails[]> {
      const { data: slots, error } = await supabase
        .from('membership_slots')
        .select(`
          *,
          court:courts(*),
          members:members(
            *,
            customer:customers(*)
          )
        `)
        .eq('venue_id', venueId)
        .is('deleted_at', null)
        .order('name');

      if (error) throw error;

      return (slots || []).map((slot: any) => ({
        ...slot,
        active_count: (slot.members || []).filter((m: any) => m.is_active && !m.deleted_at).length
      })) as MembershipSlotWithDetails[];
    },

    async getSlotById(slotId: string): Promise<MembershipSlotWithDetails | null> {
      const { data: slot, error } = await supabase
        .from('membership_slots')
        .select(`
          *,
          court:courts(*),
          members:members(
            *,
            customer:customers(*)
          )
        `)
        .eq('id', slotId)
        .is('deleted_at', null)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (!slot) return null;

      return {
        ...slot,
        active_count: (slot.members || []).filter((m: any) => m.is_active && !m.deleted_at).length
      } as MembershipSlotWithDetails;
    },

    async createSlot(
      venueId: string, 
      data: Partial<MembershipSlot>, 
      initialMembers?: { full_name: string; phone: string; email?: string }[]
    ): Promise<MembershipSlotWithDetails> {
      // 1. Insert slot
      const { data: created, error } = await supabase
        .from('membership_slots')
        .insert({
          venue_id: venueId,
          name: data.name,
          playing_days: data.playing_days || [],
          start_time: data.start_time,
          end_time: data.end_time,
          skill_level: data.skill_level || 'intermediate',
          monthly_fee: data.monthly_fee || 0,
          capacity: data.capacity || 10,
          guest_play_fee: data.guest_play_fee || 0,
          allow_guest_play: data.allow_guest_play || false,
          billing_day: data.billing_day || 1,
          is_published: data.is_published ?? true,
          is_recruiting: data.is_recruiting ?? true,
          court_id: data.court_id || null,
        })
        .select()
        .single();

      if (error) throw error;

      // 2. Insert initial members if any
      if (initialMembers && initialMembers.length > 0) {
        const { data: venue } = await supabase.from('venues').select('owner_id').eq('id', venueId).single();
        if (venue) {
          for (const m of initialMembers) {
            if (!m.phone || !m.full_name) continue;
            const customer = await customersService.createOrGetCustomer(venue.owner_id, {
              full_name: m.full_name,
              phone: m.phone,
              email: m.email || null,
            });
            await supabase.from('members').insert({
              slot_id: created.id,
              customer_id: customer.id,
              is_active: true,
            });
          }
        }
      }

      const fullSlot = await this.getSlotById(created.id);
      return fullSlot!;
    },

    async updateSlot(slotId: string, data: Partial<MembershipSlot>): Promise<MembershipSlotWithDetails> {
      const { error } = await supabase
        .from('membership_slots')
        .update(data)
        .eq('id', slotId);

      if (error) throw error;
      const fullSlot = await this.getSlotById(slotId);
      return fullSlot!;
    },

    async deleteSlot(slotId: string): Promise<void> {
      const { error } = await supabase
        .from('membership_slots')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', slotId);

      if (error) throw error;
    },

    async toggleOpen(slotId: string, isRecruiting: boolean): Promise<MembershipSlotWithDetails> {
      return this.updateSlot(slotId, { is_recruiting: isRecruiting });
    },

    async getMembers(slotId?: string, venueId?: string): Promise<MemberWithDetails[]> {
      let query = supabase
        .from('members')
        .select(`
          *,
          customer:customers(*),
          slot:membership_slots(*)
        `)
        .is('deleted_at', null);

      if (slotId) {
        query = query.eq('slot_id', slotId);
      } else if (venueId) {
        const { data: slots } = await supabase.from('membership_slots').select('id').eq('venue_id', venueId);
        const slotIds = (slots || []).map(s => s.id);
        if (slotIds.length === 0) return [];
        query = query.in('slot_id', slotIds);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((m: any) => ({
        ...m,
        latest_payment: {
          status: m.is_active ? 'paid' : 'due',
        }
      })) as MemberWithDetails[];
    },

    async addMember(slotId: string, customerData: { full_name: string; phone: string; email?: string }): Promise<MemberWithDetails> {
      const { data: slot } = await supabase.from('membership_slots').select('venue_id').eq('id', slotId).single();
      if (!slot) throw new Error('Slot not found');
      const { data: venue } = await supabase.from('venues').select('owner_id').eq('id', slot.venue_id).single();
      if (!venue) throw new Error('Venue not found');

      const customer = await customersService.createOrGetCustomer(venue.owner_id, customerData);

      const { data: existing } = await supabase
        .from('members')
        .select('*')
        .eq('slot_id', slotId)
        .eq('customer_id', customer.id)
        .single();

      let memberId: string;
      if (existing) {
        if (existing.deleted_at || !existing.is_active) {
          const { data: updated, error } = await supabase
            .from('members')
            .update({ is_active: true, deleted_at: null })
            .eq('id', existing.id)
            .select()
            .single();
          if (error) throw error;
          memberId = updated.id;
        } else {
          memberId = existing.id;
        }
      } else {
        const { data: created, error } = await supabase
          .from('members')
          .insert({
            slot_id: slotId,
            customer_id: customer.id,
            is_active: true,
          })
          .select()
          .single();
        if (error) throw error;
        memberId = created.id;
      }

      const { data: fullMember, error: fetchErr } = await supabase
        .from('members')
        .select(`*, customer:customers(*), slot:membership_slots(*)`)
        .eq('id', memberId)
        .single();

      if (fetchErr) throw fetchErr;
      return { ...fullMember, latest_payment: { status: 'paid' } } as MemberWithDetails;
    },

    async updateMember(memberId: string, data: { is_active?: boolean; full_name?: string; phone?: string }): Promise<MemberWithDetails> {
      if (data.is_active !== undefined) {
        const { error } = await supabase
          .from('members')
          .update({ is_active: data.is_active })
          .eq('id', memberId);
        if (error) throw error;
      }

      if (data.full_name || data.phone) {
        const { data: m } = await supabase.from('members').select('customer_id').eq('id', memberId).single();
        if (m) {
          const updateObj: any = {};
          if (data.full_name) updateObj.full_name = data.full_name.trim();
          if (data.phone) updateObj.phone = data.phone.trim();
          await supabase.from('customers').update(updateObj).eq('id', m.customer_id);
        }
      }

      const { data: fullMember, error: fetchErr } = await supabase
        .from('members')
        .select(`*, customer:customers(*), slot:membership_slots(*)`)
        .eq('id', memberId)
        .single();

      if (fetchErr) throw fetchErr;
      return { ...fullMember, latest_payment: { status: fullMember.is_active ? 'paid' : 'due' } } as MemberWithDetails;
    },

    async removeMember(memberId: string): Promise<void> {
      const { error } = await supabase
        .from('members')
        .update({ deleted_at: new Date().toISOString(), is_active: false })
        .eq('id', memberId);

      if (error) throw error;
    },

    async transferMember(memberId: string, toSlotId: string): Promise<MemberWithDetails> {
      const { error } = await supabase
        .from('members')
        .update({ slot_id: toSlotId })
        .eq('id', memberId);

      if (error) throw error;

      const { data: fullMember, error: fetchErr } = await supabase
        .from('members')
        .select(`*, customer:customers(*), slot:membership_slots(*)`)
        .eq('id', memberId)
        .single();

      if (fetchErr) throw fetchErr;
      return { ...fullMember, latest_payment: { status: 'paid' } } as MemberWithDetails;
    },

    async getApplications(venueId: string, status?: ApplicationStatus): Promise<MembershipApplicationWithDetails[]> {
      const { data: slots } = await supabase.from('membership_slots').select('id').eq('venue_id', venueId);
      const slotIds = (slots || []).map(s => s.id);
      if (slotIds.length === 0) return [];

      let query = supabase
        .from('membership_applications')
        .select(`*, slot:membership_slots(*)`)
        .in('slot_id', slotIds)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as MembershipApplicationWithDetails[];
    },

    async acceptApplication(applicationId: string, reviewedBy?: string): Promise<MemberWithDetails> {
      const { data: app, error: appErr } = await supabase
        .from('membership_applications')
        .select('*')
        .eq('id', applicationId)
        .single();

      if (appErr || !app) throw new Error('Application not found');

      const member = await this.addMember(app.slot_id, {
        full_name: app.applicant_name,
        phone: app.phone,
      });

      await supabase
        .from('membership_applications')
        .update({
          status: 'accepted',
          reviewed_at: new Date().toISOString(),
          reviewed_by: reviewedBy || null,
        })
        .eq('id', applicationId);

      return member;
    },

    async rejectApplication(applicationId: string, reviewedBy?: string): Promise<void> {
      const { error } = await supabase
        .from('membership_applications')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: reviewedBy || null,
        })
        .eq('id', applicationId);

      if (error) throw error;
    },

    async inviteToGuestPlay(applicationId: string, scheduledDate: string): Promise<GuestPlayWithDetails> {
      const { data: app, error: appErr } = await supabase
        .from('membership_applications')
        .select('*')
        .eq('id', applicationId)
        .single();

      if (appErr || !app) throw new Error('Application not found');

      const { data: created, error } = await supabase
        .from('guest_plays')
        .insert({
          slot_id: app.slot_id,
          application_id: applicationId,
          player_name: app.applicant_name,
          phone: app.phone,
          scheduled_date: scheduledDate,
          status: 'upcoming',
        })
        .select(`*, slot:membership_slots(*), application:membership_applications(*)`)
        .single();

      if (error) throw error;

      await supabase
        .from('membership_applications')
        .update({ status: 'invited_guest' })
        .eq('id', applicationId);

      return created as GuestPlayWithDetails;
    },

    async getGuestPlays(venueId: string, status?: GuestPlayStatus): Promise<GuestPlayWithDetails[]> {
      const { data: slots } = await supabase.from('membership_slots').select('id').eq('venue_id', venueId);
      const slotIds = (slots || []).map(s => s.id);
      if (slotIds.length === 0) return [];

      let query = supabase
        .from('guest_plays')
        .select(`*, slot:membership_slots(*), application:membership_applications(*)`)
        .in('slot_id', slotIds)
        .order('scheduled_date', { ascending: true });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as GuestPlayWithDetails[];
    },

    async updateGuestPlayStatus(guestPlayId: string, status: GuestPlayStatus): Promise<GuestPlayWithDetails> {
      const { data: updated, error } = await supabase
        .from('guest_plays')
        .update({ status })
        .eq('id', guestPlayId)
        .select(`*, slot:membership_slots(*), application:membership_applications(*)`)
        .single();

      if (error) throw error;
      return updated as GuestPlayWithDetails;
    },

    async acceptGuestAsMember(guestPlayId: string): Promise<MemberWithDetails> {
      const { data: gp, error: gpErr } = await supabase
        .from('guest_plays')
        .select('*')
        .eq('id', guestPlayId)
        .single();

      if (gpErr || !gp) throw new Error('Guest play not found');

      const member = await this.addMember(gp.slot_id, {
        full_name: gp.player_name,
        phone: gp.phone,
      });

      await supabase
        .from('guest_plays')
        .update({ status: 'accepted_member' })
        .eq('id', guestPlayId);

      if (gp.application_id) {
        await supabase
          .from('membership_applications')
          .update({ status: 'accepted', reviewed_at: new Date().toISOString() })
          .eq('id', gp.application_id);
      }

      return member;
    },

    async releaseSlot(slotId: string, releaseDate: string, releasedBy: string): Promise<MembershipSlotRelease> {
      const { data, error } = await supabase
        .from('membership_slot_releases')
        .insert({
          slot_id: slotId,
          release_date: releaseDate,
          released_by: releasedBy,
        })
        .select()
        .single();

      if (error && !error.message?.includes('duplicate key')) throw error;
      return data as MembershipSlotRelease;
    },

    async unreleaseSlot(slotId: string, releaseDate: string): Promise<void> {
      const { error } = await supabase
        .from('membership_slot_releases')
        .delete()
        .eq('slot_id', slotId)
        .eq('release_date', releaseDate);

      if (error) throw error;
    }
  };
};
