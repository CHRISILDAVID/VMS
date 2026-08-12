import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { AppHeader } from '../../components/layout/AppHeader';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { CourtListScreen } from '../../features/courts/CourtListScreen';
import { CoachListScreen } from '../../features/coaches/CoachListScreen';
import { FindPlayersScreen } from '../../features/social/FindPlayersScreen';
import { HostJoinMatchScreen } from '../../features/social/HostJoinMatchScreen';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function PlayScreen() {
  const { tab } = useLocalSearchParams<{ tab: string }>();
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (tab === 'courts') setSelectedIndex(0);
    else if (tab === 'players') setSelectedIndex(1);
    else if (tab === 'matches') setSelectedIndex(2);
    else if (tab === 'train') setSelectedIndex(3);
    
    // Clear param so it doesn't get stuck
    if (tab) {
      router.setParams({ tab: '' });
    }
  }, [tab]);

  return (
    <View className="flex-1 bg-background">
      <AppHeader searchPlaceholder="Search courts, players..." />
      <View className="px-4 py-3">
        <SegmentedControl
          segments={['Courts', 'Players', 'Matches', 'Train']}
          selectedIndex={selectedIndex}
          onChange={setSelectedIndex}
          variant="pill"
        />
      </View>
      <View className="flex-1">
        {selectedIndex === 0 && <CourtListScreen />}
        {selectedIndex === 1 && <FindPlayersScreen />}
        {selectedIndex === 2 && <HostJoinMatchScreen />}
        {selectedIndex === 3 && <CoachListScreen />}
      </View>
    </View>
  );
}
