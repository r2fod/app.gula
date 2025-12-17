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
      beverages: {
        Row: {
          category: string
          created_at: string
          event_id: string
          id: string
          is_extra: boolean | null
          item_name: string
          notes: string | null
          photo_url: string | null
          price_per_person: number | null
          quantity: number
          total_price: number | null
          unit_price: number | null
        }
        Insert: {
          category: string
          created_at?: string
          event_id: string
          id?: string
          is_extra?: boolean | null
          item_name: string
          notes?: string | null
          photo_url?: string | null
          price_per_person?: number | null
          quantity?: number
          total_price?: number | null
          unit_price?: number | null
        }
        Update: {
          category?: string
          created_at?: string
          event_id?: string
          id?: string
          is_extra?: boolean | null
          item_name?: string
          notes?: string | null
          photo_url?: string | null
          price_per_person?: number | null
          quantity?: number
          total_price?: number | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "beverages_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      corners: {
        Row: {
          corner_type: string
          created_at: string
          event_id: string
          id: string
          is_enabled: boolean | null
          notes: string | null
          pax_count: number | null
        }
        Insert: {
          corner_type: string
          created_at?: string
          event_id: string
          id?: string
          is_enabled?: boolean | null
          notes?: string | null
          pax_count?: number | null
        }
        Update: {
          corner_type?: string
          created_at?: string
          event_id?: string
          id?: string
          is_enabled?: boolean | null
          notes?: string | null
          pax_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "corners_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_analysis: {
        Row: {
          ai_generated: boolean | null
          analysis_type: string
          content: Json
          created_at: string
          event_id: string
          id: string
        }
        Insert: {
          ai_generated?: boolean | null
          analysis_type: string
          content: Json
          created_at?: string
          event_id: string
          id?: string
        }
        Update: {
          ai_generated?: boolean | null
          analysis_type?: string
          content?: Json
          created_at?: string
          event_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_analysis_event_id_fkey"
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
      event_staff: {
        Row: {
          arrival_time: string | null
          created_at: string
          departure_time: string | null
          event_id: string
          id: string
          notes: string | null
          role: string
          staff_count: number
        }
        Insert: {
          arrival_time?: string | null
          created_at?: string
          departure_time?: string | null
          event_id: string
          id?: string
          notes?: string | null
          role: string
          staff_count?: number
        }
        Update: {
          arrival_time?: string | null
          created_at?: string
          departure_time?: string | null
          event_id?: string
          id?: string
          notes?: string | null
          role?: string
          staff_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "event_staff_event_id_fkey"
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
          ceremony_notes: string | null
          children: number | null
          children_menu: string | null
          created_at: string
          event_date: string
          event_type: Database["public"]["Enums"]["event_type"]
          id: string
          minutas_count: number | null
          notes: string | null
          resopon: string | null
          staff: number | null
          tablecloth_color: string | null
          total_guests: number
          updated_at: string
          user_id: string
          venue: string
        }
        Insert: {
          adults?: number | null
          canapes_per_person?: number | null
          ceremony_notes?: string | null
          children?: number | null
          children_menu?: string | null
          created_at?: string
          event_date: string
          event_type: Database["public"]["Enums"]["event_type"]
          id?: string
          minutas_count?: number | null
          notes?: string | null
          resopon?: string | null
          staff?: number | null
          tablecloth_color?: string | null
          total_guests?: number
          updated_at?: string
          user_id: string
          venue: string
        }
        Update: {
          adults?: number | null
          canapes_per_person?: number | null
          ceremony_notes?: string | null
          children?: number | null
          children_menu?: string | null
          created_at?: string
          event_date?: string
          event_type?: Database["public"]["Enums"]["event_type"]
          id?: string
          minutas_count?: number | null
          notes?: string | null
          resopon?: string | null
          staff?: number | null
          tablecloth_color?: string | null
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
      menus: {
        Row: {
          created_at: string
          description: string | null
          file_type: string | null
          file_url: string | null
          id: string
          is_active: boolean | null
          items: Json | null
          menu_type: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_active?: boolean | null
          items?: Json | null
          menu_type?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_active?: boolean | null
          items?: Json | null
          menu_type?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      recipe_ingredients: {
        Row: {
          base_quantity: number
          calculated_quantity: number | null
          created_at: string
          event_id: string
          id: string
          ingredient_name: string
          notes: string | null
          recipe_name: string
          unit: string
        }
        Insert: {
          base_quantity: number
          calculated_quantity?: number | null
          created_at?: string
          event_id: string
          id?: string
          ingredient_name: string
          notes?: string | null
          recipe_name: string
          unit: string
        }
        Update: {
          base_quantity?: number
          calculated_quantity?: number | null
          created_at?: string
          event_id?: string
          id?: string
          ingredient_name?: string
          notes?: string | null
          recipe_name?: string
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      rentals: {
        Row: {
          created_at: string
          event_id: string
          id: string
          item_name: string
          notes: string | null
          status: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          item_name: string
          notes?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          item_name?: string
          notes?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "rentals_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      room_equipment: {
        Row: {
          category: string
          created_at: string
          event_id: string
          id: string
          item_name: string
          notes: string | null
          quantity: string | null
        }
        Insert: {
          category: string
          created_at?: string
          event_id: string
          id?: string
          item_name: string
          notes?: string | null
          quantity?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          event_id?: string
          id?: string
          item_name?: string
          notes?: string | null
          quantity?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "room_equipment_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      supplies: {
        Row: {
          created_at: string
          event_id: string
          id: string
          item_name: string
          item_type: string | null
          notes: string | null
          photo_url: string | null
          quantity: number
          unit_price: number | null
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          item_name: string
          item_type?: string | null
          notes?: string | null
          photo_url?: string | null
          quantity: number
          unit_price?: number | null
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          item_name?: string
          item_type?: string | null
          notes?: string | null
          photo_url?: string | null
          quantity?: number
          unit_price?: number | null
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
