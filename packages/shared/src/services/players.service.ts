import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  Player,
  CreatePlayerInput,
  UpdatePlayerInput,
  PlayerWallet,
  PlayerTransaction,
} from '../types';

/**
 * Players service factory — used by the Player App.
 * Wraps all database interactions for the `players`, `player_wallets`,
 * and `player_transactions` tables.
 */
export function createPlayersService(supabase: SupabaseClient) {
  /**
   * Fetch a player profile by Supabase auth user ID.
   * Returns null if no profile exists (first-time login).
   */
  async function getPlayer(userId: string): Promise<Player | null> {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('id', userId)
      .is('deleted_at', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as Player;
  }

  /**
   * Create a new player profile on first login.
   * Also:
   *  1. Creates a player_wallets row (balance = 0)
   *  2. Soft-links a customer by phone if one exists
   */
  async function createPlayer(userId: string, input: CreatePlayerInput): Promise<Player> {
    // Soft-link to existing customer by phone (read-only historical link)
    let linkedCustomerId: string | null = null;
    try {
      const { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('phone', input.phone)
        .limit(1)
        .single();
      linkedCustomerId = customer?.id ?? null;
    } catch {
      // No matching customer — that's fine, link stays null
    }

    const { data: player, error: playerError } = await supabase
      .from('players')
      .insert({
        id: userId,
        full_name: input.full_name,
        phone: input.phone,
        city: input.city,
        email: input.email ?? null,
        date_of_birth: input.date_of_birth ?? null,
        linked_customer_id: linkedCustomerId,
        theme_preference: 'system',
      })
      .select()
      .single();

    if (playerError) throw playerError;

    // Create the player's wallet (balance starts at 0)
    const { error: walletError } = await supabase
      .from('player_wallets')
      .insert({ player_id: userId, balance: 0 });

    if (walletError) {
      console.warn('Failed to create player wallet:', walletError);
    }

    return player as Player;
  }

  /**
   * Update player profile fields.
   */
  async function updatePlayer(userId: string, input: UpdatePlayerInput): Promise<Player> {
    const { data, error } = await supabase
      .from('players')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as Player;
  }

  /**
   * Fetch the player's wallet balance only.
   * Returns null if wallet not yet created.
   */
  async function getWalletBalance(playerId: string): Promise<number | null> {
    const { data, error } = await supabase
      .from('player_wallets')
      .select('balance')
      .eq('player_id', playerId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return (data as PlayerWallet).balance;
  }

  /**
   * Fetch the full player wallet row (id + balance + timestamps).
   */
  async function getWallet(playerId: string): Promise<PlayerWallet | null> {
    const { data, error } = await supabase
      .from('player_wallets')
      .select('*')
      .eq('player_id', playerId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as PlayerWallet;
  }

  /**
   * Fetch the player's transaction history, newest first.
   */
  async function getWalletTransactions(
    walletId: string,
    limit = 20
  ): Promise<PlayerTransaction[]> {
    const { data, error } = await supabase
      .from('player_transactions')
      .select('*')
      .eq('wallet_id', walletId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data ?? []) as PlayerTransaction[];
  }

  /**
   * Admin: credit a player's wallet.
   * Updates wallet balance and inserts a player_transactions credit record.
   * `creditedBy` must be a super_admin user ID.
   */
  async function adminCreditWallet(params: {
    playerId: string;
    walletId: string;
    amountPaise: number;
    reason: string;
    creditedBy: string;
  }): Promise<void> {
    const { playerId, walletId, amountPaise, reason, creditedBy } = params;

    // 1. Fetch current balance and increment
    const { data: current, error: fetchErr } = await supabase
      .from('player_wallets')
      .select('balance')
      .eq('player_id', playerId)
      .single();
    if (fetchErr) throw fetchErr;

    const newBalance = ((current as any)?.balance ?? 0) + amountPaise;
    const { error: updateError } = await supabase
      .from('player_wallets')
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq('player_id', playerId);
    if (updateError) throw updateError;

    // 2. Insert transaction record
    const { error: txError } = await supabase.from('player_transactions').insert({
      wallet_id: walletId,
      amount: amountPaise,
      type: 'credit',
      reason,
      credited_by: creditedBy,
    });
    if (txError) throw txError;
  }

  /**
   * Search players by name or phone (admin wallet management).
   */
  async function searchPlayers(query: string): Promise<Player[]> {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .is('deleted_at', null)
      .or(`full_name.ilike.%${query}%,phone.ilike.%${query}%`)
      .limit(10);

    if (error) throw error;
    return (data ?? []) as Player[];
  }

  return {
    getPlayer,
    createPlayer,
    updatePlayer,
    getWalletBalance,
    getWallet,
    getWalletTransactions,
    adminCreditWallet,
    searchPlayers,
  };
}
