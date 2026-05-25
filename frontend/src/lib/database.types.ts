export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      encounter_cards: {
        Row: {
          created_at: string | null;
          encounter_id: string;
          from_user_id: string;
          id: string;
          like_card_id: string;
          to_user_id: string;
        };
        Insert: {
          created_at?: string | null;
          encounter_id: string;
          from_user_id: string;
          id?: string;
          like_card_id: string;
          to_user_id: string;
        };
        Update: {
          created_at?: string | null;
          encounter_id?: string;
          from_user_id?: string;
          id?: string;
          like_card_id?: string;
          to_user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "encounter_cards_encounter_id_fkey";
            columns: ["encounter_id"];
            isOneToOne: false;
            referencedRelation: "encounters";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "encounter_cards_from_user_id_fkey";
            columns: ["from_user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "encounter_cards_like_card_id_fkey";
            columns: ["like_card_id"];
            isOneToOne: false;
            referencedRelation: "like_cards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "encounter_cards_to_user_id_fkey";
            columns: ["to_user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      encounters: {
        Row: {
          detection_method: string;
          encountered_at: string | null;
          id: string;
          rssi: number | null;
          user_a_id: string;
          user_b_id: string;
        };
        Insert: {
          detection_method: string;
          encountered_at?: string | null;
          id?: string;
          rssi?: number | null;
          user_a_id: string;
          user_b_id: string;
        };
        Update: {
          detection_method?: string;
          encountered_at?: string | null;
          id?: string;
          rssi?: number | null;
          user_a_id?: string;
          user_b_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "encounters_user_a_id_fkey";
            columns: ["user_a_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "encounters_user_b_id_fkey";
            columns: ["user_b_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      like_cards: {
        Row: {
          category: string;
          created_at: string | null;
          detail: string | null;
          id: string;
          photo_url: string | null;
          title: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          category: string;
          created_at?: string | null;
          detail?: string | null;
          id?: string;
          photo_url?: string | null;
          title: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          category?: string;
          created_at?: string | null;
          detail?: string | null;
          id?: string;
          photo_url?: string | null;
          title?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "like_cards_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ]
      }
      planter_items: {
        Row: {
          created_at: string
          id: string
          like_card_id: string
          planted_at: string
          source_encounter_id: string | null
          source_saved_card_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          like_card_id: string
          planted_at?: string
          source_encounter_id?: string | null
          source_saved_card_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          like_card_id?: string
          planted_at?: string
          source_encounter_id?: string | null
          source_saved_card_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "planter_items_like_card_id_fkey"
            columns: ["like_card_id"]
            isOneToOne: false
            referencedRelation: "like_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planter_items_source_encounter_id_fkey"
            columns: ["source_encounter_id"]
            isOneToOne: false
            referencedRelation: "encounters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planter_items_source_saved_card_id_fkey"
            columns: ["source_saved_card_id"]
            isOneToOne: false
            referencedRelation: "saved_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planter_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_cards: {
        Row: {
          created_at: string | null;
          encounter_id: string;
          id: string;
          like_card_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          encounter_id: string;
          id?: string;
          like_card_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          encounter_id?: string;
          id?: string;
          like_card_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "saved_cards_encounter_id_fkey";
            columns: ["encounter_id"];
            isOneToOne: false;
            referencedRelation: "encounters";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "saved_cards_like_card_id_fkey";
            columns: ["like_card_id"];
            isOneToOne: false;
            referencedRelation: "like_cards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "saved_cards_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ]
      }
      suki_action_logs: {
        Row: {
          acted_at: string
          action_type: string
          created_at: string
          id: string
          notes: string | null
          planter_item_id: string
          title: string
          user_id: string
        }
        Insert: {
          acted_at?: string
          action_type: string
          created_at?: string
          id?: string
          notes?: string | null
          planter_item_id: string
          title: string
          user_id: string
        }
        Update: {
          acted_at?: string
          action_type?: string
          created_at?: string
          id?: string
          notes?: string | null
          planter_item_id?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "suki_action_logs_planter_item_id_fkey"
            columns: ["planter_item_id"]
            isOneToOne: false
            referencedRelation: "planter_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suki_action_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_locations: {
        Row: {
          latitude: number;
          longitude: number;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          latitude: number;
          longitude: number;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          latitude?: number;
          longitude?: number;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_locations_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      users: {
        Row: {
          age_range: string | null;
          created_at: string | null;
          gender_label: string | null;
          id: string;
          is_profile_public: boolean;
          username: string;
        };
        Insert: {
          age_range?: string | null;
          created_at?: string | null;
          gender_label?: string | null;
          id: string;
          is_profile_public?: boolean;
          username: string;
        };
        Update: {
          age_range?: string | null;
          created_at?: string | null;
          gender_label?: string | null;
          id?: string;
          is_profile_public?: boolean;
          username?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
