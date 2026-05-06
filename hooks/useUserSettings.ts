// Pure Supabase queries — no localStorage used in original. Retained exactly as-is.
// Only change: import path for supabase client.
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/supabase/client';

export interface UserSettings {
  theme: 'dark' | 'system';
  language: string;
  textSize: 'small' | 'medium' | 'large';
  highContrast: boolean;
  defaultTab: string;
  haptics: boolean;
  sounds: boolean;
  healthIntegrations: boolean;
  appleHealthConnected: boolean;
  notificationHabits: boolean;
  notificationWorkouts: boolean;
  notificationReflections: boolean;
  notificationTips: boolean;
  notificationIntensity: string;
  customExercises: string[];
  alcoholGender: 'male' | 'female';
}

const defaultSettings: UserSettings = {
  theme: 'dark',
  language: 'en',
  textSize: 'medium',
  highContrast: false,
  defaultTab: 'today',
  haptics: true,
  sounds: true,
  healthIntegrations: true,
  appleHealthConnected: false,
  notificationHabits: true,
  notificationWorkouts: true,
  notificationReflections: true,
  notificationTips: true,
  notificationIntensity: 'balanced',
  customExercises: [],
  alcoholGender: 'male',
};

const dbKeyMap: Record<string, string> = {
  textSize: 'text_size',
  highContrast: 'high_contrast',
  defaultTab: 'default_tab',
  healthIntegrations: 'health_integrations',
  appleHealthConnected: 'apple_health_connected',
  notificationHabits: 'notification_habits',
  notificationWorkouts: 'notification_workouts',
  notificationReflections: 'notification_reflections',
  notificationTips: 'notification_tips',
  notificationIntensity: 'notification_intensity',
  customExercises: 'custom_exercises',
  alcoholGender: 'alcohol_gender',
};

export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setIsLoading(false);
        return;
      }

      setUserId(user.id);

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data && !error) {
        setSettings({
          theme: (data.theme as 'dark' | 'system') || 'dark',
          language: data.language || 'en',
          textSize: (data.text_size as 'small' | 'medium' | 'large') || 'medium',
          highContrast: data.high_contrast ?? false,
          defaultTab: data.default_tab || 'today',
          haptics: data.haptics ?? true,
          sounds: data.sounds ?? true,
          healthIntegrations: data.health_integrations ?? true,
          appleHealthConnected: data.apple_health_connected ?? false,
          notificationHabits: data.notification_habits ?? true,
          notificationWorkouts: data.notification_workouts ?? true,
          notificationReflections: data.notification_reflections ?? true,
          notificationTips: data.notification_tips ?? true,
          notificationIntensity: data.notification_intensity || 'balanced',
          customExercises: data.custom_exercises || [],
          alcoholGender: (data.alcohol_gender as 'male' | 'female') || 'male',
        });
      } else if (!data) {
        await supabase.from('user_settings').insert({ user_id: user.id });
      }

      setIsLoading(false);
    };

    loadSettings();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        loadSettings();
      } else {
        setSettings(defaultSettings);
        setUserId(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const updateSetting = useCallback(async <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K],
  ) => {
    if (!userId) return;
    setSettings(prev => ({ ...prev, [key]: value }));
    const dbKey = dbKeyMap[key] || key;
    await supabase
      .from('user_settings')
      .upsert({ user_id: userId, [dbKey]: value }, { onConflict: 'user_id' });
  }, [userId]);

  const updateMultipleSettings = useCallback(async (updates: Partial<UserSettings>) => {
    if (!userId) return;
    setSettings(prev => ({ ...prev, ...updates }));
    const dbUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      dbUpdates[dbKeyMap[key] || key] = value;
    }
    await supabase.from('user_settings').update(dbUpdates).eq('user_id', userId);
  }, [userId]);

  return { settings, isLoading, updateSetting, updateMultipleSettings, isAuthenticated: !!userId };
}
