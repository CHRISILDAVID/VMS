import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Wallet, ArrowDownLeft, ArrowUpRight } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../contexts/AuthContext';
import { usePlayerStore } from '../../stores/playerStore';
import { useUIStore } from '../../stores/uiStore';
import { usePlayerThemeColors } from '../../hooks/usePlayerThemeColors';
import { createPlayersService } from '@vms/shared/services';
import { supabase } from '../../lib/supabase';

const playersService = createPlayersService(supabase);

export function WalletDropdown() {
  const { playerProfile } = useAuthContext();
  const { walletBalance } = usePlayerStore();
  const { isWalletPopoverOpen, setWalletPopoverOpen } = useUIStore();
  const { colors } = usePlayerThemeColors();
  const insets = useSafeAreaInsets();

  const { data: wallet } = useQuery({
    queryKey: ['wallet', playerProfile?.id],
    queryFn: () => playersService.getWallet(playerProfile!.id),
    enabled: !!playerProfile?.id && isWalletPopoverOpen,
  });

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['walletTransactions', wallet?.id],
    queryFn: () => wallet?.id ? playersService.getWalletTransactions(wallet.id, 3) : Promise.resolve([]),
    enabled: !!wallet?.id && isWalletPopoverOpen,
  });

  const formatBalance = (paise: number | null) =>
    paise === null ? '—' : `₹${(paise / 100).toFixed(2)}`;

  if (!isWalletPopoverOpen) return null;

  return (
    <Modal visible={isWalletPopoverOpen} transparent animationType="fade" statusBarTranslucent>
      <TouchableOpacity
        className="flex-1 bg-black/20"
        activeOpacity={1}
        onPress={() => setWalletPopoverOpen(false)}
      >
        <TouchableOpacity 
          activeOpacity={1} 
          className="absolute right-4 w-72 bg-card rounded-2xl shadow-xl overflow-hidden border border-border"
          style={{ top: Math.max(insets.top, 16) + 60 }}
        >
          <View className="p-4 gap-3">
            {/* Balance */}
            <View className="flex-row items-center gap-2">
              <Wallet size={20} color={colors.accent} strokeWidth={2} />
              <View>
                <Text className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                  ShuttleHub Wallet
                </Text>
                <Text className="text-2xl font-black text-foreground">
                  {formatBalance(walletBalance)}
                </Text>
              </View>
            </View>

            {/* Recent transactions */}
            {wallet?.id && (
              <View className="gap-2 mt-2">
                <Text className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                  Recent Transactions
                </Text>
                {isLoading ? (
                  <Text className="text-muted-foreground text-xs">Loading...</Text>
                ) : transactions.length === 0 ? (
                  <Text className="text-muted-foreground text-xs">No transactions yet</Text>
                ) : (
                  transactions.map((tx) => (
                    <View key={tx.id} className="flex-row items-center justify-between py-1">
                      <View className="flex-row items-center gap-2">
                        {tx.type === 'credit' ? (
                          <ArrowDownLeft size={14} color={colors.success} strokeWidth={2.5} />
                        ) : (
                          <ArrowUpRight size={14} color={colors.destructive} strokeWidth={2.5} />
                        )}
                        <Text className="text-xs text-foreground capitalize">{tx.reason}</Text>
                      </View>
                      <Text
                        className={`text-xs font-bold ${
                          tx.type === 'credit' ? 'text-success' : 'text-destructive'
                        }`}
                      >
                        {tx.type === 'credit' ? '+' : ''}₹{Math.abs(tx.amount) / 100}
                      </Text>
                    </View>
                  ))
                )}
              </View>
            )}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
