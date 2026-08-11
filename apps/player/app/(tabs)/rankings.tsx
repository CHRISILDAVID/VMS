import { View, Text, ScrollView } from 'react-native';
import { AppHeader } from '../../components/layout/AppHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { usePlayerStore } from '../../stores/playerStore';

/**
 * Rankings Tab — M13 will add: Player ID registration, My Rank card, Leaderboard.
 *
 * State gates:
 * - No Player ID → prompt to register
 * - Has Player ID → show rank card + leaderboard
 */
export default function RankingsScreen() {
  const { playerProfile } = usePlayerStore();
  const hasPlayerId = !!playerProfile?.player_id;

  return (
    <View className="flex-1 bg-background">
      <AppHeader hideSearch />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-2xl font-extrabold text-foreground mb-1">Rankings</Text>
        <Text className="text-muted-foreground text-sm mb-6">
          {hasPlayerId
            ? `Your Player ID: ${playerProfile?.player_id}`
            : 'Register your Player ID to enter the ranking system'}
        </Text>

        <Card>
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-base font-bold text-foreground">
              {hasPlayerId ? 'My Rank Card' : 'Register Player ID'}
            </Text>
            <Badge label="M13" variant="accent" />
          </View>
          <View className="h-40 bg-muted rounded-xl items-center justify-center">
            <Text className="text-4xl mb-2">🎖️</Text>
            <Text className="text-foreground font-semibold">Coming in Milestone 13</Text>
            <Text className="text-muted-foreground text-sm mt-1 text-center px-4">
              Register your SH Player ID and appear on the national leaderboard
            </Text>
          </View>
        </Card>

        <Card className="mt-3">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-base font-bold text-foreground">Leaderboard</Text>
            <Badge label="Beginner · Intermediate · Open" variant="muted" />
          </View>
          <View className="h-28 bg-muted rounded-xl items-center justify-center">
            <Text className="text-muted-foreground text-sm">National leaderboard coming in M13</Text>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}
