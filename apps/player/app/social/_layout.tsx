import { Stack } from 'expo-router';

export default function SocialLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="player/[playerId]" />
      <Stack.Screen name="match/[matchId]" />
    </Stack>
  );
}
