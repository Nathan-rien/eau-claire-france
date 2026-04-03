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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      alertes_utilisateurs: {
        Row: {
          actif: boolean
          commune: string
          consent_rgpd: boolean
          created_at: string
          date_inscription: string
          email: string
          id: string
          updated_at: string
        }
        Insert: {
          actif?: boolean
          commune: string
          consent_rgpd?: boolean
          created_at?: string
          date_inscription?: string
          email: string
          id?: string
          updated_at?: string
        }
        Update: {
          actif?: boolean
          commune?: string
          consent_rgpd?: boolean
          created_at?: string
          date_inscription?: string
          email?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          event_type: string
          id: string
          ip_address: unknown
          severity: string
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown
          severity: string
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown
          severity?: string
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      brand_retailer_mapping: {
        Row: {
          brand_name: string
          created_at: string
          id: string
          is_available: boolean
          price_position: string | null
          retailer_id: string
          updated_at: string
        }
        Insert: {
          brand_name: string
          created_at?: string
          id?: string
          is_available?: boolean
          price_position?: string | null
          retailer_id: string
          updated_at?: string
        }
        Update: {
          brand_name?: string
          created_at?: string
          id?: string
          is_available?: boolean
          price_position?: string | null
          retailer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_retailer_mapping_retailer_id_fkey"
            columns: ["retailer_id"]
            isOneToOne: false
            referencedRelation: "retailers"
            referencedColumns: ["id"]
          },
        ]
      }
      eu_water_composition: {
        Row: {
          avg_value: number | null
          country_code: string
          country_name: string
          created_at: string
          data_year: number | null
          id: string
          max_value: number | null
          min_value: number | null
          parameter: string
          samples_count: number | null
          source: string
          unit: string
          updated_at: string
        }
        Insert: {
          avg_value?: number | null
          country_code: string
          country_name?: string
          created_at?: string
          data_year?: number | null
          id?: string
          max_value?: number | null
          min_value?: number | null
          parameter: string
          samples_count?: number | null
          source?: string
          unit?: string
          updated_at?: string
        }
        Update: {
          avg_value?: number | null
          country_code?: string
          country_name?: string
          created_at?: string
          data_year?: number | null
          id?: string
          max_value?: number | null
          min_value?: number | null
          parameter?: string
          samples_count?: number | null
          source?: string
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      prices: {
        Row: {
          availability: string | null
          brand: string
          created_at: string
          id: string
          image_url: string | null
          is_promo: boolean | null
          pack_count: number | null
          price_per_l_eur: number | null
          price_total_eur: number | null
          product_name: string
          promo_label: string | null
          retailer_id: string
          run_id: string
          scraped_at: string
          sku: string | null
          total_volume_l: number | null
          unique_hash: string
          unit_volume_l: number | null
          url: string | null
        }
        Insert: {
          availability?: string | null
          brand: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_promo?: boolean | null
          pack_count?: number | null
          price_per_l_eur?: number | null
          price_total_eur?: number | null
          product_name: string
          promo_label?: string | null
          retailer_id: string
          run_id: string
          scraped_at?: string
          sku?: string | null
          total_volume_l?: number | null
          unique_hash: string
          unit_volume_l?: number | null
          url?: string | null
        }
        Update: {
          availability?: string | null
          brand?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_promo?: boolean | null
          pack_count?: number | null
          price_per_l_eur?: number | null
          price_total_eur?: number | null
          product_name?: string
          promo_label?: string | null
          retailer_id?: string
          run_id?: string
          scraped_at?: string
          sku?: string | null
          total_volume_l?: number | null
          unique_hash?: string
          unit_volume_l?: number | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prices_retailer_id_fkey"
            columns: ["retailer_id"]
            isOneToOne: false
            referencedRelation: "retailers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prices_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "runs"
            referencedColumns: ["id"]
          },
        ]
      }
      prices_history: {
        Row: {
          availability: string | null
          brand: string
          created_at: string
          id: string
          image_url: string | null
          is_promo: boolean | null
          pack_count: number | null
          price_per_l_eur: number | null
          price_total_eur: number | null
          product_name: string
          promo_label: string | null
          retailer_id: string
          run_id: string
          scraped_at: string
          sku: string | null
          total_volume_l: number | null
          unique_hash: string
          unit_volume_l: number | null
          url: string | null
        }
        Insert: {
          availability?: string | null
          brand: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_promo?: boolean | null
          pack_count?: number | null
          price_per_l_eur?: number | null
          price_total_eur?: number | null
          product_name: string
          promo_label?: string | null
          retailer_id: string
          run_id: string
          scraped_at?: string
          sku?: string | null
          total_volume_l?: number | null
          unique_hash: string
          unit_volume_l?: number | null
          url?: string | null
        }
        Update: {
          availability?: string | null
          brand?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_promo?: boolean | null
          pack_count?: number | null
          price_per_l_eur?: number | null
          price_total_eur?: number | null
          product_name?: string
          promo_label?: string | null
          retailer_id?: string
          run_id?: string
          scraped_at?: string
          sku?: string | null
          total_volume_l?: number | null
          unique_hash?: string
          unit_volume_l?: number | null
          url?: string | null
        }
        Relationships: []
      }
      prices_view_refresh_log: {
        Row: {
          id: string
          refreshed_at: string
          refreshed_by: string | null
        }
        Insert: {
          id?: string
          refreshed_at?: string
          refreshed_by?: string | null
        }
        Update: {
          id?: string
          refreshed_at?: string
          refreshed_by?: string | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          count: number
          created_at: string
          id: string
          identifier: string
          last_reset: string
          type: string
          updated_at: string
        }
        Insert: {
          count?: number
          created_at?: string
          id?: string
          identifier: string
          last_reset?: string
          type: string
          updated_at?: string
        }
        Update: {
          count?: number
          created_at?: string
          id?: string
          identifier?: string
          last_reset?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      raw_products: {
        Row: {
          created_at: string
          id: string
          payload_json: Json
          retailer_id: string
          run_id: string
          scraped_at: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          payload_json?: Json
          retailer_id: string
          run_id: string
          scraped_at?: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          payload_json?: Json
          retailer_id?: string
          run_id?: string
          scraped_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "raw_products_retailer_id_fkey"
            columns: ["retailer_id"]
            isOneToOne: false
            referencedRelation: "retailers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raw_products_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "runs"
            referencedColumns: ["id"]
          },
        ]
      }
      retailers: {
        Row: {
          created_at: string
          domain: string
          id: string
          name: string
          search_url_template: string | null
          slug: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          domain: string
          id?: string
          name: string
          search_url_template?: string | null
          slug: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          domain?: string
          id?: string
          name?: string
          search_url_template?: string | null
          slug?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      runs: {
        Row: {
          created_at: string
          error: Json | null
          error_rate: number | null
          finished_at: string | null
          id: string
          items_found: number | null
          items_saved: number | null
          notes: string | null
          outliers_count: number | null
          payload: Json | null
          quality_score: number | null
          queued_at: string
          result: Json | null
          retailer_id: string | null
          started_at: string
          status: string
          type: string
          unknown_brands_count: number | null
        }
        Insert: {
          created_at?: string
          error?: Json | null
          error_rate?: number | null
          finished_at?: string | null
          id?: string
          items_found?: number | null
          items_saved?: number | null
          notes?: string | null
          outliers_count?: number | null
          payload?: Json | null
          quality_score?: number | null
          queued_at?: string
          result?: Json | null
          retailer_id?: string | null
          started_at?: string
          status?: string
          type?: string
          unknown_brands_count?: number | null
        }
        Update: {
          created_at?: string
          error?: Json | null
          error_rate?: number | null
          finished_at?: string | null
          id?: string
          items_found?: number | null
          items_saved?: number | null
          notes?: string | null
          outliers_count?: number | null
          payload?: Json | null
          quality_score?: number | null
          queued_at?: string
          result?: Json | null
          retailer_id?: string | null
          started_at?: string
          status?: string
          type?: string
          unknown_brands_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "runs_retailer_id_fkey"
            columns: ["retailer_id"]
            isOneToOne: false
            referencedRelation: "retailers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      prices_history_last: {
        Row: {
          availability: string | null
          brand: string | null
          created_at: string | null
          id: string | null
          image_url: string | null
          is_promo: boolean | null
          pack_count: number | null
          price_per_l_eur: number | null
          price_total_eur: number | null
          product_name: string | null
          promo_label: string | null
          retailer_id: string | null
          run_id: string | null
          scraped_at: string | null
          sku: string | null
          total_volume_l: number | null
          unique_hash: string | null
          unit_volume_l: number | null
          url: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      cleanup_old_rate_limits: { Args: never; Returns: undefined }
      has_admin_role: { Args: { check_user_id: string }; Returns: boolean }
      is_admin: { Args: never; Returns: boolean }
      refresh_prices_view: { Args: never; Returns: undefined }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
