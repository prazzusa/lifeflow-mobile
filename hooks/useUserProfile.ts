// Presentation layer only: localStorage → AsyncStorage. All Supabase logic retained as-is.
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/supabase/client';

export interface UserProfile {
  focusAreas: string[];
  fitnessGoal: string | null;
  heightValue: number | null;
  heightUnit: string | null;
  currentWeightValue: number | null;
  currentWeightUnit: string | null;
  targetWeightValue: number | null;
  targetWeightUnit: string | null;
  activityLevel: string | null;
  experience: string | null;
  timeCommitment: string | null;
  personalHabits: string[];
  professionalHabits: string[];
  commitment: string | null;
  locationEnabled: boolean;
  location: any | null;
  themeMode: string | null;
  accentColor: string | null;
  aiTone: string | null;
  focusModeEnabled: boolean;
  healthIntegrationEnabled: boolean;
  nutritionIntegrationEnabled: boolean;
  personaOverride: string | null;
}

const defaultProfile: UserProfile = {
  focusAreas: [],
  fitnessGoal: null,
  heightValue: null,
  heightUnit: null,
  currentWeightValue: null,
  currentWeightUnit: null,
  targetWeightValue: null,
  targetWeightUnit: null,
  activityLevel: null,
  experience: null,
  timeCommitment: null,
  personalHabits: [],
  professionalHabits: [],
  commitment: null,
  locationEnabled: false,
  location: null,
  themeMode: null,
  accentColor: null,
  aiTone: null,
  focusModeEnabled: false,
  healthIntegrationEnabled: true,
  nutritionIntegrationEnabled: true,
  personaOverride: null,
};

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const loadFromDatabase = async () => {
      // First hydrate from AsyncStorage for instant display
      try {
        const [savedPrefs, savedProfilePrefs] = await Promise.all([
          AsyncStorage.getItem('goals360_preferences'),
          AsyncStorage.getItem('goals360_profile_prefs'),
        ]);

        if (savedPrefs || savedProfilePrefs) {
          const parsed = savedPrefs ? JSON.parse(savedPrefs) : {};
          const parsedProfilePrefs = savedProfilePrefs ? JSON.parse(savedProfilePrefs) : {};
          setProfile({
            focusAreas: parsed.focusAreas || [],
            fitnessGoal: parsed.fitnessGoal || null,
            heightValue: parsed.height?.value || null,
            heightUnit: parsed.height?.unit || null,
            currentWeightValue: parsed.currentWeight?.value || null,
            currentWeightUnit: parsed.currentWeight?.unit || null,
            targetWeightValue: parsed.targetWeight?.value || null,
            targetWeightUnit: parsed.targetWeight?.unit || null,
            activityLevel: parsed.activityLevel || null,
            experience: parsed.experience || null,
            timeCommitment: parsed.timeCommitment || null,
            personalHabits: parsed.personalHabits || [],
            professionalHabits: parsed.professionalHabits || [],
            commitment: parsed.commitment || null,
            locationEnabled: parsedProfilePrefs.locationEnabled ?? false,
            location: parsedProfilePrefs.location ?? null,
            themeMode: parsedProfilePrefs.themeMode || null,
            accentColor: parsedProfilePrefs.accentColor || null,
            aiTone: parsedProfilePrefs.aiTone || null,
            focusModeEnabled: parsedProfilePrefs.focusModeEnabled ?? false,
            healthIntegrationEnabled: parsedProfilePrefs.healthIntegrationEnabled ?? true,
            nutritionIntegrationEnabled: parsedProfilePrefs.nutritionIntegrationEnabled ?? true,
            personaOverride: parsedProfilePrefs.personaOverride || null,
          });
        }
      } catch (e) {
        console.error('Failed to parse saved preferences:', e);
      }

      // Then sync from Supabase (source of truth)
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        setIsAuthenticated(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (data && !error) {
          setProfile({
            focusAreas: data.focus_areas || [],
            fitnessGoal: data.fitness_goal,
            heightValue: data.height_value,
            heightUnit: data.height_unit,
            currentWeightValue: data.current_weight_value,
            currentWeightUnit: data.current_weight_unit,
            targetWeightValue: data.target_weight_value,
            targetWeightUnit: data.target_weight_unit,
            activityLevel: data.activity_level,
            experience: data.experience,
            timeCommitment: data.time_commitment,
            personalHabits: data.personal_habits || [],
            professionalHabits: data.professional_habits || [],
            commitment: data.commitment,
            locationEnabled: data.location_enabled ?? false,
            location: data.location ?? null,
            themeMode: data.theme_mode ?? null,
            accentColor: data.accent_color ?? null,
            aiTone: data.ai_tone ?? null,
            focusModeEnabled: data.focus_mode_enabled ?? false,
            healthIntegrationEnabled: data.health_integration_enabled ?? true,
            nutritionIntegrationEnabled: data.nutrition_integration_enabled ?? true,
            personaOverride: data.persona_override ?? null,
          });
        }
      }

      setIsLoading(false);
    };

    loadFromDatabase();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user);
      if (session?.user) loadFromDatabase();
    });

    return () => subscription.unsubscribe();
  }, []);

  const hasFitness = profile.focusAreas.includes('fitness');
  const hasPersonal = profile.focusAreas.includes('personal');
  const hasProfessional = profile.focusAreas.includes('professional');

  return { profile, isLoading, isAuthenticated, hasFitness, hasPersonal, hasProfessional };
}
