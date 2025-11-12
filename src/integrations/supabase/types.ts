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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      challenges: {
        Row: {
          created_at: string | null
          description: string
          duration: number | null
          id: string
          is_active: boolean | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description: string
          duration?: number | null
          id?: string
          is_active?: boolean | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string
          duration?: number | null
          id?: string
          is_active?: boolean | null
          title?: string
        }
        Relationships: []
      }
      eco_actions: {
        Row: {
          emoji_rating: string | null
          id: string
          impact_score: number | null
          note: string | null
          timestamp: string | null
          type: string
          user_id: string
        }
        Insert: {
          emoji_rating?: string | null
          id?: string
          impact_score?: number | null
          note?: string | null
          timestamp?: string | null
          type: string
          user_id: string
        }
        Update: {
          emoji_rating?: string | null
          id?: string
          impact_score?: number | null
          note?: string | null
          timestamp?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      greenpoints: {
        Row: {
          total: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          total?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          total?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          created_at: string | null
          date: string | null
          emoji_reaction: string | null
          entry: string
          id: string
          tags: string[] | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          emoji_reaction?: string | null
          entry: string
          id?: string
          tags?: string[] | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string | null
          emoji_reaction?: string | null
          entry?: string
          id?: string
          tags?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      marketplace_items: {
        Row: {
          category: string
          cost: number
          created_at: string | null
          description: string | null
          external_url: string | null
          id: string
          name: string
        }
        Insert: {
          category: string
          cost: number
          created_at?: string | null
          description?: string | null
          external_url?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string
          cost?: number
          created_at?: string | null
          description?: string | null
          external_url?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          goals: string[] | null
          id: string
          location: string | null
          name: string
          spiritual_mode: boolean | null
          streak: number | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          goals?: string[] | null
          id: string
          location?: string | null
          name: string
          spiritual_mode?: boolean | null
          streak?: number | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          goals?: string[] | null
          id?: string
          location?: string | null
          name?: string
          spiritual_mode?: boolean | null
          streak?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_challenges: {
        Row: {
          challenge_id: string
          completed: boolean | null
          id: string
          joined_at: string | null
          progress: number | null
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed?: boolean | null
          id?: string
          joined_at?: string | null
          progress?: number | null
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed?: boolean | null
          id?: string
          joined_at?: string | null
          progress?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_challenges_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
