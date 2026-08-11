import { View, Text, ScrollView } from 'react-native';
import { AppHeader } from '../../components/layout/AppHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

/**
 * Tournaments Tab — M15 will add: Tournament listings, filter chips, tournament detail.
 */
export default function TournamentsScreen() {
  return (
    <View className="flex-1 bg-background">
      <AppHeader searchPlaceholder="Search tournaments..." />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-2xl font-extrabold text-foreground mb-1">Tournaments</Text>
        <Text className="text-muted-foreground text-sm mb-6">
          Discover, register, and compete in badminton tournaments.
        </Text>

        <Card>
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-base font-bold text-foreground">Upcoming Tournaments</Text>
            <Badge label="M15" variant="accent" />
          </View>
          <View className="h-40 bg-muted rounded-xl items-center justify-center">
            <Text className="text-4xl mb-2">🏆</Text>
            <Text className="text-foreground font-semibold">Coming in Milestone 15</Text>
            <Text className="text-muted-foreground text-sm mt-1 text-center px-4">
              Browse public tournaments, register, and track live scores
            </Text>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}
