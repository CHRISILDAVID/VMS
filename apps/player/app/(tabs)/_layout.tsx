import { Tabs } from 'expo-router';
import { Home, Gamepad2, Trophy, BarChart3, ShoppingBag } from 'lucide-react-native';
import { usePlayerThemeColors } from '../../hooks/usePlayerThemeColors';

/**
 * 5-tab bottom navigation for ShuttleHub.
 * Tab bar uses PLAYER_COLORS resolved via usePlayerThemeColors().
 * Active tab: Lime (#A7FF3F) in dark, Navy (#0B1F3A) in light.
 */
export default function TabLayout() {
  const { colors } = usePlayerThemeColors();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarStyle: {
          height: 72,
          paddingBottom: 12,
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: colors.tabBarBackground,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Home size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="play"
        options={{
          title: 'Play',
          tabBarIcon: ({ color, size }) => (
            <Gamepad2 size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="tournaments"
        options={{
          title: 'Tournaments',
          tabBarIcon: ({ color, size }) => (
            <Trophy size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="rankings"
        options={{
          title: 'Rankings',
          tabBarIcon: ({ color, size }) => (
            <BarChart3 size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Shop',
          tabBarIcon: ({ color, size }) => (
            <ShoppingBag size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
    </Tabs>
  );
}
