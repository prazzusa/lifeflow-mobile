export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      alcohol_logs: {
        Row: {
          consumed_at: string | null
          created_at: string
          drink_type: string
          drinks: number
          id: string
          log_date: string
          note: string | null
          user_id: string
        }
        Insert: {
          consumed_at?: string | null
          created_at?: string
          drink_type?: string
          drinks?: number
          id?: string
          log_date?: string
          note?: string | null
          user_id: string
        }
        Update: {
          consumed_at?: string | null
          created_at?: string
          drink_type?: string
          drinks?: number
          id?: string
          log_date?: string
          note?: string | null
          user_id?: string
        }
        Relationships: []
      }
      badges: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          requirement_type: string | null
          requirement_value: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          requirement_type?: string | null
          requirement_value?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          requirement_type?: string | null
          requirement_value?: number | null
        }
        Relationships: []
      }
      check_ins: {
        Row: {
          check_in_date: string
          created_at: string
          energy_tags: string[] | null
          id: string
          mood: string
          reflection: string | null
          user_id: string
        }
        Insert: {
          check_in_date?: string
          created_at?: string
          energy_tags?: string[] | null
          id?: string
          mood: string
          reflection?: string | null
          user_id: string
        }
        Update: {
          check_in_date?: string
          created_at?: string
          energy_tags?: string[] | null
          id?: string
          mood?: string
          reflection?: string | null
          user_id?: string
        }
        Relationships: []
      }
      favorite_foods: {
        Row: {
          base_calories: number
          base_serving: number
          carbs: number
          created_at: string
          emoji: string
          fat: number
          id: string
          name: string
          protein: number
          serving_unit: string
          user_id: string
        }
        Insert: {
          base_calories: number
          base_serving?: number
          carbs?: number
          created_at?: string
          emoji?: string
          fat?: number
          id?: string
          name: string
          protein?: number
          serving_unit?: string
          user_id: string
        }
        Update: {
          base_calories?: number
          base_serving?: number
          carbs?: number
          created_at?: string
          emoji?: string
          fat?: number
          id?: string
          name?: string
          protein?: number
          serving_unit?: string
          user_id?: string
        }
        Relationships: []
      }
      food_logs: {
        Row: {
          created_at: string
          foods: Json
          id: string
          log_date: string
          meal_type: string
          total_calories: number
          user_id: string
        }
        Insert: {
          created_at?: string
          foods?: Json
          id?: string
          log_date?: string
          meal_type: string
          total_calories?: number
          user_id: string
        }
        Update: {
          created_at?: string
          foods?: Json
          id?: string
          log_date?: string
          meal_type?: string
          total_calories?: number
          user_id?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          adjusted_target_value: number | null
          adjustment_reason: string | null
          category: string
          completed: boolean
          completed_at: string | null
          created_at: string
          current_value: number
          description: string | null
          end_date: string
          goal_type: string
          id: string
          parent_goal_id: string | null
          start_date: string
          status: string | null
          target_value: number
          title: string
          unit: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          adjusted_target_value?: number | null
          adjustment_reason?: string | null
          category?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          current_value?: number
          description?: string | null
          end_date: string
          goal_type?: string
          id?: string
          parent_goal_id?: string | null
          start_date?: string
          status?: string | null
          target_value?: number
          title: string
          unit?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          adjusted_target_value?: number | null
          adjustment_reason?: string | null
          category?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          current_value?: number
          description?: string | null
          end_date?: string
          goal_type?: string
          id?: string
          parent_goal_id?: string | null
          start_date?: string
          status?: string | null
          target_value?: number
          title?: string
          unit?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_parent_goal_id_fkey"
            columns: ["parent_goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      habit_events: {
        Row: {
          created_at: string
          event_date: string
          event_time: string | null
          event_type: string
          habit_id: string | null
          habit_title: string
          id: string
          time_of_day: string | null
          user_id: string
          weekday: string | null
        }
        Insert: {
          created_at?: string
          event_date?: string
          event_time?: string | null
          event_type?: string
          habit_id?: string | null
          habit_title: string
          id?: string
          time_of_day?: string | null
          user_id: string
          weekday?: string | null
        }
        Update: {
          created_at?: string
          event_date?: string
          event_time?: string | null
          event_type?: string
          habit_id?: string | null
          habit_title?: string
          id?: string
          time_of_day?: string | null
          user_id?: string
          weekday?: string | null
        }
        Relationships: []
      }
      habits: {
        Row: {
          category: string
          completed: boolean
          completed_at: string | null
          created_at: string
          icon: string
          id: string
          note: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          icon?: string
          id?: string
          note?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          icon?: string
          id?: string
          note?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      imported_activities: {
        Row: {
          activity_date: string
          activity_type: string
          created_at: string
          id: string
          source: string | null
          unit: string | null
          user_id: string
          value: number | null
        }
        Insert: {
          activity_date?: string
          activity_type: string
          created_at?: string
          id?: string
          source?: string | null
          unit?: string | null
          user_id: string
          value?: number | null
        }
        Update: {
          activity_date?: string
          activity_type?: string
          created_at?: string
          id?: string
          source?: string | null
          unit?: string | null
          user_id?: string
          value?: number | null
        }
        Relationships: []
      }
      integration_tokens: {
        Row: {
          access_token: string | null
          created_at: string
          expires_at: string | null
          id: string
          provider: string
          refresh_token: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          provider: string
          refresh_token?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          provider?: string
          refresh_token?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      micro_challenge_participation: {
        Row: {
          challenge_id: string | null
          completed_at: string | null
          created_at: string
          id: string
          notification_id: string | null
          responded_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          challenge_id?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          notification_id?: string | null
          responded_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          challenge_id?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          notification_id?: string | null
          responded_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      narratives: {
        Row: {
          content: string
          created_at: string
          id: string
          mood_summary: Json | null
          narrative_month: string
          narrative_type: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          mood_summary?: Json | null
          narrative_month: string
          narrative_type?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          mood_summary?: Json | null
          narrative_month?: string
          narrative_type?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          archived: boolean
          created_at: string
          id: string
          message: string | null
          metadata: Json | null
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          archived?: boolean
          created_at?: string
          id?: string
          message?: string | null
          metadata?: Json | null
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          archived?: boolean
          created_at?: string
          id?: string
          message?: string | null
          metadata?: Json | null
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          accent_color: string | null
          activity_level: string | null
          ai_tone: string | null
          calorie_goal: number | null
          carbs_goal: number | null
          commitment: string | null
          created_at: string
          current_ecw: number | null
          current_pbf: number | null
          current_smm: number | null
          current_weight_unit: string | null
          current_weight_value: number | null
          experience: string | null
          fat_goal: number | null
          fitness_goal: string | null
          focus_areas: string[] | null
          focus_mode_enabled: boolean | null
          health_integration_enabled: boolean | null
          height_unit: string | null
          height_value: number | null
          id: string
          location: Json | null
          location_enabled: boolean | null
          nutrition_integration_enabled: boolean | null
          persona_override: string | null
          personal_habits: string[] | null
          professional_habits: string[] | null
          protein_goal: number | null
          subscription_status: string | null
          target_weight_unit: string | null
          target_weight_value: number | null
          theme_mode: string | null
          time_commitment: string | null
          trial_start: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          accent_color?: string | null
          activity_level?: string | null
          ai_tone?: string | null
          calorie_goal?: number | null
          carbs_goal?: number | null
          commitment?: string | null
          created_at?: string
          current_ecw?: number | null
          current_pbf?: number | null
          current_smm?: number | null
          current_weight_unit?: string | null
          current_weight_value?: number | null
          experience?: string | null
          fat_goal?: number | null
          fitness_goal?: string | null
          focus_areas?: string[] | null
          focus_mode_enabled?: boolean | null
          health_integration_enabled?: boolean | null
          height_unit?: string | null
          height_value?: number | null
          id?: string
          location?: Json | null
          location_enabled?: boolean | null
          nutrition_integration_enabled?: boolean | null
          persona_override?: string | null
          personal_habits?: string[] | null
          professional_habits?: string[] | null
          protein_goal?: number | null
          subscription_status?: string | null
          target_weight_unit?: string | null
          target_weight_value?: number | null
          theme_mode?: string | null
          time_commitment?: string | null
          trial_start?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          accent_color?: string | null
          activity_level?: string | null
          ai_tone?: string | null
          calorie_goal?: number | null
          carbs_goal?: number | null
          commitment?: string | null
          created_at?: string
          current_ecw?: number | null
          current_pbf?: number | null
          current_smm?: number | null
          current_weight_unit?: string | null
          current_weight_value?: number | null
          experience?: string | null
          fat_goal?: number | null
          fitness_goal?: string | null
          focus_areas?: string[] | null
          focus_mode_enabled?: boolean | null
          health_integration_enabled?: boolean | null
          height_unit?: string | null
          height_value?: number | null
          id?: string
          location?: Json | null
          location_enabled?: boolean | null
          nutrition_integration_enabled?: boolean | null
          persona_override?: string | null
          personal_habits?: string[] | null
          professional_habits?: string[] | null
          protein_goal?: number | null
          subscription_status?: string | null
          target_weight_unit?: string | null
          target_weight_value?: number | null
          theme_mode?: string | null
          time_commitment?: string | null
          trial_start?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reflections: {
        Row: {
          content: string
          created_at: string
          id: string
          mood: string | null
          period: string
          reflection_date: string
          tags: string[] | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          mood?: string | null
          period?: string
          reflection_date?: string
          tags?: string[] | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          mood?: string | null
          period?: string
          reflection_date?: string
          tags?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      reminders: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          icon: string
          id: string
          reminder_time: string
          title: string
          updated_at: string
          urgent: boolean
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          icon?: string
          id?: string
          reminder_time: string
          title: string
          updated_at?: string
          urgent?: boolean
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          icon?: string
          id?: string
          reminder_time?: string
          title?: string
          updated_at?: string
          urgent?: boolean
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          billing_interval: string | null
          created_at: string
          end_date: string | null
          id: string
          payment_provider_id: string | null
          plan: string
          price_annual: number | null
          price_monthly: number | null
          renewal_date: string | null
          start_date: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_interval?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          payment_provider_id?: string | null
          plan?: string
          price_annual?: number | null
          price_monthly?: number | null
          renewal_date?: string | null
          start_date?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_interval?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          payment_provider_id?: string | null
          plan?: string
          price_annual?: number | null
          price_monthly?: number | null
          renewal_date?: string | null
          start_date?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string | null
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id?: string | null
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string | null
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          alcohol_gender: string | null
          apple_health_connected: boolean | null
          created_at: string
          custom_exercises: string[] | null
          default_tab: string | null
          haptics: boolean | null
          health_integrations: boolean | null
          high_contrast: boolean | null
          id: string
          language: string | null
          notification_habits: boolean | null
          notification_intensity: string | null
          notification_reflections: boolean | null
          notification_tips: boolean | null
          notification_workouts: boolean | null
          sounds: boolean | null
          text_size: string | null
          theme: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          alcohol_gender?: string | null
          apple_health_connected?: boolean | null
          created_at?: string
          custom_exercises?: string[] | null
          default_tab?: string | null
          haptics?: boolean | null
          health_integrations?: boolean | null
          high_contrast?: boolean | null
          id?: string
          language?: string | null
          notification_habits?: boolean | null
          notification_intensity?: string | null
          notification_reflections?: boolean | null
          notification_tips?: boolean | null
          notification_workouts?: boolean | null
          sounds?: boolean | null
          text_size?: string | null
          theme?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          alcohol_gender?: string | null
          apple_health_connected?: boolean | null
          created_at?: string
          custom_exercises?: string[] | null
          default_tab?: string | null
          haptics?: boolean | null
          health_integrations?: boolean | null
          high_contrast?: boolean | null
          id?: string
          language?: string | null
          notification_habits?: boolean | null
          notification_intensity?: string | null
          notification_reflections?: boolean | null
          notification_tips?: boolean | null
          notification_workouts?: boolean | null
          sounds?: boolean | null
          text_size?: string | null
          theme?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      virtual_pets: {
        Row: {
          created_at: string
          experience: number
          happiness: number
          health: number
          id: string
          last_updated: string
          level: number
          pet_name: string | null
          pet_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          experience?: number
          happiness?: number
          health?: number
          id?: string
          last_updated?: string
          level?: number
          pet_name?: string | null
          pet_type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          experience?: number
          happiness?: number
          health?: number
          id?: string
          last_updated?: string
          level?: number
          pet_name?: string | null
          pet_type?: string
          user_id?: string
        }
        Relationships: []
      }
      water_logs: {
        Row: {
          amount_ml: number
          created_at: string
          id: string
          log_date: string
          logged_at: string
          user_id: string
        }
        Insert: {
          amount_ml?: number
          created_at?: string
          id?: string
          log_date?: string
          logged_at?: string
          user_id: string
        }
        Update: {
          amount_ml?: number
          created_at?: string
          id?: string
          log_date?: string
          logged_at?: string
          user_id?: string
        }
        Relationships: []
      }
      weight_logs: {
        Row: {
          created_at: string
          ecw: number | null
          id: string
          log_date: string
          notes: string | null
          pbf: number | null
          smm: number | null
          user_id: string
          weight_unit: string
          weight_value: number
        }
        Insert: {
          created_at?: string
          ecw?: number | null
          id?: string
          log_date?: string
          notes?: string | null
          pbf?: number | null
          smm?: number | null
          user_id: string
          weight_unit?: string
          weight_value: number
        }
        Update: {
          created_at?: string
          ecw?: number | null
          id?: string
          log_date?: string
          notes?: string | null
          pbf?: number | null
          smm?: number | null
          user_id?: string
          weight_unit?: string
          weight_value?: number
        }
        Relationships: []
      }
      workouts: {
        Row: {
          calories: number | null
          created_at: string
          duration_minutes: number | null
          exercise_name: string
          id: string
          notes: string | null
          reps: number | null
          sets: number | null
          user_id: string
          weight_unit: string | null
          weight_value: number | null
          workout_date: string
          workout_type: string
        }
        Insert: {
          calories?: number | null
          created_at?: string
          duration_minutes?: number | null
          exercise_name: string
          id?: string
          notes?: string | null
          reps?: number | null
          sets?: number | null
          user_id: string
          weight_unit?: string | null
          weight_value?: number | null
          workout_date?: string
          workout_type: string
        }
        Update: {
          calories?: number | null
          created_at?: string
          duration_minutes?: number | null
          exercise_name?: string
          id?: string
          notes?: string | null
          reps?: number | null
          sets?: number | null
          user_id?: string
          weight_unit?: string | null
          weight_value?: number | null
          workout_date?: string
          workout_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      user_subscription_status: {
        Row: {
          billing_interval: string | null
          created_at: string | null
          end_date: string | null
          id: string | null
          plan: string | null
          price_annual: number | null
          price_monthly: number | null
          renewal_date: string | null
          start_date: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          billing_interval?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string | null
          plan?: string | null
          price_annual?: number | null
          price_monthly?: number | null
          renewal_date?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          billing_interval?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string | null
          plan?: string | null
          price_annual?: number | null
          price_monthly?: number | null
          renewal_date?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_user_subscription_status: {
        Args: { p_user_id: string }
        Returns: {
          billing_interval: string
          end_date: string
          plan: string
          status: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
