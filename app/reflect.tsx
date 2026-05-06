import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Check } from 'lucide-react-native';
import { colors, radii, spacing, typography } from '@/lib/theme';

// ─── Types & data ─────────────────────────────────────────────────────────────

type Timeframe = 'daily' | 'weekly' | 'monthly';

interface Reflection {
  id: string;
  date: string;
  timeframe: Timeframe;
  text: string;
}

const subtitles = [
  'Your thoughts matter',
  'Pause and check in with yourself',
  'Small reflections lead to big clarity',
];

const promptChips: Record<Timeframe, string[]> = {
  daily:   ['What went well?', 'How did that make you feel?', 'One small win today'],
  weekly:  ['What stood out this week?', 'Any patterns you noticed?', 'Which habit helped most?'],
  monthly: ['What patterns this month?', 'What improved?', 'Where to focus next month?'],
};

const hints: Record<Timeframe, string> = {
  daily:   "You kept up your hydration goal! 💧 How did that make you feel?",
  weekly:  "Workout consistency improved +18% — what helped you maintain momentum?",
  monthly: "Meditation was your most consistent habit — what did you learn?",
};

const placeholders: Record<Timeframe, string> = {
  daily:   'How did today feel?',
  weekly:  'What stood out this week?',
  monthly: 'What patterns did you notice this month?',
};

const timeframeTabs: { id: Timeframe; label: string; color: string }[] = [
  { id: 'daily',   label: 'Today',      color: '#6D5DF6' },
  { id: 'weekly',  label: 'Last Week',  color: '#22C55E' },
  { id: 'monthly', label: 'Last Month', color: '#FACC15' },
];

const pillColors = [
  ['#ffb86b', '#ff8fd6'],
  ['#8a6df6', '#b36aff'],
  ['#6ad1c2', '#4fd1c5'],
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ReflectScreen() {
  const [subtitle, setSubtitle]             = useState(subtitles[0]);
  const [timeframe, setTimeframe]           = useState<Timeframe>('daily');
  const [textValue, setTextValue]           = useState('');
  const [showSaved, setShowSaved]           = useState(false);
  const [inputFocused, setInputFocused]     = useState(false);
  const debounceRef                          = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Rotate subtitle per visit
  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem('goals360_reflect_subtitle_index');
      const idx = Number(raw ?? '0');
      const next = (idx + 1) % subtitles.length;
      setSubtitle(subtitles[next]);
      await AsyncStorage.setItem('goals360_reflect_subtitle_index', String(next));
    })();
  }, []);

  // Auto-save draft with 800ms debounce (localStorage → AsyncStorage)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (!textValue.trim()) return;
      try {
        const raw = await AsyncStorage.getItem('goals360_reflections');
        const reflections: Reflection[] = raw ? JSON.parse(raw) : [];
        const draft: Reflection = {
          id: `draft-${timeframe}`,
          date: new Date().toISOString(),
          timeframe,
          text: textValue,
        };
        const idx = reflections.findIndex(r => r.id === draft.id);
        if (idx >= 0) reflections[idx] = draft;
        else reflections.push(draft);
        await AsyncStorage.setItem('goals360_reflections', JSON.stringify(reflections));
        setShowSaved(true);
        setTimeout(() => setShowSaved(false), 1400);
      } catch { /* silent */ }
    }, 800);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [textValue, timeframe]);

  const insertPrompt = (prompt: string) => {
    setTextValue(t => (t ? `${t}\n${prompt}` : prompt));
  };

  const saveReflection = async () => {
    if (!textValue.trim()) return;
    try {
      const raw = await AsyncStorage.getItem('goals360_reflections');
      const reflections: Reflection[] = raw ? JSON.parse(raw) : [];
      reflections.push({
        id: Date.now().toString(),
        date: new Date().toISOString(),
        timeframe,
        text: textValue.trim(),
      });
      await AsyncStorage.setItem('goals360_reflections', JSON.stringify(reflections));
      setShowSaved(true);
      setTextValue('');
      setTimeout(() => { setShowSaved(false); router.replace('/(tabs)'); }, 700);
    } catch { /* silent */ }
  };

  const activeCat = timeframeTabs.find(t => t.id === timeframe)!;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Take a Moment{'\n'}to Reflect</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          {/* Timeframe tabs */}
          <View style={styles.tabs}>
            {timeframeTabs.map(tab => {
              const active = timeframe === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[
                    styles.tab,
                    active && { backgroundColor: tab.color },
                  ]}
                  onPress={() => setTimeframe(tab.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.tabText, active && styles.tabTextActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Reflection card */}
          <View style={styles.card}>
            {/* Prompt pills */}
            <View style={styles.pillsSection}>
              {promptChips[timeframe].map((prompt, i) => {
                const [c1, c2] = pillColors[i % 3];
                return (
                  <TouchableOpacity
                    key={prompt}
                    style={[styles.pill, { backgroundColor: c1 }]}
                    onPress={() => insertPrompt(prompt)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.pillText}>{prompt}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Hint */}
            <Text style={styles.hint}>
              <Text style={{ color: colors.textMuted }}>Hint: </Text>
              <Text style={{ color: colors.text, fontWeight: '600' }}>{hints[timeframe]}</Text>
            </Text>

            {/* Textarea */}
            <TextInput
              style={[styles.textarea, inputFocused && styles.textareaFocused]}
              value={textValue}
              onChangeText={setTextValue}
              placeholder={placeholders[timeframe]}
              placeholderTextColor={colors.textMuted}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              autoCapitalize="sentences"
            />

            {/* Footer row */}
            <View style={styles.footerRow}>
              <Text style={styles.footerMeta}>
                {showSaved
                  ? '✓ Saved'
                  : `${textValue.length} chars · autosave`}
              </Text>
              <TouchableOpacity
                style={[
                  styles.saveBtn,
                  { backgroundColor: activeCat.color },
                  !textValue.trim() && styles.saveBtnDisabled,
                ]}
                onPress={saveReflection}
                disabled={!textValue.trim()}
                activeOpacity={0.85}
              >
                <Check size={14} color="#fff" />
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>

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
    backgroundColor: '#1B1430',
  },

  // Header
  header: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.xl,
    paddingBottom: spacing.base,
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: typography['2xl'],
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 34,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: typography.sm,
    textAlign: 'center',
  },
  tabs: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  tab: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    backgroundColor: 'transparent',
  },
  tabText: {
    color: colors.textMuted,
    fontSize: typography.sm,
    fontWeight: '600',
  },
  tabTextActive: { color: '#fff' },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: {
    padding: spacing.base,
    gap: spacing.xl,
  },

  // Card
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: spacing.xl,
    gap: spacing.lg,
  },

  // Prompt pills
  pillsSection: { gap: spacing.sm },
  pill: {
    width: '100%',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderRadius: radii.full,
  },
  pillText: {
    color: '#fff',
    fontSize: typography.sm,
    fontWeight: '600',
  },

  // Hint
  hint: { fontSize: typography.sm, lineHeight: 20 },

  // Textarea
  textarea: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: spacing.base,
    color: colors.text,
    fontSize: typography.base,
    minHeight: 140,
    lineHeight: 22,
  },
  textareaFocused: {
    borderColor: '#6D5DF6',
    backgroundColor: 'rgba(109,93,246,0.08)',
  },

  // Footer
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerMeta: { color: colors.textSubtle ?? colors.textMuted, fontSize: typography.xs },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.full,
  },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { color: '#fff', fontSize: typography.sm, fontWeight: '700' },
});
