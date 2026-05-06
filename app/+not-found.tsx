import { View, Text, SafeAreaView } from 'react-native';
import { Link } from 'expo-router';

export default function NotFoundScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f0f1a', padding: 16, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#fff', fontSize: 24, fontWeight: '700', marginBottom: 8 }}>404 — Not Found</Text>
      <Link href="/" style={{ color: '#6366f1', fontSize: 16 }}>Go home</Link>
    </SafeAreaView>
  );
}
