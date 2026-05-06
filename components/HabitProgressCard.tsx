import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Check, HelpCircle, Sparkles } from 'lucide-react-native';
import { colors, radii, spacing, typography } from '@/lib/theme';

export interface HabitProgress {
  id: string;
  title: string;
  icon: string;
  progress: number;
  color: string;
  completed?: boolean;
  category?: string;
}

interface HabitProgressCardProps {
  habits: HabitProgress[];
  onSetProgress?: (id: string, progress: number) => void;
  onComplete?: (id: string) => void;
  onNeedHelp?: () => void;
}

const accentMap: Record<string, string> = {
  personal: '#4ade80',
  fitness: '#22d3ee',
  financial: '#fbbf24',
  professional: '#a78bfa',
  nutrition: '#fb7185',
};

export function HabitProgressCard({
  habits,
  onSetProgress,
  onComplete,
  onNeedHelp,
}: HabitProgressCardProps) {
  const incompleteHabits = habits.filter((h) => !h.completed);
  const hasNoHabits = habits.length === 0;
  const completedCount = habits.filter((h) => h.completed).length;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Today's Habits</Text>
        {!hasNoHabits && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {completedCount}/{habits.length}
            </Text>
          </View>
        )}
      </View>

      {hasNoHabits ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Sparkles size={24} color={colors.text} />
          </View>
          <Text style={styles.emptyTitle}>Start Your Journey</Text>
          <Text style={styles.emptySubtitle}>
            Create your first habit and begin building a better you.
          </Text>
          <TouchableOpacity style={styles.helpButton} onPress={onNeedHelp} activeOpacity={0.8}>
            <HelpCircle size={16} color="#fff" />
            <Text style={styles.helpButtonText}>Need Help Setting Habits?</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.habitList}>
          {incompleteHabits.length === 0 ? (
            <Text style={styles.allDone}>All habits completed! 🎉</Text>
          ) : (
            incompleteHabits.slice(0, 5).map((habit) => (
              <HabitRow
                key={habit.id}
                habit={habit}
                accent={accentMap[habit.category ?? ''] ?? colors.primary}
                onSetProgress={(p) => onSetProgress?.(habit.id, p)}
                onComplete={() => onComplete?.(habit.id)}
              />
            ))
          )}
        </View>
      )}
    </View>
  );
}

interface HabitRowProps {
  habit: HabitProgress;
  accent: string;
  onSetProgress?: (p: number) => void;
  onComplete?: () => void;
}

function HabitRow({ habit, accent, onSetProgress, onComplete }: HabitRowProps) {
  const [completing, setCompleting] = useState(false);
  const pipCount = Math.round(habit.progress / 20);

  const handlePipTap = (idx: number) => {
    const newProgress = (idx + 1) * 20;
    onSetProgress?.(newProgress);
    if (newProgress >= 100) {
      setCompleting(true);
      setTimeout(() => {
        setCompleting(false);
        onComplete?.();
      }, 300);
    }
  };

  const handleCompleteTap = () => {
    setCompleting(true);
    setTimeout(() => {
      setCompleting(false);
      onComplete?.();
    }, 220);
  };

  if (completing) return null;

  return (
    <View style={styles.row}>
      {/* Circle checkbox */}
      <TouchableOpacity
        onPress={handleCompleteTap}
        activeOpacity={0.7}
        style={[
          styles.checkbox,
          { borderColor: accent },
          habit.progress >= 100 && { backgroundColor: accent },
        ]}
      >
        {habit.progress >= 100 && <Check size={10} color="#fff" />}
      </TouchableOpacity>

      {/* Icon pill */}
      <View style={[styles.iconPill, { backgroundColor: `${accent}22` }]}>
        <Text style={styles.habitIcon}>{habit.icon}</Text>
      </View>

      {/* Title + Pips */}
      <View style={styles.rowContent}>
        <View style={styles.rowTop}>
          <Text style={styles.habitTitle} numberOfLines={1}>
            {habit.title}
          </Text>
          <View style={styles.progressBadge}>
            <Text style={styles.progressText}>{habit.progress}%</Text>
          </View>
        </View>

        {/* 5-pip progress */}
        <View style={styles.pips}>
          {Array.from({ length: 5 }).map((_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => handlePipTap(i)}
              activeOpacity={0.7}
              style={[
                styles.pip,
                i < pipCount
                  ? { backgroundColor: accent, shadowColor: accent, shadowOpacity: 0.5, shadowRadius: 4, shadowOffset: { width: 0, height: 0 } }
                  : { backgroundColor: 'rgba(255,255,255,0.1)' },
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  headerTitle: {
    color: colors.textMuted,
    fontSize: typography.sm,
    fontWeight: '600',
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radii.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    color: colors.textMuted,
    fontSize: typography.xs,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: radii.lg,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: typography.base,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptySubtitle: {
    color: colors.textMuted,
    fontSize: typography.xs,
    textAlign: 'center',
    maxWidth: 240,
    marginBottom: spacing.lg,
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md - 2,
  },
  helpButtonText: {
    color: '#fff',
    fontSize: typography.sm,
    fontWeight: '600',
  },
  habitList: {
    gap: spacing.sm,
  },
  allDone: {
    color: colors.textMuted,
    fontSize: typography.sm,
    textAlign: 'center',
    paddingVertical: spacing.base,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: radii.lg,
    padding: spacing.md - 2,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconPill: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  habitIcon: {
    fontSize: 18,
  },
  rowContent: {
    flex: 1,
    minWidth: 0,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  habitTitle: {
    color: colors.text,
    fontSize: typography.xs,
    fontWeight: '600',
    flex: 1,
  },
  progressBadge: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radii.full,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginLeft: 6,
  },
  progressText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '500',
  },
  pips: {
    flexDirection: 'row',
    gap: 6,
  },
  pip: {
    width: 18,
    height: 6,
    borderRadius: 3,
  },
});
