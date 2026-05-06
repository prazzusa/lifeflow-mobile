import { View, Text, SafeAreaView, ScrollView } from 'react-native';
export default function TermsOfServiceScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f0f1a' }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '700' }}>Terms of Service</Text>
        <Text style={{ color: '#94a3b8', marginTop: 8 }}>TermsOfServicePage — coming in Block 5</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
