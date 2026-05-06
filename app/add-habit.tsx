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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ArrowLeft, Check, FileText } from 'lucide-react-native';
import { supabase } from '@/supabase/client';
import { colors, radii, spacing, typography } from '@/lib/theme';

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = 'personal' | 'professional' | 'fitness' | 'financial';

interface SuggestedHabit {
  title: string;
  icon: string;
  category: Category;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const categories: { id: Category; label: string; color: string; activeColor: string }[] = [
  { id: 'personal',     label: 'Personal',     color: '#6366f1', activeColor: '#818cf8' },
  { id: 'professional', label: 'Professional', color: '#a855f7', activeColor: '#c084fc' },
  { id: 'fitness',      label: 'Fitness',      color: '#22c55e', activeColor: '#4ade80' },
  { id: 'financial',    label: 'Financial',    color: '#f59e0b', activeColor: '#fbbf24' },
];

const defaultSuggestions: SuggestedHabit[] = [
  { title: 'Morning meditation',      icon: '🧘', category: 'personal'     },
  { title: 'Exercise for 30 min',     icon: '💪', category: 'fitness'      },
  { title: 'Drink 8 glasses of water',icon: '💧', category: 'fitness'      },
  { title: 'Review daily tasks',      icon: '📋', category: 'professional' },
  { title: 'Read for 20 min',         icon: '📚', category: 'personal'     },
  { title: 'Track expenses',          icon: '💰', category: 'financial'    },
];

const icons = ['✨','🎯','📚','💪','🧘','💰','📋','🌟','🎨','🏃','💧','🌙'];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function AddHabitScreen() {
  const [title, setTitle]                   = useState('');
  const [note, setNote]                     = useState('');
  const [selectedCategory, setCategory]     = useState<Category>('personal');
  const [selectedIcon, setIcon]             = useState('✨');
  const [frequency, setFrequency]           = useState<'daily' | 'weekly'>('daily');
  const [suggestions, setSuggestions]       = useState<SuggestedHabit[]>(defaultSuggestions);
  const [isSaving, setIsSaving]             = useState(false);
  const [titleFocused, setTitleFocused]     = useState(false);
  const [noteFocused, setNoteFocused]       = useState(false);

  // Load suggestions passed from Today screen via AsyncStorage
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('goals360_habit_suggestions');
        if (!saved) return;
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.suggestions) && parsed.suggestions.length > 0) {
          setSuggestions(parsed.suggestions);
        }
      } catch {
        setSuggestions(defaultSuggestions);
      }
    })();
  }, []);

  const handleSuggestion = (habit: SuggestedHabit) => {
    setTitle(habit.title);
    setIcon(habit.icon);
    setCategory(habit.category);
  };

  const handleSave = async () => {
    if (isSaving || !title.trim()) return;
    setIsSaving(true);

    const tempId = Date.now().toString();
    const newHabit = {
      id: tempId,
      title: title.trim(),
      icon: selectedIcon,
      category: selectedCategory,
      completed: false,
      progress: 0,
      streak: 0,
      note: note.trim() || undefined,
    };

    try {
      // Retained exactly from web app — same Supabase insert
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No active session; please sign in again.');

      const { data, error } = await supabase
        .from('habits')
        .insert({
          user_id: user.id,
          title: newHabit.title,
          icon: newHabit.icon,
          category: newHabit.category,
          completed: false,
          completed_at: null,
          note: newHabit.note ?? null,
        })
        .select('id')
        .single();

      if (error) throw error;

      // Merge into AsyncStorage habits list
      const raw = await AsyncStorage.getItem('goals360_habits');
      const habits = raw ? JSON.parse(raw) : [];
      habits.push({ ...newHabit, id: data?.id ?? tempId });
      await AsyncStorage.setItem('goals360_habits', JSON.stringify(habits));
      await AsyncStorage.setItem('goals360_has_habits', 'true');
      await AsyncStorage.removeItem('goals360_habit_suggestions');

      router.replace('/(tabs)');
    } catch (err) {
      console.error('Error saving habit:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const canSave = title.trim().length > 0;
  const activeCat = categories.find(c => c.id === selectedCategory)!;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
            <ArrowLeft size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Habit</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Habit Name ── */}
          <View style={styles.section}>
            <Text style={styles.label}>Habit Name</Text>
            <TextInput
              style={[styles.input, titleFocused && styles.inputFocused]}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g., Morning meditation"
              placeholderTextColor={colors.textMuted}
              onFocus={() => setTitleFocused(true)}
              onBlur={() => setTitleFocused(false)}
              returnKeyType="next"
              autoCapitalize="sentences"
            />
          </View>

          {/* ── Note ── */}
          <View style={styles.section}>
            <View style={styles.labelRow}>
              <FileText size={14} color={colors.primary} />
              <Text style={styles.label}>Note (optional)</Text>
            </View>
            <TextInput
              style={[styles.input, styles.textarea, noteFocused && styles.inputFocused]}
              value={note}
              onChangeText={setNote}
              placeholder="Add details about this habit..."
              placeholderTextColor={colors.textMuted}
              onFocus={() => setNoteFocused(true)}
              onBlur={() => setNoteFocused(false)}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* ── Icon ── */}
          <View style={styles.section}>
            <Text style={styles.label}>Choose Icon</Text>
            <View style={styles.iconGrid}>
              {icons.map((icon) => (
                <TouchableOpacity
                  key={icon}
                  style={[
                    styles.iconBtn,
                    selectedIcon === icon && [styles.iconBtnActive, { borderColor: activeCat.color }],
                  ]}
                  onPress={() => setIcon(icon)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.iconEmoji}>{icon}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ── Category ── */}
          <View style={styles.section}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryGrid}>
              {categories.map((cat) => {
                const active = selectedCategory === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryBtn,
                      active && { backgroundColor: `${cat.color}22`, borderColor: cat.color },
                    ]}
                    onPress={() => setCategory(cat.id)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.categoryDot, { backgroundColor: active ? cat.activeColor : cat.color }]} />
                    <Text style={[styles.categoryLabel, active && { color: cat.activeColor, fontWeight: '700' }]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* ── Frequency ── */}
          <View style={styles.section}>
            <Text style={styles.label}>Frequency</Text>
            <View style={styles.frequencyRow}>
              {(['daily', 'weekly'] as const).map((freq) => {
                const active = frequency === freq;
                return (
                  <TouchableOpacity
                    key={freq}
                    style={[
                      styles.freqBtn,
                      active && { backgroundColor: activeCat.color, borderColor: activeCat.color },
                    ]}
                    onPress={() => setFrequency(freq)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.freqLabel, active && styles.freqLabelActive]}>
                      {freq.charAt(0).toUpperCase() + freq.slice(1)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* ── Suggestions ── */}
          <View style={styles.section}>
            <Text style={styles.label}>Suggestions</Text>
            <View style={styles.suggestionWrap}>
              {suggestions.map((habit) => (
                <TouchableOpacity
                  key={habit.title}
                  style={styles.suggestionPill}
                  onPress={() => handleSuggestion(habit)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.suggestionText}>
                    {habit.icon}  {habit.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ── Save Button ── */}
          <TouchableOpacity
            style={[
              styles.saveBtn,
              canSave
                ? { backgroundColor: activeCat.color }
                : styles.saveBtnDisabled,
            ]}
            onPress={handleSave}
            disabled={!canSave || isSaving}
            activeOpacity={0.85}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Check size={20} color="#fff" />
                <Text style={styles.saveBtnText}>Add Habit</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={{ height: 32 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: colors.text,
    fontSize: typography.xl,
    fontWeight: '700',
    letterSpacing: -0.3,
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: {
    padding: spacing.base,
    gap: spacing.xl,
  },

  // Section
  section: { gap: spacing.sm },
  label: {
    color: colors.text,
    fontSize: typography.sm,
    fontWeight: '600',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  // TextInput
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    color: colors.text,
    fontSize: typography.base,
  },
  inputFocused: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(99,102,241,0.08)',
  },
  textarea: {
    minHeight: 88,
    paddingTop: spacing.md,
  },

  // Icons
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  iconBtn: {
    width: 48,
    height: 48,
    borderRadius: radii.lg,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnActive: {
    backgroundColor: 'rgba(99,102,241,0.15)',
  },
  iconEmoji: { fontSize: 22 },

  // Category
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    width: '48%',
    paddingVertical: spacing.md - 2,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  categoryLabel: {
    color: colors.textMuted,
    fontSize: typography.sm,
    fontWeight: '500',
  },

  // Frequency
  frequencyRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  freqBtn: {
    flex: 1,
    paddingVertical: spacing.md - 2,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
  },
  freqLabel: {
    color: colors.textMuted,
    fontSize: typography.sm,
    fontWeight: '600',
  },
  freqLabelActive: { color: '#fff' },

  // Suggestions
  suggestionWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  suggestionPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.full,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  suggestionText: {
    color: colors.textMuted,
    fontSize: typography.sm,
  },

  // Save
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.base,
    borderRadius: radii.xl,
  },
  saveBtnDisabled: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: typography.md,
    fontWeight: '700',
  },
});
