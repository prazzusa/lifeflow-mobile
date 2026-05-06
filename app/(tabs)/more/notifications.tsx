import { View, Text, SafeAreaView } from 'react-native';
export default function NotificationsScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f0f1a', padding: 16 }}>
      <Text style={{ color: '#fff', fontSize: 24, fontWeight: '700' }}>Notifications</Text>
      <Text style={{ color: '#94a3b8', marginTop: 8 }}>NotificationsScreen — coming in Block 5</Text>
    </SafeAreaView>
  );
}
