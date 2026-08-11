import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { AppHeader } from '../../components/layout/AppHeader';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { CourtListScreen } from '../../features/courts/CourtListScreen';
import { CoachListScreen } from '../../features/coaches/CoachListScreen';

export default function PlayScreen() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleTabChange = (index: number) => {
    if (index >= 2) {
      Alert.alert('Coming in M12', 'This feature will be available in the next milestone!');
      return;
    }
    setSelectedIndex(index);
  };

  return (
    <View className="flex-1 bg-background">
      <AppHeader searchPlaceholder="Search courts, coaches..." />
      <View className="px-4 py-3">
        <SegmentedControl
          segments={['Courts', 'Train', 'Matches', 'Players']}
          selectedIndex={selectedIndex}
          onChange={handleTabChange}
          variant="pill"
        />
      </View>
      <View className="flex-1">
        {selectedIndex === 0 && <CourtListScreen />}
        {selectedIndex === 1 && <CoachListScreen />}
      </View>
    </View>
  );
}
