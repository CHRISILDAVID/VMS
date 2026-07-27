import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { createMembershipsService } from '@vms/shared/services';
import { ApplicationStatus, GuestPlayStatus, MembershipSlot } from '@vms/shared/types';
import { useVenueStore } from '../../../stores/venueStore';
import { useAuthContext } from '../../../contexts/AuthContext';

const membershipsService = createMembershipsService(supabase);

export function useMembershipSlots() {
  const { selectedVenueId } = useVenueStore();

  const query = useQuery({
    queryKey: ['membership-slots', selectedVenueId],
    queryFn: async () => {
      if (!selectedVenueId) return [];
      return await membershipsService.getSlots(selectedVenueId);
    },
    enabled: !!selectedVenueId,
    staleTime: 60 * 1000,
  });

  return query;
}

export function useMembershipSlotDetail(slotId?: string) {
  const query = useQuery({
    queryKey: ['membership-slot-detail', slotId],
    queryFn: async () => {
      if (!slotId) return null;
      return await membershipsService.getSlotById(slotId);
    },
    enabled: !!slotId,
    staleTime: 60 * 1000,
  });

  return query;
}

export function useMembers(slotId?: string) {
  const { selectedVenueId } = useVenueStore();

  const query = useQuery({
    queryKey: ['members', selectedVenueId, slotId],
    queryFn: async () => {
      if (!selectedVenueId) return [];
      return await membershipsService.getMembers(slotId, selectedVenueId);
    },
    enabled: !!selectedVenueId,
    staleTime: 60 * 1000,
  });

  return query;
}

export function useApplications(status?: ApplicationStatus) {
  const { selectedVenueId } = useVenueStore();

  const query = useQuery({
    queryKey: ['membership-applications', selectedVenueId, status],
    queryFn: async () => {
      if (!selectedVenueId) return [];
      return await membershipsService.getApplications(selectedVenueId, status);
    },
    enabled: !!selectedVenueId,
    staleTime: 60 * 1000,
  });

  return query;
}

export function useGuestPlays(status?: GuestPlayStatus) {
  const { selectedVenueId } = useVenueStore();

  const query = useQuery({
    queryKey: ['guest-plays', selectedVenueId, status],
    queryFn: async () => {
      if (!selectedVenueId) return [];
      return await membershipsService.getGuestPlays(selectedVenueId, status);
    },
    enabled: !!selectedVenueId,
    staleTime: 60 * 1000,
  });

  return query;
}

// ── Mutations ──

export function useCreateSlot() {
  const queryClient = useQueryClient();
  const { selectedVenueId } = useVenueStore();

  const mutation = useMutation({
    mutationFn: async ({
      data,
      initialMembers,
    }: {
      data: Partial<MembershipSlot>;
      initialMembers?: { full_name: string; phone: string; email?: string }[];
    }) => {
      if (!selectedVenueId) throw new Error('No venue selected');
      return await membershipsService.createSlot(selectedVenueId, data, initialMembers);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membership-slots'] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  return mutation;
}

export function useUpdateSlot() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ slotId, data }: { slotId: string; data: Partial<MembershipSlot> }) => {
      return await membershipsService.updateSlot(slotId, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['membership-slots'] });
      queryClient.invalidateQueries({ queryKey: ['membership-slot-detail', variables.slotId] });
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
    },
  });

  return mutation;
}

export function useDeleteSlot() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (slotId: string) => {
      return await membershipsService.deleteSlot(slotId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membership-slots'] });
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
    },
  });

  return mutation;
}

export function useToggleOpenSlot() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ slotId, isRecruiting }: { slotId: string; isRecruiting: boolean }) => {
      return await membershipsService.toggleOpen(slotId, isRecruiting);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['membership-slots'] });
      queryClient.invalidateQueries({ queryKey: ['membership-slot-detail', variables.slotId] });
    },
  });

  return mutation;
}

export function useAddMember() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      slotId,
      customerData,
    }: {
      slotId: string;
      customerData: { full_name: string; phone: string; email?: string };
    }) => {
      return await membershipsService.addMember(slotId, customerData);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['membership-slots'] });
      queryClient.invalidateQueries({ queryKey: ['membership-slot-detail', variables.slotId] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  return mutation;
}

export function useUpdateMember() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      memberId,
      data,
    }: {
      memberId: string;
      data: { is_active?: boolean; full_name?: string; phone?: string };
    }) => {
      return await membershipsService.updateMember(memberId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membership-slots'] });
      queryClient.invalidateQueries({ queryKey: ['membership-slot-detail'] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  return mutation;
}

export function useRemoveMember() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (memberId: string) => {
      return await membershipsService.removeMember(memberId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membership-slots'] });
      queryClient.invalidateQueries({ queryKey: ['membership-slot-detail'] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });

  return mutation;
}

export function useTransferMember() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ memberId, toSlotId }: { memberId: string; toSlotId: string }) => {
      return await membershipsService.transferMember(memberId, toSlotId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membership-slots'] });
      queryClient.invalidateQueries({ queryKey: ['membership-slot-detail'] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });

  return mutation;
}

export function useAcceptApplication() {
  const queryClient = useQueryClient();
  const { ownerProfile } = useAuthContext();

  const mutation = useMutation({
    mutationFn: async (applicationId: string) => {
      return await membershipsService.acceptApplication(applicationId, ownerProfile?.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membership-applications'] });
      queryClient.invalidateQueries({ queryKey: ['membership-slots'] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  return mutation;
}

export function useRejectApplication() {
  const queryClient = useQueryClient();
  const { ownerProfile } = useAuthContext();

  const mutation = useMutation({
    mutationFn: async (applicationId: string) => {
      return await membershipsService.rejectApplication(applicationId, ownerProfile?.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membership-applications'] });
    },
  });

  return mutation;
}

export function useInviteToGuestPlay() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ applicationId, scheduledDate }: { applicationId: string; scheduledDate: string }) => {
      return await membershipsService.inviteToGuestPlay(applicationId, scheduledDate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membership-applications'] });
      queryClient.invalidateQueries({ queryKey: ['guest-plays'] });
    },
  });

  return mutation;
}

export function useUpdateGuestPlayStatus() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ guestPlayId, status }: { guestPlayId: string; status: GuestPlayStatus }) => {
      return await membershipsService.updateGuestPlayStatus(guestPlayId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guest-plays'] });
    },
  });

  return mutation;
}

export function useAcceptGuestAsMember() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (guestPlayId: string) => {
      return await membershipsService.acceptGuestAsMember(guestPlayId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guest-plays'] });
      queryClient.invalidateQueries({ queryKey: ['membership-applications'] });
      queryClient.invalidateQueries({ queryKey: ['membership-slots'] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  return mutation;
}

export function useReleaseSlot() {
  const queryClient = useQueryClient();
  const { ownerProfile } = useAuthContext();

  const mutation = useMutation({
    mutationFn: async ({ slotId, releaseDate }: { slotId: string; releaseDate: string }) => {
      if (!ownerProfile?.id) throw new Error('Owner profile not loaded');
      return await membershipsService.releaseSlot(slotId, releaseDate, ownerProfile.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
    },
  });

  return mutation;
}

export function useUnreleaseSlot() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ slotId, releaseDate }: { slotId: string; releaseDate: string }) => {
      return await membershipsService.unreleaseSlot(slotId, releaseDate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
    },
  });

  return mutation;
}
