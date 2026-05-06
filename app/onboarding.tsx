import { View, Text, SafeAreaView } from 'react-native';
export default function OnboardingScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f0f1a', padding: 16 }}>
      <Text style={{ color: '#fff', fontSize: 28, fontWeight: '700' }}>Let's get started</Text>
      <Text style={{ color: '#94a3b8', marginTop: 8 }}>OnboardingPage — coming in Block 5</Text>
    </SafeAreaView>
  );
}
