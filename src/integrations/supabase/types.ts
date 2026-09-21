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
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      application_documents: {
        Row: {
          application_id: string
          created_at: string
          document_name: string
          file_name: string | null
          id: string
          status: string
        }
        Insert: {
          application_id: string
          created_at?: string
          document_name: string
          file_name?: string | null
          id?: string
          status?: string
        }
        Update: {
          application_id?: string
          created_at?: string
          document_name?: string
          file_name?: string | null
          id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_documents_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          application_ref: string
          consent_given: boolean
          created_at: string
          extra_answers: Json
          id: string
          profile_id: string
          profile_snapshot: Json
          scheme_id: string
          status: string
          submitted_at: string
        }
        Insert: {
          application_ref: string
          consent_given?: boolean
          created_at?: string
          extra_answers?: Json
          id?: string
          profile_id: string
          profile_snapshot?: Json
          scheme_id: string
          status?: string
          submitted_at?: string
        }
        Update: {
          application_ref?: string
          consent_given?: boolean
          created_at?: string
          extra_answers?: Json
          id?: string
          profile_id?: string
          profile_snapshot?: Json
          scheme_id?: string
          status?: string
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_scheme_id_fkey"
            columns: ["scheme_id"]
            isOneToOne: false
            referencedRelation: "schemes"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          is_read: boolean
          profile_id: string
          scheme_id: string | null
          title: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_read?: boolean
          profile_id: string
          scheme_id?: string | null
          title: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_read?: boolean
          profile_id?: string
          scheme_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_scheme_id_fkey"
            columns: ["scheme_id"]
            isOneToOne: false
            referencedRelation: "schemes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          annual_income: number | null
          area_type: string | null
          course: string | null
          created_at: string
          date_of_birth: string | null
          disability: boolean
          district: string | null
          education_level: string | null
          employment_status: string | null
          farmer: boolean
          full_name: string | null
          gender: string | null
          id: string
          institution: string | null
          is_demo: boolean
          occupation_type: string | null
          social_category: string | null
          state: string | null
          updated_at: string
          user_id: string | null
          year_of_study: string | null
        }
        Insert: {
          annual_income?: number | null
          area_type?: string | null
          course?: string | null
          created_at?: string
          date_of_birth?: string | null
          disability?: boolean
          district?: string | null
          education_level?: string | null
          employment_status?: string | null
          farmer?: boolean
          full_name?: string | null
          gender?: string | null
          id?: string
          institution?: string | null
          is_demo?: boolean
          occupation_type?: string | null
          social_category?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string | null
          year_of_study?: string | null
        }
        Update: {
          annual_income?: number | null
          area_type?: string | null
          course?: string | null
          created_at?: string
          date_of_birth?: string | null
          disability?: boolean
          district?: string | null
          education_level?: string | null
          employment_status?: string | null
          farmer?: boolean
          full_name?: string | null
          gender?: string | null
          id?: string
          institution?: string | null
          is_demo?: boolean
          occupation_type?: string | null
          social_category?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string | null
          year_of_study?: string | null
        }
        Relationships: []
      }
      schemes: {
        Row: {
          age_max: number | null
          age_min: number | null
          application_deadline: string | null
          benefit: string
          category: string
          category_requirement: string[]
          created_at: string
          description: string
          disability_required: boolean
          education_requirement: string[]
          farmer_required: boolean
          gender_requirement: string | null
          id: string
          income_max: number | null
          is_demo: boolean
          official_url: string | null
          required_documents: string[]
          rural_required: boolean
          scheme_name: string
          scheme_specific_fields: Json
          state: string
          student_required: boolean
        }
        Insert: {
          age_max?: number | null
          age_min?: number | null
          application_deadline?: string | null
          benefit: string
          category?: string
          category_requirement?: string[]
          created_at?: string
          description: string
          disability_required?: boolean
          education_requirement?: string[]
          farmer_required?: boolean
          gender_requirement?: string | null
          id?: string
          income_max?: number | null
          is_demo?: boolean
          official_url?: string | null
          required_documents?: string[]
          rural_required?: boolean
          scheme_name: string
          scheme_specific_fields?: Json
          state?: string
          student_required?: boolean
        }
        Update: {
          age_max?: number | null
          age_min?: number | null
          application_deadline?: string | null
          benefit?: string
          category?: string
          category_requirement?: string[]
          created_at?: string
          description?: string
          disability_required?: boolean
          education_requirement?: string[]
          farmer_required?: boolean
          gender_requirement?: string | null
          id?: string
          income_max?: number | null
          is_demo?: boolean
          official_url?: string | null
          required_documents?: string[]
          rural_required?: boolean
          scheme_name?: string
          scheme_specific_fields?: Json
          state?: string
          student_required?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      owns_profile: { Args: { _profile_id: string }; Returns: boolean }
      profile_matches_scheme: {
        Args: {
          p: Database["public"]["Tables"]["profiles"]["Row"]
          s: Database["public"]["Tables"]["schemes"]["Row"]
        }
        Returns: boolean
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
