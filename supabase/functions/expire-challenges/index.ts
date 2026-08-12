/**
 * expire-challenges — Supabase Edge Function
 *
 * Scheduled to run every 5 minutes via Supabase Dashboard → Edge Functions → Schedules.
 * Sets challenges.status = 'expired' where expires_at < NOW() AND status = 'open',
 * then inserts player_notifications for all pending invitations of expired challenges.
 *
 * Deploy: supabase functions deploy expire-challenges
 */
import { createClient } from 'jsr:@supabase/supabase-js@2';

Deno.serve(async (_req: Request) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // 1. Find all open challenges that have passed their expiry time
    const { data: expiredChallenges, error: fetchError } = await supabase
      .from('challenges')
      .select(`
        id,
        host_player_id,
        booking_id,
        expires_at,
        challenge_invitations ( invited_player_id, status ),
        bookings ( court_id, courts ( venue_id, venues ( name ) ) )
      `)
      .eq('status', 'open')
      .lt('expires_at', new Date().toISOString());

    if (fetchError) throw fetchError;
    if (!expiredChallenges || expiredChallenges.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No challenges to expire', expired: 0 }),
        { headers: { 'Content-Type': 'application/json' } },
      );
    }

    const challengeIds = expiredChallenges.map((c: any) => c.id);

    // 2. Bulk update challenge status to 'expired'
    const { error: updateError } = await supabase
      .from('challenges')
      .update({ status: 'expired', updated_at: new Date().toISOString() })
      .in('id', challengeIds);

    if (updateError) throw updateError;

    // 3. Get host names for notification bodies
    const hostIds = [...new Set(expiredChallenges.map((c: any) => c.host_player_id))];
    const { data: hosts } = await supabase
      .from('players')
      .select('id, full_name')
      .in('id', hostIds);

    const hostMap: Record<string, string> = {};
    (hosts ?? []).forEach((h: any) => { hostMap[h.id] = h.full_name; });

    // 4. Build notification rows for all pending-invitation players
    const notifications: Array<{
      player_id: string;
      type: string;
      title: string;
      body: string;
      data: object;
    }> = [];

    for (const challenge of expiredChallenges) {
      const venueName =
        (challenge as any).bookings?.courts?.venues?.name ?? 'the court';
      const hostName = hostMap[(challenge as any).host_player_id] ?? 'Host';

      for (const inv of (challenge as any).challenge_invitations ?? []) {
        if (inv.status === 'pending') {
          notifications.push({
            player_id: inv.invited_player_id,
            type: 'challenge_cancelled',
            title: 'Challenge Expired',
            body: `${hostName}'s challenge at ${venueName} has expired.`,
            data: { challenge_id: challenge.id },
          });
        }
      }
    }

    if (notifications.length > 0) {
      const { error: notifError } = await supabase
        .from('player_notifications')
        .insert(notifications);
      if (notifError) console.error('Notification insert error:', notifError);
    }

    return new Response(
      JSON.stringify({
        message: 'Challenges expired successfully',
        expired: challengeIds.length,
        notifications_sent: notifications.length,
      }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('expire-challenges error:', err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
