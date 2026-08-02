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
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          advance: number
          base_amount: number
          booked_by: string
          booking_number: string
          court_id: string
          created_at: string
          customer_id: string | null
          date: string
          deleted_at: string | null
          discount: number
          duration_minutes: number
          end_time: string
          final_amount: number
          id: string
          is_force_booked: boolean
          notes: string | null
          payment_mode: Database["public"]["Enums"]["payment_mode"] | null
          payment_notes: string | null
          payment_status: Database["public"]["Enums"]["booking_payment_status"]
          pending: number
          slot_type: Database["public"]["Enums"]["slot_type"]
          source: Database["public"]["Enums"]["booking_source"]
          start_time: string
          status: Database["public"]["Enums"]["booking_status"]
          updated_at: string
          venue_id: string
          whatsapp_sent: boolean
        }
        Insert: {
          advance?: number
          base_amount: number
          booked_by: string
          booking_number: string
          court_id: string
          created_at?: string
          customer_id?: string | null
          date: string
          deleted_at?: string | null
          discount?: number
          duration_minutes: number
          end_time: string
          final_amount: number
          id?: string
          is_force_booked?: boolean
          notes?: string | null
          payment_mode?: Database["public"]["Enums"]["payment_mode"] | null
          payment_notes?: string | null
          payment_status?: Database["public"]["Enums"]["booking_payment_status"]
          pending?: number
          slot_type?: Database["public"]["Enums"]["slot_type"]
          source?: Database["public"]["Enums"]["booking_source"]
          start_time: string
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
          venue_id: string
          whatsapp_sent?: boolean
        }
        Update: {
          advance?: number
          base_amount?: number
          booked_by?: string
          booking_number?: string
          court_id?: string
          created_at?: string
          customer_id?: string | null
          date?: string
          deleted_at?: string | null
          discount?: number
          duration_minutes?: number
          end_time?: string
          final_amount?: number
          id?: string
          is_force_booked?: boolean
          notes?: string | null
          payment_mode?: Database["public"]["Enums"]["payment_mode"] | null
          payment_notes?: string | null
          payment_status?: Database["public"]["Enums"]["booking_payment_status"]
          pending?: number
          slot_type?: Database["public"]["Enums"]["slot_type"]
          source?: Database["public"]["Enums"]["booking_source"]
          start_time?: string
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
          venue_id?: string
          whatsapp_sent?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "bookings_court_id_fkey"
            columns: ["court_id"]
            isOneToOne: false
            referencedRelation: "courts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      courts: {
        Row: {
          court_type: Database["public"]["Enums"]["court_type"] | null
          created_at: string
          deleted_at: string | null
          id: string
          is_active: boolean
          name: string
          sort_order: number
          updated_at: string
          venue_id: string
        }
        Insert: {
          court_type?: Database["public"]["Enums"]["court_type"] | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number
          updated_at?: string
          venue_id: string
        }
        Update: {
          court_type?: Database["public"]["Enums"]["court_type"] | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
          updated_at?: string
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "courts_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string
          deleted_at: string | null
          email: string | null
          full_name: string
          id: string
          notes: string | null
          owner_id: string
          phone: string
          total_spent: number
          total_visits: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          full_name: string
          id?: string
          notes?: string | null
          owner_id: string
          phone: string
          total_spent?: number
          total_visits?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          notes?: string | null
          owner_id?: string
          phone?: string
          total_spent?: number
          total_visits?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
        ]
      }
      guest_plays: {
        Row: {
          application_id: string | null
          created_at: string
          id: string
          notes: string | null
          phone: string
          player_name: string
          scheduled_date: string
          slot_id: string
          status: Database["public"]["Enums"]["guest_play_status"]
          updated_at: string
        }
        Insert: {
          application_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          phone: string
          player_name: string
          scheduled_date: string
          slot_id: string
          status?: Database["public"]["Enums"]["guest_play_status"]
          updated_at?: string
        }
        Update: {
          application_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          phone?: string
          player_name?: string
          scheduled_date?: string
          slot_id?: string
          status?: Database["public"]["Enums"]["guest_play_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guest_plays_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "membership_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guest_plays_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "membership_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          created_at: string
          customer_id: string
          deleted_at: string | null
          id: string
          is_active: boolean
          join_date: string
          slot_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          join_date?: string
          slot_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          join_date?: string
          slot_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "members_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "members_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "membership_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_applications: {
        Row: {
          applicant_name: string
          created_at: string
          experience: string | null
          id: string
          phone: string
          photo_url: string | null
          preferred_days: Database["public"]["Enums"]["day_of_week"][] | null
          reviewed_at: string | null
          reviewed_by: string | null
          skill_level: Database["public"]["Enums"]["skill_level"] | null
          slot_id: string
          status: Database["public"]["Enums"]["application_status"]
          updated_at: string
        }
        Insert: {
          applicant_name: string
          created_at?: string
          experience?: string | null
          id?: string
          phone: string
          photo_url?: string | null
          preferred_days?: Database["public"]["Enums"]["day_of_week"][] | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          skill_level?: Database["public"]["Enums"]["skill_level"] | null
          slot_id: string
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
        }
        Update: {
          applicant_name?: string
          created_at?: string
          experience?: string | null
          id?: string
          phone?: string
          photo_url?: string | null
          preferred_days?: Database["public"]["Enums"]["day_of_week"][] | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          skill_level?: Database["public"]["Enums"]["skill_level"] | null
          slot_id?: string
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "membership_applications_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "membership_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_payments: {
        Row: {
          amount: number
          billing_period: string
          created_at: string
          due_date: string
          id: string
          is_voided: boolean
          member_id: string
          notes: string | null
          paid_on: string | null
          payment_mode: Database["public"]["Enums"]["payment_mode"] | null
          receipt_url: string | null
          recorded_by: string | null
          slot_id: string
          status: Database["public"]["Enums"]["membership_pay_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          billing_period: string
          created_at?: string
          due_date: string
          id?: string
          is_voided?: boolean
          member_id: string
          notes?: string | null
          paid_on?: string | null
          payment_mode?: Database["public"]["Enums"]["payment_mode"] | null
          receipt_url?: string | null
          recorded_by?: string | null
          slot_id: string
          status?: Database["public"]["Enums"]["membership_pay_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          billing_period?: string
          created_at?: string
          due_date?: string
          id?: string
          is_voided?: boolean
          member_id?: string
          notes?: string | null
          paid_on?: string | null
          payment_mode?: Database["public"]["Enums"]["payment_mode"] | null
          receipt_url?: string | null
          recorded_by?: string | null
          slot_id?: string
          status?: Database["public"]["Enums"]["membership_pay_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "membership_payments_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "membership_payments_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "membership_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_slot_releases: {
        Row: {
          created_at: string
          id: string
          release_date: string
          released_by: string
          slot_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          release_date: string
          released_by: string
          slot_id: string
        }
        Update: {
          created_at?: string
          id?: string
          release_date?: string
          released_by?: string
          slot_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "membership_slot_releases_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "membership_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_slots: {
        Row: {
          allow_guest_play: boolean
          billing_day: number
          capacity: number
          court_id: string | null
          created_at: string
          deleted_at: string | null
          end_time: string
          guest_play_fee: number
          id: string
          is_published: boolean
          is_recruiting: boolean
          monthly_fee: number
          name: string
          playing_days: Database["public"]["Enums"]["day_of_week"][]
          skill_level: Database["public"]["Enums"]["skill_level"]
          start_time: string
          updated_at: string
          venue_id: string
        }
        Insert: {
          allow_guest_play?: boolean
          billing_day?: number
          capacity: number
          court_id?: string | null
          created_at?: string
          deleted_at?: string | null
          end_time: string
          guest_play_fee?: number
          id?: string
          is_published?: boolean
          is_recruiting?: boolean
          monthly_fee: number
          name: string
          playing_days: Database["public"]["Enums"]["day_of_week"][]
          skill_level?: Database["public"]["Enums"]["skill_level"]
          start_time: string
          updated_at?: string
          venue_id: string
        }
        Update: {
          allow_guest_play?: boolean
          billing_day?: number
          capacity?: number
          court_id?: string | null
          created_at?: string
          deleted_at?: string | null
          end_time?: string
          guest_play_fee?: number
          id?: string
          is_published?: boolean
          is_recruiting?: boolean
          monthly_fee?: number
          name?: string
          playing_days?: Database["public"]["Enums"]["day_of_week"][]
          skill_level?: Database["public"]["Enums"]["skill_level"]
          start_time?: string
          updated_at?: string
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "membership_slots_court_id_fkey"
            columns: ["court_id"]
            isOneToOne: false
            referencedRelation: "courts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "membership_slots_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      operating_schedules: {
        Row: {
          created_at: string
          day_of_week: Database["public"]["Enums"]["day_of_week"]
          id: string
          is_24h: boolean
          is_closed: boolean
          updated_at: string
          venue_id: string
        }
        Insert: {
          created_at?: string
          day_of_week: Database["public"]["Enums"]["day_of_week"]
          id?: string
          is_24h?: boolean
          is_closed?: boolean
          updated_at?: string
          venue_id: string
        }
        Update: {
          created_at?: string
          day_of_week?: Database["public"]["Enums"]["day_of_week"]
          id?: string
          is_24h?: boolean
          is_closed?: boolean
          updated_at?: string
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "operating_schedules_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      owners: {
        Row: {
          avatar_url: string | null
          business_name: string
          created_at: string
          deleted_at: string | null
          email: string | null
          full_name: string
          id: string
          phone: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          business_name: string
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          full_name: string
          id: string
          phone: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          business_name?: string
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          phone?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      pricing_blocks: {
        Row: {
          court_ids: string[] | null
          created_at: string
          end_time: string
          id: string
          is_active: boolean
          price_per_hour: number
          schedule_id: string
          sort_order: number
          start_time: string
          updated_at: string
        }
        Insert: {
          court_ids?: string[] | null
          created_at?: string
          end_time: string
          id?: string
          is_active?: boolean
          price_per_hour: number
          schedule_id: string
          sort_order?: number
          start_time: string
          updated_at?: string
        }
        Update: {
          court_ids?: string[] | null
          created_at?: string
          end_time?: string
          id?: string
          is_active?: boolean
          price_per_hour?: number
          schedule_id?: string
          sort_order?: number
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pricing_blocks_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "operating_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      venues: {
        Row: {
          address: string | null
          amenities: string[] | null
          city: string | null
          contact_email: string | null
          contact_phone: string | null
          court_type: Database["public"]["Enums"]["court_type"] | null
          created_at: string
          deleted_at: string | null
          gst_enabled: boolean
          gstin: string | null
          id: string
          is_active: boolean
          latitude: number | null
          longitude: number | null
          name: string
          owner_id: string | null
          photos: string[] | null
          pincode: string | null
          state: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          amenities?: string[] | null
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          court_type?: Database["public"]["Enums"]["court_type"] | null
          created_at?: string
          deleted_at?: string | null
          gst_enabled?: boolean
          gstin?: string | null
          id?: string
          is_active?: boolean
          latitude?: number | null
          longitude?: number | null
          name: string
          owner_id?: string | null
          photos?: string[] | null
          pincode?: string | null
          state?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          amenities?: string[] | null
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          court_type?: Database["public"]["Enums"]["court_type"] | null
          created_at?: string
          deleted_at?: string | null
          gst_enabled?: boolean
          gstin?: string | null
          id?: string
          is_active?: boolean
          latitude?: number | null
          longitude?: number | null
          name?: string
          owner_id?: string | null
          photos?: string[] | null
          pincode?: string | null
          state?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "venues_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_reports_chart_data: {
        Args: { p_time_filter: string; p_venue_id: string }
        Returns: Json
      }
      get_venue_kpis: {
        Args: { p_venue_id: string }
        Returns: {
          active_members: number
          booking_revenue: number
          membership_revenue: number
          total_bookings: number
          total_revenue: number
        }[]
      }
      is_super_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      application_status: "pending" | "accepted" | "rejected" | "invited_guest"
      booking_payment_status:
        | "pending"
        | "partial"
        | "paid"
        | "refunded"
        | "cancelled"
      booking_source: "online" | "offline" | "walk_in" | "membership"
      booking_status: "upcoming" | "ongoing" | "completed" | "cancelled"
      court_type: "wooden" | "synthetic" | "cement" | "mat"
      day_of_week: "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun"
      guest_play_status:
        | "upcoming"
        | "completed"
        | "accepted_member"
        | "rejected"
      invoice_status: "paid" | "pending" | "failed" | "refunded"
      membership_pay_status: "paid" | "due" | "overdue"
      payment_mode:
        | "cash"
        | "upi"
        | "google_pay"
        | "phonepe"
        | "bank_transfer"
        | "cheque"
        | "card"
        | "online"
      skill_level: "beginner" | "intermediate" | "advanced" | "recreational"
      slot_type:
        | "available"
        | "booked"
        | "coaching"
        | "tournament"
        | "blocked"
        | "membership"
      subscription_plan: "free" | "pro" | "enterprise"
      user_role: "super_admin" | "owner"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      application_status: ["pending", "accepted", "rejected", "invited_guest"],
      booking_payment_status: [
        "pending",
        "partial",
        "paid",
        "refunded",
        "cancelled",
      ],
      booking_source: ["online", "offline", "walk_in", "membership"],
      booking_status: ["upcoming", "ongoing", "completed", "cancelled"],
      court_type: ["wooden", "synthetic", "cement", "mat"],
      day_of_week: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
      guest_play_status: [
        "upcoming",
        "completed",
        "accepted_member",
        "rejected",
      ],
      invoice_status: ["paid", "pending", "failed", "refunded"],
      membership_pay_status: ["paid", "due", "overdue"],
      payment_mode: [
        "cash",
        "upi",
        "google_pay",
        "phonepe",
        "bank_transfer",
        "cheque",
        "card",
        "online",
      ],
      skill_level: ["beginner", "intermediate", "advanced", "recreational"],
      slot_type: [
        "available",
        "booked",
        "coaching",
        "tournament",
        "blocked",
        "membership",
      ],
      subscription_plan: ["free", "pro", "enterprise"],
      user_role: ["super_admin", "owner"],
    },
  },
} as const
