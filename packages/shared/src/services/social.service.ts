import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  PlayerDiscovery,
  HostedMatchDiscovery,
  HostedMatchWithPlayers,
  Challenge,
  ChallengeWithInvitations,
  ChallengeInvitation,
  PlayerNotification,
  CreateChallengePayload,
  HostMatchPayload,
  FindPlayersFilters,
} from '../types';

/**
 * createSocialService
 *
 * All DB calls for Milestone 12 Social Features:
 *  - Find Players (distance-aware)
 *  - Hosted Matches (host, discover, join)
 *  - Challenges (send, respond, cancel)
 *  - Player Notifications (fetch, mark-read)
 *
 * Usage:
 *   const social = createSocialService(supabase);
 *   const players = await social.fetchPlayers({ search: 'Arjun' }, userLat, userLon);
 */
export function createSocialService(supabase: SupabaseClient) {

  // ──────────────────────────────────────────────────────────────────────────
  // PLAYERS
  // ──────────────────────────────────────────────────────────────────────────

  /** Discover players sorted by distance. Uses the get_players_with_distance RPC. */
  async function fetchPlayers(
    filters: FindPlayersFilters,
    userLat?: number | null,
    userLon?: number | null,
  ): Promise<PlayerDiscovery[]> {
    const { data, error } = await supabase.rpc('get_players_with_distance', {
      user_lat:      userLat ?? null,
      user_lon:      userLon ?? null,
      search_text:   filters.search ?? null,
      skill_filter:  filters.skill ?? null,
      gender_filter: filters.gender ?? null,
      radius_km:     filters.radiusKm ?? 50.0,
    });
    if (error) throw error;
    return (data ?? []) as PlayerDiscovery[];
  }

  /** Fetch a single player's public profile by their UUID. */
  async function fetchPublicPlayerProfile(playerId: string): Promise<PlayerDiscovery> {
    const { data, error } = await supabase
      .from('players')
      .select('id, full_name, avatar_url, city, player_id, player_id_verified, gender, latitude, longitude, location_updated_at')
      .eq('id', playerId)
      .single();
    if (error) throw error;
    return { ...(data as any), distance_km: null } as PlayerDiscovery;
  }

  /** Update the logged-in player's GPS coordinates. */
  async function updatePlayerLocation(
    playerId: string,
    latitude: number,
    longitude: number,
  ): Promise<void> {
    const { error } = await supabase
      .from('players')
      .update({ latitude, longitude, location_updated_at: new Date().toISOString() })
      .eq('id', playerId);
    if (error) throw error;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // CHALLENGES
  // ──────────────────────────────────────────────────────────────────────────

  /** Send a challenge from the current player to one or more others. */
  async function sendChallenge(payload: CreateChallengePayload): Promise<Challenge> {
    const { data: me } = await supabase.auth.getUser();
    if (!me?.user) throw new Error('Not authenticated');

    // Compute expires_at from booking end time
    const { data: booking, error: bErr } = await supabase
      .from('bookings')
      .select('date, end_time')
      .eq('id', payload.booking_id)
      .single();
    if (bErr) throw bErr;

    const expiresAt = `${booking.date}T${booking.end_time}`;

    // Insert challenge
    const { data: challenge, error: cErr } = await supabase
      .from('challenges')
      .insert({
        host_player_id: me.user.id,
        booking_id:    payload.booking_id,
        match_format:  payload.match_format,
        description:   payload.description ?? null,
        expires_at:    expiresAt,
      })
      .select()
      .single();
    if (cErr) throw cErr;

    // Insert invitations
    const invitations = payload.invited_player_ids.map((pid) => ({
      challenge_id:      challenge.id,
      invited_player_id: pid,
    }));
    const { error: iErr } = await supabase
      .from('challenge_invitations')
      .insert(invitations);
    if (iErr) throw iErr;

    // Write notifications for each invited player
    const { data: hostRow } = await supabase
      .from('players')
      .select('full_name')
      .eq('id', me?.user?.id ?? '')
      .single();
    const hostName = (hostRow as any)?.full_name ?? 'Someone';

    const { data: bData } = await supabase
      .from('bookings')
      .select('courts(name, venues(name))')
      .eq('id', payload.booking_id)
      .single();
    const venueName = (bData as any)?.courts?.venues?.name ?? 'the court';

    const notifs = payload.invited_player_ids.map((pid) => ({
      player_id: pid,
      type:      'challenge_received',
      title:     'You have a new challenge!',
      body:      `${hostName} challenged you to a ${payload.match_format} match at ${venueName}.`,
      data:      { challenge_id: challenge.id },
    }));
    await supabase.from('player_notifications').insert(notifs);

    return challenge as Challenge;
  }

  /** Accept or decline a challenge invitation. */
  async function respondToChallenge(
    invitationId: string,
    response: 'accepted' | 'declined',
  ): Promise<void> {
    const { data: inv, error: invErr } = await supabase
      .from('challenge_invitations')
      .update({ status: response, responded_at: new Date().toISOString() })
      .eq('id', invitationId)
      .select('challenge_id, invited_player_id')
      .single();
    if (invErr) throw invErr;

    // Notify the challenge host
    const { data: challenge } = await supabase
      .from('challenges')
      .select('host_player_id, bookings(courts(venues(name)))')
      .eq('id', (inv as any).challenge_id)
      .single();

    if (challenge) {
      const { data: responder } = await supabase
        .from('players')
        .select('full_name')
        .eq('id', (inv as any).invited_player_id)
        .single();
      const responderName = (responder as any)?.full_name ?? 'Someone';

      const notifType = response === 'accepted' ? 'challenge_accepted' : 'challenge_declined';
      const notifTitle = response === 'accepted' ? 'Challenge Accepted!' : 'Challenge Declined';
      const notifBody = response === 'accepted'
        ? `${responderName} accepted your challenge.`
        : `${responderName} declined your challenge.`;

      await supabase.from('player_notifications').insert({
        player_id: (challenge as any).host_player_id,
        type:      notifType,
        title:     notifTitle,
        body:      notifBody,
        data:      { challenge_id: (inv as any).challenge_id },
      });
    }
  }

  /** Get challenges where the current player is invited. */
  async function fetchMyChallengesReceived(): Promise<ChallengeInvitation[]> {
    const { data, error } = await supabase
      .from('challenge_invitations')
      .select(`
        *,
        challenge:challenges(
          *,
          bookings(booking_date, start_time, end_time, courts(name, venues(name)))
        ),
        invited_player:players(id, full_name, avatar_url, city, player_id, player_id_verified, gender, latitude, longitude, location_updated_at)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as ChallengeInvitation[];
  }

  /** Get challenges the current player sent. */
  async function fetchMyChallengesSent(): Promise<ChallengeWithInvitations[]> {
    const { data, error } = await supabase
      .from('challenges')
      .select(`
        *,
        bookings(booking_date, start_time, end_time, courts(name, venues(name))),
        invitations:challenge_invitations(
          *,
          invited_player:players(id, full_name, avatar_url, city, player_id, player_id_verified, gender, latitude, longitude, location_updated_at)
        )
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as ChallengeWithInvitations[];
  }

  /** Get full details of a specific challenge. */
  async function fetchChallengeDetails(challengeId: string): Promise<ChallengeWithInvitations> {
    const { data, error } = await supabase
      .from('challenges')
      .select(`
        *,
        bookings(booking_date, start_time, end_time, courts(name, venues(name))),
        invitations:challenge_invitations(
          *,
          invited_player:players(id, full_name, avatar_url, city, player_id, player_id_verified, gender, latitude, longitude, location_updated_at)
        )
      `)
      .eq('id', challengeId)
      .single();
    if (error) throw error;
    return data as ChallengeWithInvitations;
  }

  /** Cancel a challenge (host only). */
  async function cancelChallenge(challengeId: string): Promise<void> {
    const { error } = await supabase
      .from('challenges')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', challengeId);
    if (error) throw error;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // HOSTED MATCHES
  // ──────────────────────────────────────────────────────────────────────────

  /** Discover open matches sorted by distance. Uses the get_open_matches_with_distance RPC. */
  async function fetchOpenMatches(
    userLat?: number | null,
    userLon?: number | null,
    formatFilter?: string | null,
  ): Promise<HostedMatchDiscovery[]> {
    const { data, error } = await supabase.rpc('get_open_matches_with_distance', {
      user_lat:      userLat ?? null,
      user_lon:      userLon ?? null,
      format_filter: formatFilter ?? null,
    });
    if (error) throw error;
    return (data ?? []) as HostedMatchDiscovery[];
  }

  /** Get the current player's hosted matches. */
  async function fetchMyHostedMatches(): Promise<HostedMatchDiscovery[]> {
    const { data, error } = await supabase
      .from('hosted_matches')
      .select(`
        *,
        bookings(booking_date, start_time, end_time, courts(name, venues(name, city))),
        joined_count:hosted_match_players(count)
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    // Flatten the response to match HostedMatchDiscovery shape
    return (data ?? []).map((hm: any) => ({
      ...hm,
      joined_count:  hm.joined_count?.[0]?.count ?? 0,
      venue_name:    hm.bookings?.courts?.venues?.name ?? null,
      venue_city:    hm.bookings?.courts?.venues?.city ?? null,
      booking_date:  hm.bookings?.booking_date ?? null,
      booking_start: hm.bookings?.start_time ?? null,
      booking_end:   hm.bookings?.end_time ?? null,
      distance_km:   null,
    })) as HostedMatchDiscovery[];
  }

  /** Get full hosted match details including joined player list. */
  async function fetchHostedMatchDetail(matchId: string): Promise<HostedMatchWithPlayers> {
    const { data, error } = await supabase
      .from('hosted_matches')
      .select(`
        *,
        bookings(booking_date, start_time, end_time, courts(name, venues(name, city))),
        joined_players:hosted_match_players(
          id,
          player_id,
          joined_at,
          player:players(id, full_name, avatar_url, city, player_id, player_id_verified, gender, latitude, longitude, location_updated_at)
        )
      `)
      .eq('id', matchId)
      .single();
    if (error) throw error;
    const hm = data as any;
    return {
      ...hm,
      venue_name:    hm.bookings?.courts?.venues?.name ?? null,
      venue_city:    hm.bookings?.courts?.venues?.city ?? null,
      booking_date:  hm.bookings?.booking_date ?? null,
      booking_start: hm.bookings?.start_time ?? null,
      booking_end:   hm.bookings?.end_time ?? null,
    } as HostedMatchWithPlayers;
  }

  /** Host a new match using a confirmed booking. */
  async function hostMatch(payload: HostMatchPayload): Promise<string> {
    // Derive city from booking → court → venue if not provided
    let city = payload.city;
    if (!city) {
      const { data: bData } = await supabase
        .from('bookings')
        .select('courts(venues(city))')
        .eq('id', payload.booking_id)
        .single();
      city = (bData as any)?.courts?.venues?.city ?? null;
    }

    const { data, error } = await supabase
      .from('hosted_matches')
      .insert({
        booking_id:   payload.booking_id,
        match_format: payload.match_format,
        skill_level:  payload.skill_level,
        max_players:  payload.max_players,
        visibility:   payload.visibility,
        city,
      })
      .select('id')
      .single();
    if (error) throw error;
    return (data as any).id as string;
  }

  /** Join an open hosted match. */
  async function joinMatch(matchId: string): Promise<void> {
    const { data: me } = await supabase.auth.getUser();
    const playerId = me?.user?.id;
    if (!playerId) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('hosted_match_players')
      .insert({ hosted_match_id: matchId, player_id: playerId });
    if (error) throw error;

    // Check if match is now full
    const { data: match } = await supabase
      .from('hosted_matches')
      .select('max_players, host_player_id')
      .eq('id', matchId)
      .single();

    const { count } = await supabase
      .from('hosted_match_players')
      .select('id', { count: 'exact', head: true })
      .eq('hosted_match_id', matchId);

    if (match && count !== null && count >= (match as any).max_players) {
      await supabase
        .from('hosted_matches')
        .update({ status: 'full', updated_at: new Date().toISOString() })
        .eq('id', matchId);
    }

    // Notify the host
    const { data: joiner } = await supabase
      .from('players')
      .select('full_name')
      .eq('id', playerId)
      .single();

    if (match) {
      await supabase.from('player_notifications').insert({
        player_id: (match as any).host_player_id,
        type:      'match_joined',
        title:     'Someone joined your match!',
        body:      `${(joiner as any)?.full_name ?? 'A player'} joined your hosted match.`,
        data:      { hosted_match_id: matchId },
      });
    }
  }

  /** Cancel a hosted match (host only). */
  async function cancelHostedMatch(matchId: string): Promise<void> {
    const { error } = await supabase
      .from('hosted_matches')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', matchId);
    if (error) throw error;
    // Joined players notified by DB trigger (on_booking_cancelled handles this for booking cancels;
    // for direct host cancel we write notifications here)
    const { data: joinedPlayers } = await supabase
      .from('hosted_match_players')
      .select('player_id')
      .eq('hosted_match_id', matchId);

    if (joinedPlayers && joinedPlayers.length > 0) {
      const { data: hostRow } = await supabase.auth.getUser();
      const { data: hostProfile } = await supabase
        .from('players')
        .select('full_name')
        .eq('id', hostRow?.user?.id ?? '')
        .single();

      const notifs = joinedPlayers.map((jp: any) => ({
        player_id: jp.player_id,
        type:      'match_cancelled',
        title:     'Match Cancelled',
        body:      `${(hostProfile as any)?.full_name ?? 'The host'} cancelled the match.`,
        data:      { hosted_match_id: matchId },
      }));
      await supabase.from('player_notifications').insert(notifs);
    }
  }

  /** Close registration for a hosted match (status → 'full'). */
  async function closeMatchRegistration(matchId: string): Promise<void> {
    const { error } = await supabase
      .from('hosted_matches')
      .update({ status: 'full', updated_at: new Date().toISOString() })
      .eq('id', matchId);
    if (error) throw error;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // NOTIFICATIONS
  // ──────────────────────────────────────────────────────────────────────────

  /** Fetch all notifications for the current player. */
  async function fetchNotifications(): Promise<PlayerNotification[]> {
    const { data, error } = await supabase
      .from('player_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    return (data ?? []) as PlayerNotification[];
  }

  /** Count unread notifications for the current player. */
  async function fetchUnreadCount(): Promise<number> {
    const { count, error } = await supabase
      .from('player_notifications')
      .select('id', { count: 'exact', head: true })
      .eq('is_read', false);
    if (error) throw error;
    return count ?? 0;
  }

  /** Mark specific notification IDs as read. */
  async function markNotificationsRead(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    const { error } = await supabase
      .from('player_notifications')
      .update({ is_read: true })
      .in('id', ids);
    if (error) throw error;
  }

  /** Mark all unread notifications as read. */
  async function markAllNotificationsRead(): Promise<void> {
    const { error } = await supabase
      .from('player_notifications')
      .update({ is_read: true })
      .eq('is_read', false);
    if (error) throw error;
  }

  return {
    // Players
    fetchPlayers,
    fetchPublicPlayerProfile,
    updatePlayerLocation,
    // Challenges
    sendChallenge,
    respondToChallenge,
    fetchMyChallengesReceived,
    fetchMyChallengesSent,
    fetchChallengeDetails,
    cancelChallenge,
    // Hosted Matches
    fetchOpenMatches,
    fetchMyHostedMatches,
    fetchHostedMatchDetail,
    hostMatch,
    joinMatch,
    cancelHostedMatch,
    closeMatchRegistration,
    // Notifications
    fetchNotifications,
    fetchUnreadCount,
    markNotificationsRead,
    markAllNotificationsRead,
  };
}

export type SocialService = ReturnType<typeof createSocialService>;
