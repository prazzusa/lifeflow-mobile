import React, { useState, useEffect, useMemo } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ArrowLeft, ArrowRight, Check, Sparkles,
  Dumbbell, Brain, Briefcase, Scale, Heart,
  Zap, Clock, Moon, Target, Focus, Calendar,
  TrendingUp, BookOpen, Flame, Coffee, Compass,
} from 'lucide-react-native';
import { supabase } from '@/supabase/client';
import { colors, radii, spacing, typography } from '@/lib/theme';

// ─── Types ────────────────────────────────────────────────────────────────────

type FocusArea       = 'fitness' | 'personal' | 'professional';
type FitnessGoal     = 'lose' | 'maintain' | 'gain' | 'health' | 'consistency';
type ActivityLevel   = 'sedentary' | 'light' | 'moderate' | 'very';
type Experience      = 'fresh' | 'struggled' | 'rebuilding' | 'disciplined';
type TimeCommitment  = '5min' | '10min' | '20min' | 'flexible';
type PersonalHabit   = 'sleep' | 'morning' | 'stress' | 'screentime';
type ProfessionalHabit = 'focus' | 'schedule' | 'goals' | 'skills';
type Commitment      = 'yes' | 'small';
type WorkStyle       = 'structured' | 'flexible' | 'mixed';
type EnergyPattern   = 'morning' | 'afternoon' | 'evening' | 'variable';

type StepType =
  | 'welcome' | 'focus' | 'fitnessGoal' | 'height'
  | 'currentWeight' | 'targetWeight' | 'activityLevel'
  | 'personalHabits' | 'professionalHabits' | 'workStyle'
  | 'energyPattern' | 'experience' | 'timeCommitment'
  | 'commitment' | 'encouragement';

