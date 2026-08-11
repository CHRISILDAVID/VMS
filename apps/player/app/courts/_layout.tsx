import { Stack } from 'expo-router';

export default function CourtsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="[venueId]/index" />
      <Stack.Screen name="[venueId]/book" />
      <Stack.Screen name="[venueId]/summary" />
      <Stack.Screen name="[venueId]/confirmation" />
    </Stack>
  );
}
