import { useState, useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/supabase/client';
import type { Session, User } from '@supabase/supabase-js';

const ONBOARDED_KEY = 'goals360_onboarded';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Route guard — runs whenever auth state or route segment changes
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(tabs)';
    const inPublicGroup = segments[0] === 'welcome' || segments[0] === 'auth' || segments[0] === 'onboarding';

    const redirect = async () => {
      if (!user) {
        if (inAuthGroup) router.replace('/welcome');
        return;
      }

      const onboarded = await AsyncStorage.getItem(ONBOARDED_KEY);
      if (onboarded !== 'true') {
        // Double-check DB for returning users who cleared storage
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (profile) {
          await AsyncStorage.setItem(ONBOARDED_KEY, 'true');
          if (!inAuthGroup) router.replace('/(tabs)');
        } else {
          if (segments[0] !== 'onboarding') router.replace('/onboarding');
        }
        return;
      }

      if (!inAuthGroup) router.replace('/(tabs)');
    };

    redirect();
  }, [user, isLoading, segments]);

  const signOut = async () => {
    await AsyncStorage.removeItem(ONBOARDED_KEY);
    await supabase.auth.signOut();
    router.replace('/welcome');
  };

  return { session, user, isLoading, signOut };
}
