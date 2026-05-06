import { Stack } from 'expo-router';

export default function JournalLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="goals" />
      <Stack.Screen name="goals/[period]" />
      <Stack.Screen name="reflect" />
      <Stack.Screen name="reflect/[period]" />
      <Stack.Screen name="morning-mindset" />
      <Stack.Screen name="insights" />
    </Stack>
  );
}