interface OnboardingState {
  focusAreas: FocusArea[];
  fitnessGoal: FitnessGoal | null;
  height: { value: number; unit: 'cm' | 'ft' };
  currentWeight: { value: number; unit: 'kg' | 'lb' };
  targetWeight: { value: number; unit: 'kg' | 'lb' };
  activityLevel: ActivityLevel | null;
  experience: Experience | null;
  timeCommitment: TimeCommitment | null;
  personalHabits: PersonalHabit[];
  professionalHabits: ProfessionalHabit[];
  commitment: Commitment | null;
  workStyle: WorkStyle | null;
  energyPattern: EnergyPattern | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SKIPPABLE: StepType[] = [
  'height', 'currentWeight', 'targetWeight', 'activityLevel',
  'personalHabits', 'professionalHabits', 'workStyle', 'energyPattern',
];

const STORAGE_KEY = 'goals360_onboarding_progress';

const initialState: OnboardingState = {
  focusAreas: [], fitnessGoal: null,
  height: { value: 170, unit: 'cm' },
  currentWeight: { value: 70, unit: 'kg' },
  targetWeight: { value: 65, unit: 'kg' },
  activityLevel: null, experience: null, timeCommitment: null,
  personalHabits: [], professionalHabits: [],
  commitment: null, workStyle: null, energyPattern: null,
};

// ─── Supabase profile save (retained exactly from web) ────────────────────────

async function saveProfileToDatabase(userId: string, s: OnboardingState) {
  const hasFitness = s.focusAreas.includes('fitness');
  const profileData = {
    user_id: userId,
    focus_areas: s.focusAreas,
    fitness_goal: s.fitnessGoal ?? null,
    height_value: hasFitness ? s.height.value : null,
    height_unit: hasFitness ? s.height.unit : 'cm',
    current_weight_value: hasFitness ? s.currentWeight.value : null,
    current_weight_unit: hasFitness ? s.currentWeight.unit : 'kg',
    target_weight_value: hasFitness ? s.targetWeight.value : null,
    target_weight_unit: hasFitness ? s.targetWeight.unit : 'kg',
    activity_level: s.activityLevel ?? null,
    experience: s.experience ?? null,
    time_commitment: s.timeCommitment ?? null,
    personal_habits: s.personalHabits ?? [],
    professional_habits: s.professionalHabits ?? [],
    commitment: s.commitment ?? null,
  };

  const { data: existing } = await supabase
    .from('profiles').select('id').eq('user_id', userId).single();

  if (existing) {
    const { error } = await supabase.from('profiles').update(profileData).eq('user_id', userId);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('profiles').insert(profileData);
    if (error) throw error;
  }
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function OnboardingScreen() {
  const [stepIndex, setStepIndex] = useState(0);
  const [state, setState]         = useState<OnboardingState>(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [showResume, setShowResume] = useState(false);
  const [savedProgress, setSavedProgress] = useState<{ stepIndex: number; state: OnboardingState } | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setAuthUserId(user.id);
    });
    (async () => {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw);
        if (Date.now() - parsed.savedAt < 24 * 60 * 60 * 1000 && parsed.stepIndex > 0) {
          setSavedProgress(parsed);
          setShowResume(true);
        }
      } catch { /* stale */ }
    })();
  }, []);

  // Persist progress
  useEffect(() => {
    if (stepIndex > 0) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ stepIndex, state, savedAt: Date.now() }));
    }
  }, [stepIndex, state]);

  // Dynamic step list based on focus areas
  const steps: StepType[] = useMemo(() => {
    const base: StepType[] = ['welcome', 'focus'];
    const hasFitness      = state.focusAreas.includes('fitness');
    const hasPersonal     = state.focusAreas.includes('personal');
    const hasProfessional = state.focusAreas.includes('professional');

    if (state.focusAreas.length === 0) {
      return [...base, 'experience', 'timeCommitment', 'commitment', 'encouragement'];
    }
    if (hasFitness) base.push('fitnessGoal', 'height', 'currentWeight', 'targetWeight', 'activityLevel');
    if (hasPersonal) base.push('personalHabits');
    if (hasProfessional) base.push('professionalHabits', 'workStyle', 'energyPattern');
    base.push('experience', 'timeCommitment', 'commitment', 'encouragement');
    return base;
  }, [state.focusAreas]);

  const currentStep = steps[Math.min(stepIndex, steps.length - 1)];
  const totalSteps  = steps.length;
  const progress    = ((stepIndex + 1) / totalSteps) * 100;
  const isSkippable = SKIPPABLE.includes(currentStep);

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 'welcome':       return true;
      case 'focus':         return state.focusAreas.length > 0;
      case 'fitnessGoal':   return state.fitnessGoal !== null;
      case 'height':        return state.height.value > 0;
      case 'currentWeight': return state.currentWeight.value > 0;
      case 'targetWeight':  return state.targetWeight.value > 0;
      case 'activityLevel': return state.activityLevel !== null;
      case 'experience':    return state.experience !== null;
      case 'timeCommitment':return state.timeCommitment !== null;
      case 'personalHabits':return state.personalHabits.length > 0;
      case 'professionalHabits': return state.professionalHabits.length > 0;
      case 'workStyle':     return state.workStyle !== null;
      case 'energyPattern': return state.energyPattern !== null;
      case 'commitment':    return state.commitment !== null;
      case 'encouragement': return true;
      default: return false;
    }
  };

  const handleNext = async () => {
    Vibration.vibrate(20);
    if (stepIndex < totalSteps - 1) {
      setStepIndex(i => i + 1);
      return;
    }
    // Last step — complete onboarding
    if (!authUserId) return;
    setIsLoading(true);
    try {
      await saveProfileToDatabase(authUserId, state);
      await AsyncStorage.setItem('goals360_preferences', JSON.stringify(state));
      await AsyncStorage.setItem('goals360_onboarded', 'true');
      await AsyncStorage.removeItem(STORAGE_KEY);
      router.replace('/(tabs)');
    } catch (err) {
      console.error('Onboarding save error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (stepIndex > 0) setStepIndex(i => i - 1);
    else router.back();
  };

  const handleSkip = () => {
    if (stepIndex < totalSteps - 1) setStepIndex(i => i + 1);
  };

  const update = (partial: Partial<OnboardingState>) =>
    setState(prev => ({ ...prev, ...partial }));

  const isLastStep = stepIndex === totalSteps - 1;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Resume prompt */}
      {showResume && (
        <View style={styles.resumeOverlay}>
          <View style={styles.resumeCard}>
            <Text style={styles.resumeTitle}>Continue where you left off?</Text>
            <Text style={styles.resumeBody}>We saved your progress. Want to pick up from step {(savedProgress?.stepIndex ?? 0) + 1}?</Text>
            <View style={styles.resumeActions}>
              <TouchableOpacity style={styles.resumeSecondary} onPress={() => setShowResume(false)} activeOpacity={0.8}>
                <Text style={styles.resumeSecondaryText}>Start fresh</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.resumePrimary}
                onPress={() => {
                  if (savedProgress) { setStepIndex(savedProgress.stepIndex); setState(savedProgress.state); }
                  setShowResume(false);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.resumePrimaryText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      {/* Nav row */}
      <View style={styles.navRow}>
        <TouchableOpacity style={styles.navBtn} onPress={handleBack} activeOpacity={0.7}>
          <ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.stepCount}>{stepIndex + 1} / {totalSteps}</Text>
        {isSkippable ? (
          <TouchableOpacity onPress={handleSkip} activeOpacity={0.7}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 60 }} />
        )}
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <StepContent step={currentStep} state={state} update={update} />

          {/* CTA */}
          <TouchableOpacity
            style={[styles.cta, (!canProceed() || isLoading) && styles.ctaDisabled]}
            onPress={handleNext}
            disabled={!canProceed() || isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.ctaText}>{isLastStep ? 'Get Started' : 'Continue'}</Text>
                {isLastStep ? <Check size={18} color="#fff" /> : <ArrowRight size={18} color="#fff" />}
              </>
            )}
          </TouchableOpacity>
          <View style={{ height: 32 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Step Content ─────────────────────────────────────────────────────────────

function StepContent({
  step, state, update,
}: {
  step: StepType;
  state: OnboardingState;
  update: (p: Partial<OnboardingState>) => void;
}) {
  switch (step) {
    case 'welcome':
      return <WelcomeStep />;
    case 'focus':
      return <FocusStep state={state} update={update} />;
    case 'fitnessGoal':
      return <ChoiceStep<typeof state.fitnessGoal>
        title="What's your fitness goal?"
        subtitle="We'll tailor your plan around this."
        value={state.fitnessGoal}
        onChange={v => update({ fitnessGoal: v })}
        options={[
          { value: 'lose',        label: 'Lose weight',       icon: '🔥' },
          { value: 'maintain',    label: 'Maintain weight',   icon: '⚖️' },
          { value: 'gain',        label: 'Build muscle',      icon: '💪' },
          { value: 'health',      label: 'General health',    icon: '❤️' },
          { value: 'consistency', label: 'Stay consistent',   icon: '📅' },
        ]}
      />;
    case 'height':
      return <MeasureStep
        title="What's your height?"
        value={state.height.value}
        unit={state.height.unit}
        units={['cm', 'ft']}
        onChange={(value, unit) => update({ height: { value, unit: unit as 'cm' | 'ft' } })}
      />;
    case 'currentWeight':
      return <MeasureStep
        title="Current weight?"
        value={state.currentWeight.value}
        unit={state.currentWeight.unit}
        units={['kg', 'lb']}
        onChange={(value, unit) => update({ currentWeight: { value, unit: unit as 'kg' | 'lb' } })}
      />;
    case 'targetWeight':
      return <MeasureStep
        title="Target weight?"
        value={state.targetWeight.value}
        unit={state.targetWeight.unit}
        units={['kg', 'lb']}
        onChange={(value, unit) => update({ targetWeight: { value, unit: unit as 'kg' | 'lb' } })}
      />;
    case 'activityLevel':
      return <ChoiceStep<typeof state.activityLevel>
        title="Current activity level?"
        subtitle="Be honest — we'll start from where you are."
        value={state.activityLevel}
        onChange={v => update({ activityLevel: v })}
        options={[
          { value: 'sedentary', label: 'Mostly sitting',    icon: '🪑' },
          { value: 'light',     label: 'Light movement',    icon: '🚶' },
          { value: 'moderate',  label: 'Moderately active', icon: '🏃' },
          { value: 'very',      label: 'Very active',       icon: '⚡' },
        ]}
      />;
    case 'personalHabits':
      return <MultiChoiceStep<PersonalHabit>
        title="Which personal habits matter most?"
        subtitle="Select all that apply."
        values={state.personalHabits}
        onChange={v => update({ personalHabits: v })}
        options={[
          { value: 'sleep',      label: 'Better sleep',     icon: '🌙' },
          { value: 'morning',    label: 'Morning routine',  icon: '☀️' },
          { value: 'stress',     label: 'Stress management',icon: '🧘' },
          { value: 'screentime', label: 'Less screen time', icon: '📵' },
        ]}
      />;
    case 'professionalHabits':
      return <MultiChoiceStep<ProfessionalHabit>
        title="What are your work priorities?"
        subtitle="Select all that apply."
        values={state.professionalHabits}
        onChange={v => update({ professionalHabits: v })}
        options={[
          { value: 'focus',    label: 'Deep focus',       icon: '🎯' },
          { value: 'schedule', label: 'Better planning',  icon: '📋' },
          { value: 'goals',    label: 'Goal setting',     icon: '🏆' },
          { value: 'skills',   label: 'Skill building',   icon: '📚' },
        ]}
      />;
    case 'workStyle':
      return <ChoiceStep<typeof state.workStyle>
        title="How do you prefer to work?"
        value={state.workStyle}
        onChange={v => update({ workStyle: v })}
        options={[
          { value: 'structured', label: 'Structured schedule', icon: '📐' },
          { value: 'flexible',   label: 'Flexible & adaptive', icon: '🌊' },
          { value: 'mixed',      label: 'Mix of both',         icon: '⚖️' },
        ]}
      />;
    case 'energyPattern':
      return <ChoiceStep<typeof state.energyPattern>
        title="When do you do your best work?"
        value={state.energyPattern}
        onChange={v => update({ energyPattern: v })}
        options={[
          { value: 'morning',   label: 'Morning person',  icon: '🌅' },
          { value: 'afternoon', label: 'Afternoon focus', icon: '☀️' },
          { value: 'evening',   label: 'Night owl',       icon: '🌙' },
          { value: 'variable',  label: 'Varies by day',   icon: '🔄' },
        ]}
      />;
    case 'experience':
      return <ChoiceStep<typeof state.experience>
        title="Your experience with habits?"
        subtitle="We'll set the right expectations."
        value={state.experience}
        onChange={v => update({ experience: v })}
        options={[
          { value: 'fresh',       label: 'Just starting',       icon: '🌱' },
          { value: 'struggled',   label: 'Tried, found it hard',icon: '😓' },
          { value: 'rebuilding',  label: 'Rebuilding momentum',  icon: '🔄' },
          { value: 'disciplined', label: 'Pretty consistent',    icon: '💎' },
        ]}
      />;
    case 'timeCommitment':
      return <ChoiceStep<typeof state.timeCommitment>
        title="Daily time you can commit?"
        subtitle="Small steps compound — even 5 minutes matters."
        value={state.timeCommitment}
        onChange={v => update({ timeCommitment: v })}
        options={[
          { value: '5min',    label: '5 min — quick wins', icon: '⚡' },
          { value: '10min',   label: '10 min — steady',    icon: '🎯' },
          { value: '20min',   label: '20 min — dedicated', icon: '💪' },
          { value: 'flexible',label: 'Flexible',           icon: '🌊' },
        ]}
      />;
    case 'commitment':
      return <ChoiceStep<typeof state.commitment>
        title="Ready to commit?"
        subtitle="Consistency over perfection."
        value={state.commitment}
        onChange={v => update({ commitment: v })}
        options={[
          { value: 'yes',   label: "I'm all in",           icon: '🔥' },
          { value: 'small', label: "Small steps for now",  icon: '🌱' },
        ]}
      />;
    case 'encouragement':
      return <EncouragementStep />;
    default:
      return null;
  }
}

// ─── Sub-step components ──────────────────────────────────────────────────────

function WelcomeStep() {
  return (
    <View style={subStyles.center}>
      <Text style={subStyles.bigEmoji}>✨</Text>
      <Text style={subStyles.stepTitle}>Welcome to GOALS360</Text>
      <Text style={subStyles.stepSubtitle}>
        Let's personalize your experience. This takes about 2 minutes and helps us build a plan that actually fits your life.
      </Text>
    </View>
  );
}

function EncouragementStep() {
  return (
    <View style={subStyles.center}>
      <Text style={subStyles.bigEmoji}>🎉</Text>
      <Text style={subStyles.stepTitle}>You're all set!</Text>
      <Text style={subStyles.stepSubtitle}>
        Your personalized plan is ready. Small habits, done consistently, lead to extraordinary results.
      </Text>
    </View>
  );
}

function FocusStep({ state, update }: { state: OnboardingState; update: (p: Partial<OnboardingState>) => void }) {
  const options: { id: FocusArea; label: string; desc: string; color: string; icon: string }[] = [
    { id: 'fitness',      label: 'Fitness',      desc: 'Exercise, nutrition & body goals', color: '#22c55e', icon: '💪' },
    { id: 'personal',     label: 'Personal',     desc: 'Mindfulness, sleep & well-being',  color: '#6366f1', icon: '🧘' },
    { id: 'professional', label: 'Professional', desc: 'Career, focus & productivity',      color: '#a855f7', icon: '🎯' },
  ];

  const toggle = (id: FocusArea) => {
    const current = state.focusAreas;
    update({
      focusAreas: current.includes(id) ? current.filter(a => a !== id) : [...current, id],
    });
  };

  return (
    <View style={subStyles.section}>
      <Text style={subStyles.stepTitle}>What's most important to you?</Text>
      <Text style={subStyles.stepSubtitle}>Pick 1–3 areas to focus on.</Text>
      {options.map(opt => {
        const active = state.focusAreas.includes(opt.id);
        return (
          <TouchableOpacity
            key={opt.id}
            style={[subStyles.focusCard, active && { borderColor: opt.color, backgroundColor: `${opt.color}15` }]}
            onPress={() => toggle(opt.id)}
            activeOpacity={0.8}
          >
            <View style={[subStyles.focusIconWrap, { backgroundColor: `${opt.color}22` }]}>
              <Text style={{ fontSize: 22 }}>{opt.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[subStyles.focusLabel, active && { color: opt.color }]}>{opt.label}</Text>
              <Text style={subStyles.focusDesc}>{opt.desc}</Text>
            </View>
            {active && (
              <View style={[subStyles.checkCircle, { backgroundColor: opt.color }]}>
                <Check size={12} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function ChoiceStep<T extends string | null>({
  title, subtitle, value, onChange, options,
}: {
  title: string;
  subtitle?: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: string; label: string; icon: string }[];
}) {
  return (
    <View style={subStyles.section}>
      <Text style={subStyles.stepTitle}>{title}</Text>
      {subtitle && <Text style={subStyles.stepSubtitle}>{subtitle}</Text>}
      {options.map(opt => {
        const active = value === opt.value;
        return (
          <TouchableOpacity
            key={opt.value}
            style={[subStyles.choiceCard, active && subStyles.choiceCardActive]}
            onPress={() => onChange(opt.value as T)}
            activeOpacity={0.8}
          >
            <Text style={subStyles.choiceIcon}>{opt.icon}</Text>
            <Text style={[subStyles.choiceLabel, active && { color: colors.primary, fontWeight: '700' }]}>
              {opt.label}
            </Text>
            {active && <Check size={16} color={colors.primary} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function MultiChoiceStep<T extends string>({
  title, subtitle, values, onChange, options,
}: {
  title: string;
  subtitle?: string;
  values: T[];
  onChange: (v: T[]) => void;
  options: { value: T; label: string; icon: string }[];
}) {
  const toggle = (v: T) => {
    onChange(values.includes(v) ? values.filter(x => x !== v) : [...values, v]);
  };

  return (
    <View style={subStyles.section}>
      <Text style={subStyles.stepTitle}>{title}</Text>
      {subtitle && <Text style={subStyles.stepSubtitle}>{subtitle}</Text>}
      {options.map(opt => {
        const active = values.includes(opt.value);
        return (
          <TouchableOpacity
            key={opt.value}
            style={[subStyles.choiceCard, active && subStyles.choiceCardActive]}
            onPress={() => toggle(opt.value)}
            activeOpacity={0.8}
          >
            <Text style={subStyles.choiceIcon}>{opt.icon}</Text>
            <Text style={[subStyles.choiceLabel, active && { color: colors.primary, fontWeight: '700' }]}>
              {opt.label}
            </Text>
            {active && <Check size={16} color={colors.primary} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function MeasureStep({
  title, value, unit, units, onChange,
}: {
  title: string;
  value: number;
  unit: string;
  units: string[];
  onChange: (value: number, unit: string) => void;
}) {
  const [raw, setRaw] = useState(String(value));
  const [focused, setFocused] = useState(false);

  return (
    <View style={subStyles.section}>
      <Text style={subStyles.stepTitle}>{title}</Text>
      <View style={subStyles.measureRow}>
        <TextInput
          style={[subStyles.measureInput, focused && subStyles.measureInputFocused]}
          value={raw}
          onChangeText={t => {
            setRaw(t);
            const num = parseFloat(t);
            if (!isNaN(num) && num > 0) onChange(num, unit);
          }}
          keyboardType="numeric"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          selectTextOnFocus
        />
        <View style={subStyles.unitRow}>
          {units.map(u => (
            <TouchableOpacity
              key={u}
              style={[subStyles.unitBtn, unit === u && subStyles.unitBtnActive]}
              onPress={() => onChange(value, u)}
              activeOpacity={0.8}
            >
              <Text style={[subStyles.unitText, unit === u && subStyles.unitTextActive]}>{u}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  // Progress
  progressTrack: { height: 3, backgroundColor: 'rgba(255,255,255,0.08)' },
  progressFill:  { height: '100%', backgroundColor: colors.primary, borderRadius: 2 },

  // Nav
  navRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.base, paddingVertical: spacing.md,
  },
  navBtn: {
    width: 40, height: 40, borderRadius: radii.full,
    backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center',
  },
  stepCount: { color: colors.textMuted, fontSize: typography.sm, fontWeight: '500' },
  skipText:  { color: colors.primary, fontSize: typography.sm, fontWeight: '600', minWidth: 60, textAlign: 'right' },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.base, gap: spacing.xl },

  // CTA
  cta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, backgroundColor: colors.primary,
    height: 56, borderRadius: radii.xl,
  },
  ctaDisabled: { opacity: 0.4 },
  ctaText: { color: '#fff', fontSize: typography.md, fontWeight: '700' },

  // Resume overlay
  resumeOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center', justifyContent: 'center',
    zIndex: 100, padding: spacing.xl,
  },
  resumeCard: {
    backgroundColor: colors.card, borderRadius: radii.xl, padding: spacing.xl,
    borderWidth: 1, borderColor: colors.cardBorder, gap: spacing.md, width: '100%',
  },
  resumeTitle: { color: colors.text, fontSize: typography.md, fontWeight: '700' },
  resumeBody:  { color: colors.textMuted, fontSize: typography.sm, lineHeight: 20 },
  resumeActions: { flexDirection: 'row', gap: spacing.sm },
  resumeSecondary: {
    flex: 1, paddingVertical: spacing.md, borderRadius: radii.lg,
    backgroundColor: 'rgba(255,255,255,0.07)', alignItems: 'center',
  },
  resumeSecondaryText: { color: colors.textMuted, fontWeight: '600' },
  resumePrimary: {
    flex: 1, paddingVertical: spacing.md, borderRadius: radii.lg,
    backgroundColor: colors.primary, alignItems: 'center',
  },
  resumePrimaryText: { color: '#fff', fontWeight: '700' },
});

const subStyles = StyleSheet.create({
  center: { alignItems: 'center', paddingVertical: spacing['2xl'], gap: spacing.lg },
  bigEmoji: { fontSize: 56 },
  section: { gap: spacing.md },
  stepTitle: {
    color: colors.text, fontSize: typography['2xl'], fontWeight: '700',
    letterSpacing: -0.4, lineHeight: 32,
  },
  stepSubtitle: { color: colors.textMuted, fontSize: typography.sm, lineHeight: 20 },

  // Focus cards
  focusCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: radii.xl,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    padding: spacing.base,
  },
  focusIconWrap: { width: 48, height: 48, borderRadius: radii.lg, alignItems: 'center', justifyContent: 'center' },
  focusLabel: { color: colors.text, fontSize: typography.base, fontWeight: '600' },
  focusDesc:  { color: colors.textMuted, fontSize: typography.xs, marginTop: 2 },
  checkCircle: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },

  // Choice cards
  choiceCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: radii.lg,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    paddingVertical: spacing.md, paddingHorizontal: spacing.base,
  },
  choiceCardActive: {
    borderColor: colors.primary, backgroundColor: 'rgba(99,102,241,0.1)',
  },
  choiceIcon:  { fontSize: 22 },
  choiceLabel: { flex: 1, color: colors.text, fontSize: typography.base, fontWeight: '500' },

  // Measure
  measureRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  measureInput: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: radii.lg,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: spacing.base, height: 64,
    color: colors.text, fontSize: typography['3xl'], fontWeight: '700', textAlign: 'center',
  },
  measureInputFocused: { borderColor: colors.primary, backgroundColor: 'rgba(99,102,241,0.1)' },
  unitRow: { flexDirection: 'column', gap: spacing.sm },
  unitBtn: {
    paddingHorizontal: spacing.base, paddingVertical: spacing.sm,
    borderRadius: radii.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  unitBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  unitText: { color: colors.textMuted, fontSize: typography.sm, fontWeight: '600' },
  unitTextActive: { color: '#fff' },
});
