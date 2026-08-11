import { Stack } from 'expo-router';

export default function CoachesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[coachId]" />
    </Stack>
  );
}
