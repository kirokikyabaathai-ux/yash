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
      activity_log: {
        Row: {
          action: string
          entity_id: string | null
          entity_type: string
          id: string
          lead_id: string | null
          new_value: Json | null
          old_value: Json | null
          timestamp: string | null
          user_id: string
        }
        Insert: {
          action: string
          entity_id?: string | null
          entity_type: string
          id?: string
          lead_id?: string | null
          new_value?: Json | null
          old_value?: Json | null
          timestamp?: string | null
          user_id: string
        }
        Update: {
          action?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          lead_id?: string | null
          new_value?: Json | null
          old_value?: Json | null
          timestamp?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_profile_drafts: {
        Row: {
          created_at: string | null
          draft_data: Json
          id: string
          lead_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          draft_data: Json
          id?: string
          lead_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          draft_data?: Json
          id?: string
          lead_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_profile_drafts_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_profile_drafts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_profiles: {
        Row: {
          aadhaar_back_path: string | null
          aadhaar_front_path: string | null
          account_holder_name: string
          address_line_1: string
          address_line_2: string | null
          bank_account_number: string
          bank_name: string
          bank_passbook_path: string | null
          cancelled_cheque_path: string | null
          created_at: string | null
          district: string
          electricity_bill_path: string | null
          gender: string | null
          id: string
          ifsc_code: string
          itr_documents_path: string | null
          lead_id: string | null
          name: string
          pan_card_path: string | null
          pin_code: string
          state: string
          status: 'draft' | 'submitted'
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          aadhaar_back_path?: string | null
          aadhaar_front_path?: string | null
          account_holder_name: string
          address_line_1: string
          address_line_2?: string | null
          bank_account_number: string
          bank_name: string
          bank_passbook_path?: string | null
          cancelled_cheque_path?: string | null
          created_at?: string | null
          district: string
          electricity_bill_path?: string | null
          gender?: string | null
          id?: string
          ifsc_code: string
          itr_documents_path?: string | null
          lead_id?: string | null
          name: string
          pan_card_path?: string | null
          pin_code: string
          state: string
          status?: 'draft' | 'submitted'
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          aadhaar_back_path?: string | null
          aadhaar_front_path?: string | null
          account_holder_name?: string
          address_line_1?: string
          address_line_2?: string | null
          bank_account_number?: string
          bank_name?: string
          bank_passbook_path?: string | null
          cancelled_cheque_path?: string | null
          created_at?: string | null
          district?: string
          electricity_bill_path?: string | null
          gender?: string | null
          id?: string
          ifsc_code?: string
          itr_documents_path?: string | null
          lead_id?: string | null
          name?: string
          pan_card_path?: string | null
          pin_code?: string
          state?: string
          status?: 'draft' | 'submitted'
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_profiles_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          document_category: string
          file_name: string
          file_path: string
          file_size: number
          id: string
          lead_id: string
          mime_type: string
          status: string
          type: string
          uploaded_at: string | null
          uploaded_by: string
        }
        Insert: {
          document_category: string
          file_name: string
          file_path: string
          file_size: number
          id?: string
          lead_id: string
          mime_type: string
          status?: string
          type: string
          uploaded_at?: string | null
          uploaded_by: string
        }
        Update: {
          document_category?: string
          file_name?: string
          file_path?: string
          file_size?: number
          id?: string
          lead_id?: string
          mime_type?: string
          status?: string
          type?: string
          uploaded_at?: string | null
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_steps: {
        Row: {
          attachments: string[] | null
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          id: string
          lead_id: string
          remarks: string | null
          status: string
          step_id: string
          updated_at: string | null
        }
        Insert: {
          attachments?: string[] | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          id?: string
          lead_id: string
          remarks?: string | null
          status?: string
          step_id: string
          updated_at?: string | null
        }
        Update: {
          attachments?: string[] | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          id?: string
          lead_id?: string
          remarks?: string | null
          status?: string
          step_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_steps_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_steps_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_steps_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "step_master"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          address: string
          created_at: string | null
          created_by: string | null
          customer_account_id: string | null
          customer_name: string
          email: string | null
          id: string
          installer_id: string | null
          notes: string | null
          phone: string
          source: string
          status: string
          updated_at: string | null
        }
        Insert: {
          address: string
          created_at?: string | null
          created_by?: string | null
          customer_account_id?: string | null
          customer_name: string
          email?: string | null
          id?: string
          installer_id?: string | null
          notes?: string | null
          phone: string
          source: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          address?: string
          created_at?: string | null
          created_by?: string | null
          customer_account_id?: string | null
          customer_name?: string
          email?: string | null
          id?: string
          installer_id?: string | null
          notes?: string | null
          phone?: string
          source?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_customer_account_id_fkey"
            columns: ["customer_account_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_installer_id_fkey"
            columns: ["installer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          lead_id: string | null
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          lead_id?: string | null
          message: string
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          lead_id?: string | null
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      step_master: {
        Row: {
          allowed_roles: string[]
          attachments_allowed: boolean | null
          created_at: string | null
          customer_upload: boolean | null
          id: string
          order_index: number
          remarks_required: boolean | null
          requires_installer_assignment: boolean | null
          step_name: string
          updated_at: string | null
        }
        Insert: {
          allowed_roles: string[]
          attachments_allowed?: boolean | null
          created_at?: string | null
          customer_upload?: boolean | null
          id?: string
          order_index: number
          remarks_required?: boolean | null
          requires_installer_assignment?: boolean | null
          step_name: string
          updated_at?: string | null
        }
        Update: {
          allowed_roles?: string[]
          attachments_allowed?: boolean | null
          created_at?: string | null
          customer_upload?: boolean | null
          id?: string
          order_index?: number
          remarks_required?: boolean | null
          requires_installer_assignment?: boolean | null
          step_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          agent_id: string | null
          assigned_area: string | null
          created_at: string | null
          customer_id: string | null
          email: string
          id: string
          name: string
          office_id: string | null
          phone: string
          role: string
          status: string
          updated_at: string | null
        }
        Insert: {
          agent_id?: string | null
          assigned_area?: string | null
          created_at?: string | null
          customer_id?: string | null
          email: string
          id?: string
          name: string
          office_id?: string | null
          phone: string
          role: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          agent_id?: string | null
          assigned_area?: string | null
          created_at?: string | null
          customer_id?: string | null
          email?: string
          id?: string
          name?: string
          office_id?: string | null
          phone?: string
          role?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_mandatory_documents: { Args: { p_lead_id: string }; Returns: Json }
      complete_step: {
        Args: {
          p_attachments?: string[]
          p_lead_id: string
          p_remarks?: string
          p_step_id: string
          p_user_id: string
        }
        Returns: Json
      }
      generate_unique_user_id: {
        Args: { role_type: string; suffix: string }
        Returns: string
      }
      initialize_lead_timeline: { Args: { p_lead_id: string }; Returns: Json }
      link_customer_to_lead: {
        Args: {
          p_address?: string
          p_customer_id: string
          p_customer_name: string
          p_email?: string
          p_phone: string
        }
        Returns: Json
      }
      normalize_phone: { Args: { phone_input: string }; Returns: string }
      update_lead_status: { Args: { p_lead_id: string }; Returns: Json }
    }
    Enums: {
      customer_profile_status: 'draft' | 'submitted'
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
      customer_profile_status: ['draft', 'submitted'] as const,
    },
  },
} as const

// Type aliases for convenience
export type UserRole = 'admin' | 'agent' | 'office' | 'installer' | 'customer';
export type UserStatus = 'active' | 'disabled';
export type LeadStatus = 
  | 'lead'
  | 'lead_interested'
  | 'lead_processing'
  | 'lead_completed'
  | 'lead_cancelled';
export type LeadSource = 'agent' | 'office' | 'customer' | 'self';
export type DocumentType = 'mandatory' | 'optional' | 'installation' | 'customer' | 'admin';
export type DocumentStatus = 'valid' | 'corrupted' | 'replaced';
export type StepStatus = 'upcoming' | 'pending' | 'completed';
export type CustomerProfileStatus = 'draft' | 'submitted';
