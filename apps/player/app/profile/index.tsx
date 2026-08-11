import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LogOut, ChevronRight, UserCircle, Trophy, Gamepad2, BarChart2, ShoppingBag, Shield, Settings } from 'lucide-react-native';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { usePlayerStore } from '../../stores/playerStore';
import { usePlayerThemeStore, type ThemePreference } from '../../stores/themeStore';
import { supabase } from '../../lib/supabase';
import { usePlayerThemeColors } from '../../hooks/usePlayerThemeColors';

const THEME_OPTIONS: { label: string; value: ThemePreference }[] = [
  { label: '☀️ Light', value: 'light' },
  { label: '🌙 Dark', value: 'dark' },
  { label: '⚙️ System', value: 'system' },
];

const menuItems = [
  { icon: Shield, label: 'Player Identity', sub: 'SH Player ID & verification', milestone: 'M13' },
  { icon: Trophy, label: 'Tournament History', sub: 'Past tournaments & results', milestone: 'M13' },
  { icon: Gamepad2, label: 'Play Activity', sub: 'Bookings, matches hosted & joined', milestone: 'M13' },
  { icon: BarChart2, label: 'Performance Report', sub: 'Stats, achievements & insights', milestone: 'M13' },
  { icon: ShoppingBag, label: 'Shop Orders', sub: 'Order history & invoices', milestone: 'M14' },
];

/**
 * Profile screen — accessible via the avatar icon in AppHeader.
 * Full implementation (Player Identity, Tournament History, etc.) in M13.
 */
export default function ProfileScreen() {
  const router = useRouter();
  const { playerProfile, clearPlayer } = usePlayerStore();
  const { theme, setTheme } = usePlayerThemeStore();
  const { colors } = usePlayerThemeColors();

  const initials = playerProfile?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? '?';

  const handleLogout = async () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of ShuttleHub?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            clearPlayer();
            await supabase.auth.signOut();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header row */}
        <View className="flex-row items-center px-4 pt-4 pb-2">
          <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
            <ChevronRight size={22} color={colors.foreground} style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-foreground">Profile</Text>
        </View>

        {/* Avatar + Name */}
        <View className="items-center py-6 px-4">
          <View className="w-20 h-20 rounded-full bg-accent items-center justify-center mb-3">
            <Text className="text-accent-foreground text-2xl font-black">{initials}</Text>
          </View>
          <Text className="text-xl font-extrabold text-foreground">{playerProfile?.full_name ?? '—'}</Text>
          <Text className="text-muted-foreground text-sm mt-0.5">{playerProfile?.city ?? ''}</Text>
          {playerProfile?.player_id ? (
            <Badge label={playerProfile.player_id} variant="accent" className="mt-2" />
          ) : (
            <Badge label="No Player ID" variant="muted" className="mt-2" />
          )}
        </View>

        {/* Menu Items */}
        <View className="px-4 gap-2">
          {menuItems.map((item) => (
            <Card key={item.label} className="flex-row items-center gap-3" noPadding>
              <TouchableOpacity
                className="flex-row items-center gap-3 flex-1 p-4"
                onPress={() => {
                  // Navigation added in M13
                }}
                activeOpacity={0.7}
              >
                <View className="w-10 h-10 rounded-xl bg-muted items-center justify-center">
                  <item.icon size={18} color={colors.primary} strokeWidth={2} />
                </View>
                <View className="flex-1">
                  <Text className="text-foreground font-semibold text-sm">{item.label}</Text>
                  <Text className="text-muted-foreground text-xs mt-0.5">{item.sub}</Text>
                </View>
                <Badge label={item.milestone} variant="muted" />
                <ChevronRight size={16} color={colors.mutedForeground} />
              </TouchableOpacity>
            </Card>
          ))}
        </View>

        {/* Theme Toggle */}
        <View className="px-4 mt-4">
          <Card>
            <View className="flex-row items-center gap-2 mb-3">
              <Settings size={16} color={colors.foreground} strokeWidth={2} />
              <Text className="text-foreground font-bold text-sm">Theme</Text>
            </View>
            <View className="flex-row gap-2">
              {THEME_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  className={`
                    flex-1 h-10 rounded-lg items-center justify-center border
                    ${theme === opt.value ? 'bg-accent border-accent' : 'bg-muted border-transparent'}
                  `}
                  onPress={() => setTheme(opt.value)}
                >
                  <Text
                    className={`text-xs font-semibold ${theme === opt.value ? 'text-accent-foreground' : 'text-muted-foreground'}`}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        </View>

        {/* Logout */}
        <View className="px-4 mt-4">
          <TouchableOpacity
            className="flex-row items-center gap-3 h-14 bg-destructive/10 rounded-2xl px-4"
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <LogOut size={18} color={colors.destructive} strokeWidth={2} />
            <Text className="text-destructive font-semibold text-sm">Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
