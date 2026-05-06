import { Stack } from 'expo-router';

export default function InsightsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="workout" />
      <Stack.Screen name="nutrition" />
      <Stack.Screen name="weight" />
      <Stack.Screen name="habits" />
      <Stack.Screen name="mood" />
      <Stack.Screen name="reminders" />
      <Stack.Screen name="behavioral" />
    </Stack>
  );
}
