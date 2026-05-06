import { View, Text, SafeAreaView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function GoalsPeriodScreen() {
  const { period } = useLocalSearchParams<{ period: string }>();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f0f1a', padding: 16 }}>
      <Text style={{ color: '#fff', fontSize: 24, fontWeight: '700' }}>Goals: {period}</Text>
      <Text style={{ color: '#94a3b8', marginTop: 8 }}>GoalsPeriodPage — coming in Block 5</Text>
    </SafeAreaView>
  );
}
