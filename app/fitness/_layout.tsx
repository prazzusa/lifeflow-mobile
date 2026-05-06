import { Stack } from 'expo-router';

export default function FitnessLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, presentation: 'modal' }}>
      <Stack.Screen name="log-workout" />
      <Stack.Screen name="log-cardio" />
      <Stack.Screen name="log-strength" />
      <Stack.Screen name="log-food" />
      <Stack.Screen name="log-weight" />
    </Stack>
  );
}
