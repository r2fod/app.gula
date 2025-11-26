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
      allergies: {
        Row: {
          allergy: string
          created_at: string
          event_id: string
          guest_name: string
          id: string
          notes: string | null
          table_number: string | null
        }
        Insert: {
          allergy: string
          created_at?: string
          event_id: string
          guest_name: string
          id?: string
          notes?: string | null
          table_number?: string | null
        }
        Update: {
          allergy?: string
          created_at?: string
          event_id?: string
          guest_name?: string
          id?: string
          notes?: string | null
          table_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "allergies_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_features: {
        Row: {
          beer_corner: boolean | null
          cake: boolean | null
          candy_bar: boolean | null
          cheese_corner: boolean | null
          cheese_corner_pax: number | null
          cocktail_bar: boolean | null
          created_at: string
          drinks_bar: boolean | null
          event_id: string
          extra_bar_hours: boolean | null
          ham_cutter: boolean | null
          ham_cutter_notes: string | null
          id: string
          lemonade_corner: boolean | null
        }
        Insert: {
          beer_corner?: boolean | null
          cake?: boolean | null
          candy_bar?: boolean | null
          cheese_corner?: boolean | null
          cheese_corner_pax?: number | null
          cocktail_bar?: boolean | null
          created_at?: string
          drinks_bar?: boolean | null
          event_id: string
          extra_bar_hours?: boolean | null
          ham_cutter?: boolean | null
          ham_cutter_notes?: string | null
          id?: string
          lemonade_corner?: boolean | null
        }
        Update: {
          beer_corner?: boolean | null
          cake?: boolean | null
          candy_bar?: boolean | null
          cheese_corner?: boolean | null
          cheese_corner_pax?: number | null
          cocktail_bar?: boolean | null
          created_at?: string
          drinks_bar?: boolean | null
          event_id?: string
          extra_bar_hours?: boolean | null
          ham_cutter?: boolean | null
          ham_cutter_notes?: string | null
          id?: string
          lemonade_corner?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "event_features_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_timings: {
        Row: {
          banquet_start: string | null
          bar_end: string | null
          bar_hours: number | null
          bar_start: string | null
          ceremony: string | null
          cocktail_start: string | null
          created_at: string
          event_id: string
          guest_arrival: string | null
          id: string
        }
        Insert: {
          banquet_start?: string | null
          bar_end?: string | null
          bar_hours?: number | null
          bar_start?: string | null
          ceremony?: string | null
          cocktail_start?: string | null
          created_at?: string
          event_id: string
          guest_arrival?: string | null
          id?: string
        }
        Update: {
          banquet_start?: string | null
          bar_end?: string | null
          bar_hours?: number | null
          bar_start?: string | null
          ceremony?: string | null
          cocktail_start?: string | null
          created_at?: string
          event_id?: string
          guest_arrival?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_timings_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          adults: number | null
          canapes_per_person: number | null
          children: number | null
          created_at: string
          event_date: string
          event_type: Database["public"]["Enums"]["event_type"]
          id: string
          notes: string | null
          staff: number | null
          total_guests: number
          updated_at: string
          user_id: string
          venue: string
        }
        Insert: {
          adults?: number | null
          canapes_per_person?: number | null
          children?: number | null
          created_at?: string
          event_date: string
          event_type: Database["public"]["Enums"]["event_type"]
          id?: string
          notes?: string | null
          staff?: number | null
          total_guests?: number
          updated_at?: string
          user_id: string
          venue: string
        }
        Update: {
          adults?: number | null
          canapes_per_person?: number | null
          children?: number | null
          created_at?: string
          event_date?: string
          event_type?: Database["public"]["Enums"]["event_type"]
          id?: string
          notes?: string | null
          staff?: number | null
          total_guests?: number
          updated_at?: string
          user_id?: string
          venue?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      furniture: {
        Row: {
          created_at: string
          description: string | null
          event_id: string
          id: string
          item_name: string
          location: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_id: string
          id?: string
          item_name: string
          location?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          event_id?: string
          id?: string
          item_name?: string
          location?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "furniture_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          category: string
          created_at: string
          description: string | null
          event_id: string
          id: string
          name: string
          notes: string | null
          sort_order: number | null
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          event_id: string
          id?: string
          name: string
          notes?: string | null
          sort_order?: number | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          event_id?: string
          id?: string
          name?: string
          notes?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      other_requirements: {
        Row: {
          created_at: string
          description: string | null
          event_id: string
          id: string
          item_name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_id: string
          id?: string
          item_name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          event_id?: string
          id?: string
          item_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "other_requirements_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_name: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      supplies: {
        Row: {
          created_at: string
          event_id: string
          id: string
          item_name: string
          item_type: string | null
          notes: string | null
          quantity: number
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          item_name: string
          item_type?: string | null
          notes?: string | null
          quantity: number
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          item_name?: string
          item_type?: string | null
          notes?: string | null
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "supplies_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      tables: {
        Row: {
          created_at: string
          description: string | null
          event_id: string
          guests: number
          id: string
          sort_order: number | null
          table_name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_id: string
          guests: number
          id?: string
          sort_order?: number | null
          table_name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          event_id?: string
          guests?: number
          id?: string
          sort_order?: number | null
          table_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "tables_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
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
      event_type:
        | "boda"
        | "produccion"
        | "evento_privado"
        | "delivery"
        | "comunion"
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
    Enums: {
      event_type: [
        "boda",
        "produccion",
        "evento_privado",
        "delivery",
        "comunion",
      ],
    },
  },
} as const
