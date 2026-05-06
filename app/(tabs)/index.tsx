import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Vibration,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Bell, CheckSquare, Dumbbell, Apple, Heart, Sparkles, Star } from 'lucide-react-native';
import { supabase } from '@/supabase/client';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useGoals } from '@/hooks/useGoals';
import { useAdaptiveSuggestions } from '@/hooks/useAdaptiveSuggestions';
import { LifeRing, LifeRingLegend } from '@/components/LifeRing';
import { HabitProgressCard } from '@/components/HabitProgressCard';
import { colors, spacing, radii, typography } from '@/lib/theme';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Habit {
  id: string;
  title: string;
  icon: string;
  category: 'personal' | 'professional' | 'fitness' | 'financial';
  completed: boolean;
  note?: string;
  progress?: number;
  streak?: number;
}

type PersonaType =
  | 'balanced'
  | 'fitness-focused'
  | 'professional-driven'
  | 'wellness-seeker'
  | 'holistic-achiever'
  | 'getting-started';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const moodColors: Record<string, string> = {
  drained: '#6A6D9E',
  tired: '#5C7CFA',
  okay: '#4CAF8C',
  good: '#F2C94C',
  great: '#F2994A',
};

const categoryColors: Record<string, string> = {
  fitness: 'hsl(142, 71%, 45%)',
  personal: 'hsl(220, 100%, 60%)',
  financial: 'hsl(38, 92%, 50%)',
  professional: 'hsl(263, 70%, 65%)',
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function getBehaviorInsight(habits: Habit[]): string {
  const done = habits.filter((h) => h.completed).length;
  if (done > 0) return `${done} habit${done === 1 ? '' : 's'} completed today.`;
  if (habits.length > 0) return 'Your habits are starting to take shape.';
  return 'Start with one small habit you can commit to today.';
}

function getTimeOfDay(date: Date): string {
  const h = date.getHours();
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
}

function isLikelyUuid(value: string): boolean {
  return /^[0-9a-fA-F-]{36}$/.test(value);
}

function detectPersona(profile: { focusAreas: string[]; experience: string | null }): PersonaType {
  const { focusAreas, experience } = profile;
  if (focusAreas.length >= 3) return 'holistic-achiever';
  if (focusAreas.length === 1) {
    if (focusAreas.includes('fitness')) return 'fitness-focused';
    if (focusAreas.includes('professional')) return 'professional-driven';
    if (focusAreas.includes('personal')) return 'wellness-seeker';
  }
  if (focusAreas.length === 2) return 'balanced';
  if (experience === 'fresh' || experience === null) return 'getting-started';
  return 'balanced';
}

function getPersonaHabitSuggestions(
  personaType: PersonaType,
  focusAreas: string[],
  personalHabits: string[],
  professionalHabits: string[]
): Habit[] {
  switch (personaType) {
    case 'fitness-focused':
      return [
        { id: 'f1', title: '30 min movement', icon: '🏃', category: 'fitness', completed: false },
        { id: 'f2', title: 'Drink 8 glasses water', icon: '💧', category: 'fitness', completed: false },
        { id: 'f3', title: 'Track workout', icon: '📊', category: 'fitness', completed: false },
      ];
    case 'professional-driven': {
      const s: Habit[] = [];
      if (professionalHabits.includes('focus'))
        s.push({ id: 'w1', title: 'Deep work session', icon: '🎯', category: 'professional', completed: false });
      if (professionalHabits.includes('schedule'))
        s.push({ id: 'w2', title: 'Plan tomorrow', icon: '📋', category: 'professional', completed: false });
      if (s.length === 0)
        s.push({ id: 'w0', title: 'Complete top priority', icon: '✅', category: 'professional', completed: false });
      return s;
    }
    case 'wellness-seeker': {
      const s: Habit[] = [];
      if (personalHabits.includes('morning'))
        s.push({ id: 'p2', title: 'Morning routine', icon: '☀️', category: 'personal', completed: false });
      if (personalHabits.includes('stress'))
        s.push({ id: 'p3', title: '10 min meditation', icon: '🧘', category: 'personal', completed: false });
      if (s.length === 0)
        s.push({ id: 'p0', title: 'Daily reflection', icon: '📝', category: 'personal', completed: false });
      return s;
    }
    case 'holistic-achiever': {
      const s: Habit[] = [];
      if (focusAreas.includes('personal'))
        s.push({ id: 'p2', title: 'Morning routine', icon: '☀️', category: 'personal', completed: false });
      if (focusAreas.includes('fitness'))
        s.push({ id: 'f1', title: '30 min movement', icon: '🏃', category: 'fitness', completed: false });
      if (focusAreas.includes('professional'))
        s.push({ id: 'w1', title: 'Deep work session', icon: '🎯', category: 'professional', completed: false });
      return s;
    }
    case 'getting-started':
      return [
        { id: 'gs1', title: '5 min morning meditation', icon: '🧘', category: 'personal', completed: false },
        { id: 'gs2', title: '10 min walk', icon: '🚶', category: 'fitness', completed: false },
      ];
    default:
      return [
        { id: 'd1', title: 'Morning meditation', icon: '🧘', category: 'personal', completed: false },
        { id: 'd2', title: '30 min walk', icon: '🚶', category: 'fitness', completed: false },
      ];
  }
}

const quickActions = [
  {
    id: 'habit',
    Icon: CheckSquare,
    title: 'Start a Habit',
    description: 'Set a small goal and check in daily.',
    color: '#6366f1',
    path: '/add-habit',
  },
  {
    id: 'workout',
    Icon: Dumbbell,
    title: 'Log Your Workout',
    description: 'Track your activity and see progress.',
    color: '#22c55e',
    path: '/fitness/log-workout',
  },
  {
    id: 'nutrition',
    Icon: Apple,
    title: 'Track Nutrition',
    description: 'Understand your eating patterns.',
    color: '#f59e0b',
    path: '/fitness/log-food',
  },
  {
    id: 'reflect',
    Icon: Heart,
    title: 'Reflect Your Day',
    description: 'Take a moment to reflect.',
    color: '#ec4899',
    path: '/reflect',
  },
];

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function TodayScreen() {
  const { profile, isLoading, hasFitness, hasPersonal, hasProfessional } = useUserProfile();

  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitsInitialized, setHabitsInitialized] = useState(false);
  const [todayMood, setTodayMood] = useState<string | null>(null);
  const [snapshotDelta, setSnapshotDelta] = useState(0);
  const [newBadge, setNewBadge] = useState<{ name: string; icon: string } | null>(null);
  const [showBadgeBanner, setShowBadgeBanner] = useState(false);

  // ── Fetch today's check-in mood ──────────────────────────────────────────
  useEffect(() => {
    const fetchMood = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('check_ins')
        .select('mood')
        .eq('user_id', user.id)
        .eq('check_in_date', today)
        .maybeSingle();
      if (data?.mood) setTodayMood(data.mood);
    };
    fetchMood();
  }, []);

  // ── Load habits from AsyncStorage ────────────────────────────────────────
  useEffect(() => {
    if (!isLoading && !habitsInitialized) {
      (async () => {
        try {
          const saved = await AsyncStorage.getItem('goals360_habits');
          if (saved) {
            const parsed = JSON.parse(saved).map((h: any) => ({
              ...h,
              progress: h.progress ?? 0,
              completed: h.completed ?? false,
              streak: h.streak ?? 0,
            }));
            setHabits(parsed.length > 0 ? parsed : []);
          } else {
            setHabits([]);
          }
        } catch {
          setHabits([]);
        }
        setHabitsInitialized(true);
      })();
    }
  }, [isLoading, habitsInitialized]);

  // ── Persist habits on change ─────────────────────────────────────────────
  useEffect(() => {
    if (habitsInitialized && habits.length > 0) {
      AsyncStorage.setItem('goals360_habits', JSON.stringify(habits));
    }
  }, [habits, habitsInitialized]);

  // ── Snapshot delta ───────────────────────────────────────────────────────
  const totalHabits = habits.length;
  const completedCount = habits.filter((h) => h.completed).length;
  const todayCompletion = totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0;

  useEffect(() => {
    if (!habitsInitialized || isLoading) return;
    (async () => {
      try {
        const prev = await AsyncStorage.getItem('goals360_daily_snapshot_prev_completion');
        const prevValue = prev ? parseInt(prev, 10) : null;
        if (prevValue !== null && !Number.isNaN(prevValue)) {
          setSnapshotDelta(todayCompletion - prevValue);
        } else {
          setSnapshotDelta(0);
        }
        await AsyncStorage.setItem(
          'goals360_daily_snapshot_prev_completion',
          String(todayCompletion)
        );
      } catch {
        setSnapshotDelta(0);
      }
    })();
  }, [todayCompletion, habitsInitialized, isLoading]);

  // ── Latest badge ─────────────────────────────────────────────────────────
  useEffect(() => {
    const loadBadge = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const lastSeen = await AsyncStorage.getItem('goals360_last_badge_seen_at');
      const { data } = await supabase
        .from('user_badges')
        .select('earned_at, badges(name, icon)')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data?.earned_at && data.badges) {
        const isNew = !lastSeen || new Date(data.earned_at) > new Date(lastSeen);
        if (isNew) {
          setNewBadge({ name: (data.badges as any).name, icon: (data.badges as any).icon || '🏅' });
          setShowBadgeBanner(true);
        }
      }
    };
    loadBadge();
  }, []);

  // ── Persona + suggestions ────────────────────────────────────────────────
  const personaType = useMemo(
    () =>
      ((profile.personaOverride ||
        detectPersona({ focusAreas: profile.focusAreas, experience: profile.experience })) as PersonaType),
    [profile.personaOverride, profile.focusAreas, profile.experience]
  );

  const personaSuggestions = useMemo(
    () =>
      getPersonaHabitSuggestions(
        personaType,
        profile.focusAreas,
        profile.personalHabits || [],
        profile.professionalHabits || []
      ),
    [personaType, profile.focusAreas, profile.personalHabits, profile.professionalHabits]
  );

  const { suggestions: adaptiveSuggestions } = useAdaptiveSuggestions({
    personaType,
    focusAreas: profile.focusAreas,
    personalHabits: profile.personalHabits,
    professionalHabits: profile.professionalHabits,
  });

  const mergedSuggestions = useMemo(() => {
    const combined = [
      ...adaptiveSuggestions.map((s) => ({ ...s, completed: false as const })),
      ...personaSuggestions,
    ];
    const unique = new Map<string, Habit>();
    combined.forEach((s, i) => {
      const key = s.title.toLowerCase();
      if (!unique.has(key)) unique.set(key, { ...s, id: s.id || `s-${i}` });
    });
    return Array.from(unique.values()).slice(0, 4);
  }, [adaptiveSuggestions, personaSuggestions]);

  // ── Goals ────────────────────────────────────────────────────────────────
  const { goals } = useGoals();
  const primaryGoal = goals[0];
  const goalMetrics = useMemo(() => {
    if (!primaryGoal?.end_date) return null;
    const startDate = new Date(primaryGoal.start_date);
    const endDate = new Date(primaryGoal.end_date);
    const now = new Date();
    const totalDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000));
    const elapsedDays = Math.max(1, Math.ceil((now.getTime() - startDate.getTime()) / 86400000));
    const expectedProgress = Math.min(1, elapsedDays / totalDays);
    const safeTarget = Math.max(1, primaryGoal.target_value);
    const actualProgress = Math.min(1, primaryGoal.current_value / safeTarget);
    const probability = Math.max(0, Math.min(100, Math.round((actualProgress / expectedProgress) * 100)));
    const status = actualProgress + 0.05 < expectedProgress ? 'at_risk' : 'on_track';
    const progressPercent = Math.round(actualProgress * 100);
    const suggestion =
      status === 'at_risk'
        ? 'Consider raising your daily target or splitting the goal into smaller milestones.'
        : 'You are on pace. Keep your current rhythm to stay on track.';
    return { probability, status, progressPercent, suggestion };
  }, [primaryGoal]);

  // ── Habit actions ────────────────────────────────────────────────────────
  const handleSetProgress = (id: string, progress: number) => {
    setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, progress } : h)));
  };

  const handleComplete = (id: string) => {
    const habit = habits.find((h) => h.id === id);
    if (!habit) return;

    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, completed: true, progress: 100 } : h))
    );
    Vibration.vibrate(50);

    // Undo via Alert
    Alert.alert('Marked complete', habit.title, [
      {
        text: 'Undo',
        onPress: () =>
          setHabits((prev) =>
            prev.map((h) => (h.id === id ? { ...h, completed: false, progress: habit.progress ?? 0 } : h))
          ),
      },
      { text: 'OK', style: 'default' },
    ]);

    // Log to Supabase — retained exactly from web app
    supabase.auth.getUser().then(({ data }) => {
      const user = data?.user;
      if (!user) return;
      const now = new Date();
      supabase.from('habit_events').insert({
        user_id: user.id,
        habit_id: isLikelyUuid(habit.id) ? habit.id : null,
        habit_title: habit.title,
        event_date: now.toISOString().split('T')[0],
        event_time: now.toTimeString().slice(0, 8),
        weekday: now.toLocaleDateString('en-US', { weekday: 'long' }),
        time_of_day: getTimeOfDay(now),
        event_type: 'completed',
      });

      supabase
        .from('virtual_pets')
        .select('id, health')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data: pet }) => {
          if (!pet) return;
          const nextHealth = Math.min(100, (pet.health || 70) + 2);
          supabase
            .from('virtual_pets')
            .update({ health: nextHealth, last_updated: now.toISOString() })
            .eq('id', pet.id);
        });
    });
  };

  const handleNeedHelp = async () => {
    const suggestions = mergedSuggestions.length > 0 ? mergedSuggestions : personaSuggestions;
    await AsyncStorage.setItem(
      'goals360_habit_suggestions',
      JSON.stringify({
        suggestions,
        personaType,
        message: `Based on your ${personaType.replace('-', ' ')} profile, here are some personalized habit suggestions:`,
      })
    );
    router.push('/add-habit');
  };

  const handleAdjustGoal = async () => {
    if (!primaryGoal?.end_date) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const remaining = Math.max(0, primaryGoal.target_value - primaryGoal.current_value);
    const now = new Date();
    const endDate = new Date(primaryGoal.end_date);
    const midDate = new Date((now.getTime() + endDate.getTime()) / 2);
    await supabase.from('goals').insert({
      user_id: user.id,
      title: `${primaryGoal.title} (Phase 1)`,
      category: primaryGoal.category ?? undefined,
      target_value: Math.max(1, Math.round(remaining / 2)),
      current_value: 0,
      unit: primaryGoal.unit ?? undefined,
      start_date: now.toISOString().split('T')[0],
      end_date: midDate.toISOString().split('T')[0],
      parent_goal_id: primaryGoal.id,
      adjusted_target_value: primaryGoal.target_value,
      adjustment_reason: 'Auto-split goal after risk detection',
      status: 'active',
    } as any);
  };

  // ── Progress ring data ───────────────────────────────────────────────────
  const calcProgress = (category: string) => {
    const cat = habits.filter((h) => h.category === category);
    if (cat.length === 0) return 0;
    return Math.round((cat.filter((h) => h.completed).length / cat.length) * 100);
  };

  const habitsProgress = calcProgress('personal') || (hasPersonal ? 0 : 60);
  const fitnessProgress = calcProgress('fitness') || (hasFitness ? 0 : 40);
  const focusProgress = calcProgress('professional') || (hasProfessional ? 0 : 50);

  const habitProgressData = habits.map((h) => ({
    id: h.id,
    title: h.title,
    icon: h.icon,
    progress: h.progress ?? (h.completed ? 100 : 0),
    color: categoryColors[h.category],
    completed: h.completed,
    category: h.category,
  }));

  const completedItems = habits
    .filter((h) => h.completed)
    .map((h) => ({ id: h.id, title: h.title, icon: h.icon }));

  const behaviorInsight = getBehaviorInsight(habits);

  // ── Loading guard ────────────────────────────────────────────────────────
  if (!habitsInitialized || isLoading) return null;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.greetingRow}>
            <Text style={styles.greeting}>{getGreeting()} ✨</Text>
            {todayMood && (
              <View
                style={[
                  styles.moodDot,
                  {
                    backgroundColor: moodColors[todayMood] ?? '#4CAF8C',
                    shadowColor: moodColors[todayMood] ?? '#4CAF8C',
                  },
                ]}
              />
            )}
          </View>
          <Text style={styles.insight} numberOfLines={1}>
            {behaviorInsight}
          </Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push('/more/notifications')}
            activeOpacity={0.7}
          >
            <Bell size={18} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconBtn, styles.avatarBtn]}
            onPress={() => router.push('/more/profile')}
            activeOpacity={0.7}
          >
            <Text style={styles.avatarEmoji}>👤</Text>
            {newBadge && <View style={styles.badgeDot} />}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Badge banner ── */}
        {showBadgeBanner && newBadge && (
          <View style={styles.badgeBanner}>
            <View style={styles.badgeBannerIcon}>
              <Text style={{ fontSize: 20 }}>{newBadge.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.badgeBannerTitle}>New badge unlocked</Text>
              <Text style={styles.badgeBannerName}>{newBadge.name}</Text>
            </View>
            <TouchableOpacity
              onPress={async () => {
                await AsyncStorage.setItem('goals360_last_badge_seen_at', new Date().toISOString());
                setShowBadgeBanner(false);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.badgeBannerDismiss}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Life Ring ── */}
        <View style={styles.ringSection}>
          <LifeRing habits={habitsProgress} fitness={fitnessProgress} focus={focusProgress} size={180} />
          <Text style={styles.ringLabel}>Your Balance in Progress</Text>
          <LifeRingLegend />
        </View>

        {/* ── Quick Actions ── */}
        <View style={styles.quickGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={[styles.actionCard, { borderColor: `${action.color}33` }]}
              onPress={() => router.push(action.path as any)}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIcon, { backgroundColor: `${action.color}22` }]}>
                <action.Icon size={18} color={action.color} />
              </View>
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionDesc} numberOfLines={2}>
                {action.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Adaptive Suggestions ── */}
        {mergedSuggestions.length > 0 && (
          <View style={styles.suggestionsCard}>
            <View style={styles.suggestionsHeader}>
              <View style={styles.suggestionsTitle}>
                <Sparkles size={14} color={colors.primary} />
                <Text style={styles.suggestionsTitleText}>Adaptive Suggestions</Text>
              </View>
              <TouchableOpacity onPress={handleNeedHelp} activeOpacity={0.7}>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.suggestionsGrid}>
              {mergedSuggestions.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  style={styles.suggestionItem}
                  onPress={async () => {
                    await AsyncStorage.setItem(
                      'goals360_habit_suggestions',
                      JSON.stringify({
                        suggestions: mergedSuggestions,
                        personaType,
                        message: 'Quick add from adaptive suggestions',
                      })
                    );
                    router.push('/add-habit');
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.suggestionIcon}>{s.icon}</Text>
                  <Text style={styles.suggestionName} numberOfLines={1}>
                    {s.title}
                  </Text>
                  <Text style={styles.suggestionCat}>{s.category}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ── Today's Habits ── */}
        <HabitProgressCard
          habits={habitProgressData}
          onSetProgress={handleSetProgress}
          onComplete={handleComplete}
          onNeedHelp={handleNeedHelp}
        />

        {/* ── Goal Progress ── */}
        {primaryGoal && goalMetrics && (
          <View style={[styles.goalCard, goalMetrics.status === 'at_risk' && styles.goalCardRisk]}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalTitle} numberOfLines={1}>
                {primaryGoal.title}
              </Text>
              <View
                style={[
                  styles.goalStatusBadge,
                  goalMetrics.status === 'at_risk'
                    ? styles.goalStatusRisk
                    : styles.goalStatusGood,
                ]}
              >
                <Text style={styles.goalStatusText}>
                  {goalMetrics.status === 'at_risk' ? '⚠ At Risk' : '✓ On Track'}
                </Text>
              </View>
            </View>

            {/* Progress bar */}
            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${goalMetrics.progressPercent}%`,
                    backgroundColor:
                      goalMetrics.status === 'at_risk' ? colors.warning : colors.success,
                  },
                ]}
              />
            </View>
            <View style={styles.goalMeta}>
              <Text style={styles.goalMetaText}>{goalMetrics.progressPercent}% complete</Text>
              <Text style={styles.goalMetaText}>{goalMetrics.probability}% probability</Text>
            </View>

            <Text style={styles.goalSuggestion}>{goalMetrics.suggestion}</Text>

            {goalMetrics.status === 'at_risk' && (
              <TouchableOpacity style={styles.adjustBtn} onPress={handleAdjustGoal} activeOpacity={0.8}>
                <Text style={styles.adjustBtnText}>Auto-split Goal</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* ── Completed Today ── */}
        {completedItems.length > 0 && (
          <View style={styles.completedCard}>
            <Text style={styles.completedTitle}>Completed Today 🎉</Text>
            {completedItems.map((item) => (
              <View key={item.id} style={styles.completedRow}>
                <Text style={styles.completedIcon}>{item.icon}</Text>
                <Text style={styles.completedName}>{item.title}</Text>
                <View style={styles.completedCheck}>
                  <Text style={{ color: colors.success, fontSize: 12 }}>✓</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ── Daily Snapshot ── */}
        <View style={styles.snapshotCard}>
          <Text style={styles.snapshotTitle}>Daily Snapshot</Text>
          <View style={styles.snapshotRow}>
            <View style={styles.snapshotStat}>
              <Text style={styles.snapshotValue}>{todayCompletion}%</Text>
              <Text style={styles.snapshotLabel}>Completion</Text>
              {snapshotDelta !== 0 && (
                <Text
                  style={[
                    styles.snapshotDelta,
                    { color: snapshotDelta > 0 ? colors.success : colors.destructive },
                  ]}
                >
                  {snapshotDelta > 0 ? '+' : ''}
                  {snapshotDelta}%
                </Text>
              )}
            </View>
            <View style={styles.snapshotDivider} />
            <View style={styles.snapshotStat}>
              <Text style={styles.snapshotValue}>{completedCount}</Text>
              <Text style={styles.snapshotLabel}>Habits Done</Text>
            </View>
            <View style={styles.snapshotDivider} />
            <View style={styles.snapshotStat}>
              <Text style={styles.snapshotValue}>{totalHabits}</Text>
              <Text style={styles.snapshotLabel}>Total Habits</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.snapshotLink}
            onPress={() => router.push('/(tabs)/insights')}
            activeOpacity={0.7}
          >
            <Text style={styles.snapshotLinkText}>View Detailed Insights →</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: spacing.base,
    gap: spacing.md,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    backgroundColor: 'rgba(42, 18, 61, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  headerLeft: { flex: 1, minWidth: 0 },
  greetingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  greeting: { color: colors.text, fontSize: typography.md, fontWeight: '600' },
  moodDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    shadowOpacity: 0.6,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
  insight: {
    color: colors.textMuted,
    fontSize: typography.xs,
    marginTop: 2,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBtn: { position: 'relative' },
  avatarEmoji: { fontSize: 16 },
  badgeDot: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.warning,
    borderWidth: 1,
    borderColor: colors.background,
  },

  // Badge banner
  badgeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: spacing.base,
  },
  badgeBannerIcon: {
    width: 42,
    height: 42,
    borderRadius: radii.lg,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeBannerTitle: {
    color: colors.text,
    fontSize: typography.sm,
    fontWeight: '600',
  },
  badgeBannerName: { color: colors.textMuted, fontSize: typography.xs },
  badgeBannerDismiss: {
    color: '#fde68a',
    fontSize: typography.xs,
    fontWeight: '600',
  },

  // Life Ring
  ringSection: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  ringLabel: {
    color: colors.text,
    fontSize: typography.sm,
    fontWeight: '600',
    marginTop: spacing.md,
  },

  // Quick Actions
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  actionCard: {
    width: '48%',
    borderRadius: radii.xl,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: spacing.md,
    gap: 4,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  actionTitle: {
    color: colors.text,
    fontSize: typography.sm,
    fontWeight: '700',
  },
  actionDesc: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 15,
  },

  // Suggestions
  suggestionsCard: {
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: spacing.md,
  },
  suggestionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  suggestionsTitle: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  suggestionsTitleText: {
    color: colors.text,
    fontSize: typography.xs,
    fontWeight: '600',
  },
  seeAll: { color: colors.primary, fontSize: typography.xs, fontWeight: '600' },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  suggestionItem: {
    width: '48%',
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: spacing.md - 2,
  },
  suggestionIcon: { fontSize: 20, marginBottom: 4 },
  suggestionName: {
    color: colors.text,
    fontSize: typography.xs,
    fontWeight: '600',
  },
  suggestionCat: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 1,
    textTransform: 'capitalize',
  },

  // Goal Card
  goalCard: {
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: spacing.base,
    gap: spacing.sm,
  },
  goalCardRisk: {
    borderColor: 'rgba(245, 158, 11, 0.3)',
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  goalTitle: {
    color: colors.text,
    fontSize: typography.base,
    fontWeight: '600',
    flex: 1,
  },
  goalStatusBadge: {
    borderRadius: radii.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  goalStatusGood: { backgroundColor: 'rgba(34, 197, 94, 0.15)' },
  goalStatusRisk: { backgroundColor: 'rgba(245, 158, 11, 0.15)' },
  goalStatusText: { color: colors.text, fontSize: 10, fontWeight: '600' },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  progressBarFill: { height: '100%', borderRadius: 3 },
  goalMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  goalMetaText: { color: colors.textMuted, fontSize: typography.xs },
  goalSuggestion: {
    color: colors.textMuted,
    fontSize: typography.xs,
    lineHeight: 18,
  },
  adjustBtn: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  adjustBtnText: {
    color: colors.warning,
    fontSize: typography.sm,
    fontWeight: '600',
  },

  // Completed Today
  completedCard: {
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
    backgroundColor: 'rgba(34, 197, 94, 0.05)',
    padding: spacing.base,
    gap: spacing.sm,
  },
  completedTitle: {
    color: colors.text,
    fontSize: typography.sm,
    fontWeight: '600',
  },
  completedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  completedIcon: { fontSize: 18 },
  completedName: { color: colors.text, fontSize: typography.sm, flex: 1 },
  completedCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Daily Snapshot
  snapshotCard: {
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: spacing.base,
    gap: spacing.md,
  },
  snapshotTitle: {
    color: colors.text,
    fontSize: typography.sm,
    fontWeight: '600',
  },
  snapshotRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  snapshotStat: { flex: 1, alignItems: 'center', gap: 2 },
  snapshotValue: {
    color: colors.text,
    fontSize: typography.xl,
    fontWeight: '700',
  },
  snapshotLabel: { color: colors.textMuted, fontSize: 10 },
  snapshotDelta: { fontSize: 10, fontWeight: '600' },
  snapshotDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  snapshotLink: { alignItems: 'center' },
  snapshotLinkText: {
    color: colors.primary,
    fontSize: typography.xs,
    fontWeight: '600',
  },
});
