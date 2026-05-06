import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Sparkles, ArrowRight } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { colors, spacing, typography, radii } from '@/lib/theme';

const FEATURES = [
  { emoji: '🎯', label: 'Track goals & habits' },
  { emoji: '💪', label: 'Log workouts & nutrition' },
  { emoji: '📔', label: 'Daily journal & reflections' },
  { emoji: '✨', label: 'AI-powered insights' },
];

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.logoWrap}>
            <View style={styles.logoIcon}>
              <Sparkles size={32} color="#fff" />
            </View>
            <View style={styles.glow} />
          </View>
          <Text style={styles.appName}>GOALS360</Text>
          <Text style={styles.tagline}>Balance Your Life</Text>
          <Text style={styles.description}>
            The all-in-one wellness companion for goals, fitness, nutrition, and mindfulness.
          </Text>
        </View>

        {/* Feature pills */}
        <View style={styles.features}>
          {FEATURES.map((f) => (
            <View key={f.label} style={styles.featurePill}>
              <Text style={styles.featureEmoji}>{f.emoji}</Text>
              <Text style={styles.featureLabel}>{f.label}</Text>
            </View>
          ))}
        </View>

        {/* CTAs */}
        <View style={styles.ctas}>
          <Button
            variant="default"
            size="lg"
            onPress={() => router.push('/auth')}
            style={styles.primaryBtn}
          >
            Get Started
          </Button>
          <TouchableOpacity
            style={styles.signInBtn}
            onPress={() => router.push('/auth')}
            activeOpacity={0.7}
          >
            <Text style={styles.signInText}>Already have an account? </Text>
            <Text style={styles.signInLink}>Sign In</Text>
            <ArrowRight size={14} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.legal}>
          By continuing you agree to our Terms of Service and Privacy Policy.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    justifyContent: 'space-between',
  },
  hero: {
    alignItems: 'center',
    paddingTop: spacing['3xl'],
    gap: spacing.sm,
  },
  logoWrap: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: radii.xl,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  glow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary,
    opacity: 0.12,
    top: -20,
    left: -20,
  },
  appName: {
    fontSize: typography['4xl'],
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 2,
  },
  tagline: {
    fontSize: typography.lg,
    color: colors.primary,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: typography.base,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.base,
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
  },
  featureEmoji: {
    fontSize: 15,
  },
  featureLabel: {
    fontSize: typography.sm,
    color: colors.textMuted,
    fontWeight: '500',
  },
  ctas: {
    gap: spacing.md,
    alignItems: 'center',
  },
  primaryBtn: {
    width: '100%',
    borderRadius: radii.full,
  },
  signInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  signInText: {
    fontSize: typography.sm,
    color: colors.textMuted,
  },
  signInLink: {
    fontSize: typography.sm,
    fontWeight: '600',
    color: colors.primary,
  },
  legal: {
    fontSize: typography.xs,
    color: colors.textSubtle,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: spacing.sm,
  },
});
