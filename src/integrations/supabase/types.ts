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
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          record_id: string
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id: string
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      blocked_dates: {
        Row: {
          blocked_date: string
          center_id: string
          created_at: string
          doctor_id: string | null
          id: string
          reason: string | null
        }
        Insert: {
          blocked_date: string
          center_id: string
          created_at?: string
          doctor_id?: string | null
          id?: string
          reason?: string | null
        }
        Update: {
          blocked_date?: string
          center_id?: string
          created_at?: string
          doctor_id?: string | null
          id?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blocked_dates_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocked_dates_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          booking_date: string
          booking_time: string
          cancellation_reason: string | null
          cancelled_at: string | null
          center_id: string
          created_at: string
          doctor_id: string | null
          id: string
          notes: string | null
          rescheduled_from: string | null
          service_id: string | null
          status: Database["public"]["Enums"]["booking_status"]
          total_amount: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          booking_date: string
          booking_time: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          center_id: string
          created_at?: string
          doctor_id?: string | null
          id?: string
          notes?: string | null
          rescheduled_from?: string | null
          service_id?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          total_amount?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          booking_date?: string
          booking_time?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          center_id?: string
          created_at?: string
          doctor_id?: string | null
          id?: string
          notes?: string | null
          rescheduled_from?: string | null
          service_id?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          total_amount?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_rescheduled_from_fkey"
            columns: ["rescheduled_from"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      centers: {
        Row: {
          address: string
          average_rating: number | null
          cancellation_fee_percent: number | null
          cancellation_hours: number | null
          city: string
          closing_time: string | null
          created_at: string
          description: string | null
          email: string | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          location_lat: number
          location_lng: number
          name: string
          opening_time: string | null
          owner_id: string
          phone: string | null
          photos: string[] | null
          pincode: string | null
          service_types: Database["public"]["Enums"]["ayush_service_type"][]
          state: string
          total_bookings: number | null
          total_reviews: number | null
          updated_at: string
          website: string | null
          working_days: number[] | null
        }
        Insert: {
          address: string
          average_rating?: number | null
          cancellation_fee_percent?: number | null
          cancellation_hours?: number | null
          city: string
          closing_time?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          location_lat: number
          location_lng: number
          name: string
          opening_time?: string | null
          owner_id: string
          phone?: string | null
          photos?: string[] | null
          pincode?: string | null
          service_types?: Database["public"]["Enums"]["ayush_service_type"][]
          state?: string
          total_bookings?: number | null
          total_reviews?: number | null
          updated_at?: string
          website?: string | null
          working_days?: number[] | null
        }
        Update: {
          address?: string
          average_rating?: number | null
          cancellation_fee_percent?: number | null
          cancellation_hours?: number | null
          city?: string
          closing_time?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          location_lat?: number
          location_lng?: number
          name?: string
          opening_time?: string | null
          owner_id?: string
          phone?: string | null
          photos?: string[] | null
          pincode?: string | null
          service_types?: Database["public"]["Enums"]["ayush_service_type"][]
          state?: string
          total_bookings?: number | null
          total_reviews?: number | null
          updated_at?: string
          website?: string | null
          working_days?: number[] | null
        }
        Relationships: []
      }
      doctors: {
        Row: {
          bio: string | null
          center_id: string
          consultation_fee: number | null
          created_at: string
          experience_years: number | null
          id: string
          is_available: boolean | null
          name: string
          photo_url: string | null
          qualification: string | null
          specialization: Database["public"]["Enums"]["ayush_service_type"]
          updated_at: string
        }
        Insert: {
          bio?: string | null
          center_id: string
          consultation_fee?: number | null
          created_at?: string
          experience_years?: number | null
          id?: string
          is_available?: boolean | null
          name: string
          photo_url?: string | null
          qualification?: string | null
          specialization: Database["public"]["Enums"]["ayush_service_type"]
          updated_at?: string
        }
        Update: {
          bio?: string | null
          center_id?: string
          consultation_fee?: number | null
          created_at?: string
          experience_years?: number | null
          id?: string
          is_available?: boolean | null
          name?: string
          photo_url?: string | null
          qualification?: string | null
          specialization?: Database["public"]["Enums"]["ayush_service_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctors_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          center_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          center_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          center_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_logs: {
        Row: {
          booking_id: string | null
          channel: string
          content: string | null
          created_at: string
          delivered_at: string | null
          error_message: string | null
          id: string
          notification_type: string
          recipient: string
          sent_at: string | null
          status: string
          subject: string | null
          user_id: string
        }
        Insert: {
          booking_id?: string | null
          channel: string
          content?: string | null
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          notification_type: string
          recipient: string
          sent_at?: string | null
          status?: string
          subject?: string | null
          user_id: string
        }
        Update: {
          booking_id?: string | null
          channel?: string
          content?: string | null
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          notification_type?: string
          recipient?: string
          sent_at?: string | null
          status?: string
          subject?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_logs_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          created_at: string
          full_name: string | null
          id: string
          location_lat: number | null
          location_lng: number | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          booking_id: string | null
          center_id: string
          comment: string | null
          created_at: string
          id: string
          is_verified: boolean | null
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          booking_id?: string | null
          center_id: string
          comment?: string | null
          created_at?: string
          id?: string
          is_verified?: boolean | null
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          booking_id?: string | null
          center_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          is_verified?: boolean | null
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          center_id: string
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          is_available: boolean | null
          name: string
          price: number
          service_type: Database["public"]["Enums"]["ayush_service_type"]
          updated_at: string
        }
        Insert: {
          center_id: string
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_available?: boolean | null
          name: string
          price: number
          service_type: Database["public"]["Enums"]["ayush_service_type"]
          updated_at?: string
        }
        Update: {
          center_id?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_available?: boolean | null
          name?: string
          price?: number
          service_type?: Database["public"]["Enums"]["ayush_service_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
        ]
      }
      slot_locks: {
        Row: {
          center_id: string
          created_at: string
          doctor_id: string | null
          expires_at: string
          id: string
          locked_at: string
          service_id: string | null
          slot_date: string
          slot_time: string
          user_id: string
        }
        Insert: {
          center_id: string
          created_at?: string
          doctor_id?: string | null
          expires_at?: string
          id?: string
          locked_at?: string
          service_id?: string | null
          slot_date: string
          slot_time: string
          user_id: string
        }
        Update: {
          center_id?: string
          created_at?: string
          doctor_id?: string | null
          expires_at?: string
          id?: string
          locked_at?: string
          service_id?: string | null
          slot_date?: string
          slot_time?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "slot_locks_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "slot_locks_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "slot_locks_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      time_slots: {
        Row: {
          center_id: string
          created_at: string
          day_of_week: number
          doctor_id: string | null
          end_time: string
          id: string
          is_active: boolean | null
          max_bookings: number | null
          start_time: string
        }
        Insert: {
          center_id: string
          created_at?: string
          day_of_week: number
          doctor_id?: string | null
          end_time: string
          id?: string
          is_active?: boolean | null
          max_bookings?: number | null
          start_time: string
        }
        Update: {
          center_id?: string
          created_at?: string
          day_of_week?: number
          doctor_id?: string | null
          end_time?: string
          id?: string
          is_active?: boolean | null
          max_bookings?: number | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_slots_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_slots_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_slot_availability: {
        Args: {
          p_center_id: string
          p_doctor_id: string
          p_exclude_user_id?: string
          p_slot_date: string
          p_slot_time: string
        }
        Returns: boolean
      }
      cleanup_expired_slot_locks: { Args: never; Returns: undefined }
      create_booking_atomic: {
        Args: {
          p_booking_date: string
          p_booking_time: string
          p_center_id: string
          p_doctor_id: string
          p_notes?: string
          p_service_id: string
          p_total_amount?: number
          p_user_id: string
        }
        Returns: string
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      lock_slot: {
        Args: {
          p_center_id: string
          p_doctor_id: string
          p_service_id: string
          p_slot_date: string
          p_slot_time: string
          p_user_id: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "user" | "center" | "admin"
      ayush_service_type:
        | "ayurveda"
        | "yoga"
        | "naturopathy"
        | "unani"
        | "siddha"
        | "homeopathy"
      booking_status:
        | "pending"
        | "confirmed"
        | "completed"
        | "cancelled"
        | "no_show"
        | "pending_payment"
        | "refunded"
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
      app_role: ["user", "center", "admin"],
      ayush_service_type: [
        "ayurveda",
        "yoga",
        "naturopathy",
        "unani",
        "siddha",
        "homeopathy",
      ],
      booking_status: [
        "pending",
        "confirmed",
        "completed",
        "cancelled",
        "no_show",
        "pending_payment",
        "refunded",
      ],
    },
  },
} as const
