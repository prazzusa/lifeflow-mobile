// Supabase logic retained exactly from web app. Presentation layer only changed (import path).
import { useEffect, useState } from 'react';
import { supabase } from '@/supabase/client';

export interface GoalRecord {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  goal_type?: string | null;
  target_value: number;
  current_value: number;
  unit: string | null;
  status: string;
  start_date: string;
  end_date: string | null;
  completed?: boolean;
  completed_at?: string | null;
  adjusted_target_value: number | null;
  adjustment_reason: string | null;
  parent_goal_id: string | null;
}

export function useGoals() {
  const [goals, setGoals] = useState<GoalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchGoals = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session.session?.user) {
          if (isMounted) setGoals([]);
          return;
        }

        const { data, error } = await supabase
          .from('goals')
          .select(
            'id, title, description, category, goal_type, target_value, current_value, unit, status, start_date, end_date, completed, completed_at, adjusted_target_value, adjustment_reason, parent_goal_id'
          )
          .eq('user_id', session.session.user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (isMounted) setGoals((data || []) as GoalRecord[]);
      } catch (err: any) {
        if (isMounted) setError(err?.message || 'Unable to load goals.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchGoals();
    return () => { isMounted = false; };
  }, []);

  return { goals, isLoading, error };
}
