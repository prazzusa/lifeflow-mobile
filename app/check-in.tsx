import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Check } from 'lucide-react-native';
import { supabase } from '@/supabase/client';
import { colors, radii, spacing, typography } from '@/lib/theme';

// ─── Data ─────────────────────────────────────────────────────────────────────

const moods = [
  { id: 'drained', label: 'Drained', emoji: '😔', color: '#6A6D9E' },
  { id: 'tired',   label: 'Tired',   emoji: '😴', color: '#5C7CFA' },
  { id: 'okay',    label: 'Okay',    emoji: '😊', color: '#4CAF8C' },
  { id: 'good',    label: 'Good',    emoji: '😄', color: '#F2C94C' },
  { id: 'great',   label: 'Great',   emoji: '🌟', color: '#F2994A' },
];

const energyChips: Record<string, string[]> = {
  drained: ['Low energy', 'Need rest', 'Depleted'],
  tired:   ['Slow pace',  'Need break','Winding down'],
  okay:    ['Steady',     'Balanced',  'Neutral'],
  good:    ['Energized',  'Motivated', 'Positive'],
  great:   ['High energy','Thriving',  'On fire'],
};

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function CheckInScreen() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedChips, setSelectedChips]  = useState<string[]>([]);
  const [reflection, setReflection]         = useState('');
  const [isSubmitting, setIsSubmitting]     = useState(false);
  const [isComplete, setIsComplete]         = useState(false);
  const [userId, setUserId]                 = useState<string | null>(null);
  const [inputFocused, setInputFocused]     = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  const handleMoodSelect = (id: string) => {
    Vibration.vibrate(30);
    setSelectedMood(id);
    setSelectedChips([]);
  };

  const handleChipToggle = (chip: string) => {
    Vibration.vibrate(20);
    setSelectedChips(prev =>
      prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]
    );
  };

  // Supabase insert retained exactly from web app
  const handleSubmit = async () => {
    if (!selectedMood || !userId) return;
    Vibration.vibrate(40);
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('check_ins').insert({
        user_id: userId,
        mood: selectedMood,
        energy_tags: selectedChips,
        reflection: reflection.trim() || null,
      });

      if (error) throw error;

      setIsComplete(true);
      setTimeout(() => router.replace('/(tabs)'), 1500);
    } catch (err) {
      console.error('Error saving check-in:', err);
      setIsSubmitting(false);
    }
  };

  const selectedMoodData = moods.find(m => m.id === selectedMood);

  // ── Success state ─────────────────────────────────────────────────────────
  if (isComplete) {
    return (
      <SafeAreaView style={[styles.safe, { alignItems: 'center', justifyContent: 'center' }]}>
        <View style={styles.successIcon}>
          <Check size={40} color={selectedMoodData?.color ?? colors.success} />
        </View>
        <Text style={styles.successText}>Thanks for checking in.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.headerSection}>
            <Text style={styles.title}>Take a moment{'\n'}to check in</Text>
            <Text style={styles.subtitle}>It takes just 10 seconds.</Text>
          </View>

          {/* Mood picker */}
          <View style={styles.moodCard}>
            <Text style={styles.moodPrompt}>How are you feeling?</Text>
            <View style={styles.moodRow}>
              {moods.map(mood => {
                const active  = selectedMood === mood.id;
                const faded   = selectedMood !== null && !active;
                return (
                  <TouchableOpacity
                    key={mood.id}
                    style={[
                      styles.moodBtn,
                      active && { transform: [{ scale: 1.12 }] },
                      faded && { opacity: 0.4 },
                    ]}
                    onPress={() => handleMoodSelect(mood.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                    <Text
                      style={[styles.moodLabel, active && { color: mood.color, fontWeight: '700' }]}
                    >
                      {mood.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Energy chips — shown after mood selected */}
          {selectedMood && (
            <View style={styles.chipsSection}>
              <Text style={styles.chipsPrompt}>Anything else? (optional)</Text>
              <View style={styles.chipsRow}>
                {energyChips[selectedMood]?.map(chip => {
                  const active = selectedChips.includes(chip);
                  return (
                    <TouchableOpacity
                      key={chip}
                      style={[
                        styles.chip,
                        active && {
                          backgroundColor: `${selectedMoodData?.color ?? colors.primary}22`,
                          borderColor: selectedMoodData?.color ?? colors.primary,
                        },
                      ]}
                      onPress={() => handleChipToggle(chip)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          active && { color: selectedMoodData?.color ?? colors.primary, fontWeight: '600' },
                        ]}
                      >
                        {chip}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Reflection input — shown after mood selected */}
          {selectedMood && (
            <View style={styles.reflectionSection}>
              <TextInput
                style={[styles.reflectionInput, inputFocused && styles.reflectionInputFocused]}
                value={reflection}
                onChangeText={setReflection}
                placeholder="One word to describe today (optional)"
                placeholderTextColor={colors.textMuted}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                returnKeyType="done"
                autoCapitalize="sentences"
              />
            </View>
          )}

          {/* Submit */}
          {selectedMood && (
            <TouchableOpacity
              style={[
                styles.submitBtn,
                {
                  backgroundColor: selectedMoodData?.color ?? colors.primary,
                  opacity: isSubmitting || !userId ? 0.6 : 1,
                },
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting || !userId}
              activeOpacity={0.85}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>Log Check-In</Text>
              )}
            </TouchableOpacity>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0b0f1a',
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: spacing.base,
    gap: spacing.xl,
  },

  // Header
  headerSection: { alignItems: 'center', paddingTop: spacing['2xl'] },
  title: {
    color: colors.text,
    fontSize: typography['2xl'],
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: spacing.sm,
  },
  subtitle: { color: colors.textMuted, fontSize: typography.sm, textAlign: 'center' },

  // Mood card
  moodCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: spacing.xl,
    gap: spacing.lg,
  },
  moodPrompt: {
    color: colors.textMuted,
    fontSize: typography.sm,
    textAlign: 'center',
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodBtn: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  moodEmoji: { fontSize: 32 },
  moodLabel: {
    color: colors.textMuted,
    fontSize: typography.xs,
    fontWeight: '500',
  },

  // Chips
  chipsSection: { gap: spacing.md },
  chipsPrompt: {
    color: colors.textMuted,
    fontSize: typography.xs,
    textAlign: 'center',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  chipText: {
    color: colors.textMuted,
    fontSize: typography.sm,
  },

  // Reflection
  reflectionSection: {},
  reflectionInput: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: spacing.base,
    height: 52,
    color: colors.text,
    fontSize: typography.base,
  },
  reflectionInputFocused: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(99,102,241,0.08)',
  },

  // Submit
  submitBtn: {
    height: 56,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    color: '#fff',
    fontSize: typography.md,
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  // Success
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(34,197,94,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  successText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: typography.lg,
  },
});
