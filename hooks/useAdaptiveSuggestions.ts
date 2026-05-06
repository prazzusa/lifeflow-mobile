// Supabase edge function call retained exactly from web app. Only import path changed.
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/supabase/client';

export interface AdaptiveSuggestion {
  id: string;
  title: string;
  icon: string;
  category: 'personal' | 'professional' | 'fitness' | 'financial';
  reason?: string;
  weight?: number;
}

interface AdaptiveSuggestionParams {
  userId?: string | null;
  personaType?: string;
  focusAreas?: string[];
  personalHabits?: string[];
  professionalHabits?: string[];
}

export function useAdaptiveSuggestions(params: AdaptiveSuggestionParams = {}) {
  const [suggestions, setSuggestions] = useState<AdaptiveSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const payload = useMemo(
    () => ({
      user_id: params.userId,
      persona_type: params.personaType,
      focus_areas: params.focusAreas,
      personal_habits: params.personalHabits,
      professional_habits: params.professionalHabits,
    }),
    [
      params.userId,
      params.personaType,
      params.focusAreas,
      params.personalHabits,
      params.professionalHabits,
    ]
  );

  useEffect(() => {
    let isMounted = true;

    const loadSuggestions = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (!payload.user_id) {
          const { data } = await supabase.auth.getUser();
          if (!data.user) {
            if (isMounted) { setSuggestions([]); setIsLoading(false); }
            return;
          }
        }

        const { data, error: invokeError } = await supabase.functions.invoke(
          'generate-adaptive-habit-suggestions',
          { body: payload }
        );

        if (invokeError) throw invokeError;
        if (isMounted) setSuggestions(data?.suggestions || []);
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'Failed to load suggestions.');
          setSuggestions([]);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadSuggestions();
    return () => { isMounted = false; };
  }, [payload]);

  return { suggestions, isLoading, error };
}
