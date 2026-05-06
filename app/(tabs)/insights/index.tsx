import { View, Text, SafeAreaView, ScrollView } from 'react-native';

export default function InsightsScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f0f1a' }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ color: '#fff', fontSize: 28, fontWeight: '700', marginBottom: 8 }}>Insights</Text>
        <Text style={{ color: '#94a3b8' }}>InsightsPage — coming in Block 5</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
