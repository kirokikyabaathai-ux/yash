/**
 * Database Type Definitions
 * 
 * TypeScript types generated from Supabase database schema.
 * These types ensure type safety when interacting with the database.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'admin' | 'agent' | 'office' | 'installer' | 'customer';
export type UserStatus = 'active' | 'disabled';
export type LeadStatus = 'ongoing' | 'interested' | 'not_interested' | 'closed';
export type LeadSource = 'agent' | 'office' | 'customer' | 'self';
export type DocumentType = 'mandatory' | 'optional' | 'installation' | 'customer' | 'admin';
export type DocumentStatus = 'valid' | 'corrupted' | 'replaced';
export type StepStatus = 'upcoming' | 'pending' | 'completed';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          phone: string;
          role: UserRole;
          status: UserStatus;
          assigned_area: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          phone: string;
          role: UserRole;
          status?: UserStatus;
          assigned_area?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          phone?: string;
          role?: UserRole;
          status?: UserStatus;
          assigned_area?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      leads: {
        Row: {
          id: string;
          customer_name: string;
          phone: string;
          email: string | null;
          address: string;
          kw_requirement: number | null;
          roof_type: string | null;
          notes: string | null;
          status: LeadStatus;
          created_by: string | null;
          customer_account_id: string | null;
          installer_id: string | null;
          source: LeadSource;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_name: string;
          phone: string;
          email?: string | null;
          address: string;
          kw_requirement?: number | null;
          roof_type?: string | null;
          notes?: string | null;
          status?: LeadStatus;
          created_by?: string | null;
          customer_account_id?: string | null;
          installer_id?: string | null;
          source: LeadSource;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_name?: string;
          phone?: string;
          email?: string | null;
          address?: string;
          kw_requirement?: number | null;
          roof_type?: string | null;
          notes?: string | null;
          status?: LeadStatus;
          created_by?: string | null;
          customer_account_id?: string | null;
          installer_id?: string | null;
          source?: LeadSource;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'leads_created_by_fkey';
            columns: ['created_by'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'leads_customer_account_id_fkey';
            columns: ['customer_account_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'leads_installer_id_fkey';
            columns: ['installer_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      documents: {
        Row: {
          id: string;
          lead_id: string;
          type: DocumentType;
          document_category: string;
          file_path: string;
          file_name: string;
          file_size: number;
          mime_type: string;
          uploaded_by: string;
          status: DocumentStatus;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          lead_id: string;
          type: DocumentType;
          document_category: string;
          file_path: string;
          file_name: string;
          file_size: number;
          mime_type: string;
          uploaded_by: string;
          status?: DocumentStatus;
          uploaded_at?: string;
        };
        Update: {
          id?: string;
          lead_id?: string;
          type?: DocumentType;
          document_category?: string;
          file_path?: string;
          file_name?: string;
          file_size?: number;
          mime_type?: string;
          uploaded_by?: string;
          status?: DocumentStatus;
          uploaded_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'documents_lead_id_fkey';
            columns: ['lead_id'];
            referencedRelation: 'leads';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'documents_uploaded_by_fkey';
            columns: ['uploaded_by'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      step_master: {
        Row: {
          id: string;
          step_name: string;
          order_index: number;
          allowed_roles: UserRole[];
          remarks_required: boolean;
          attachments_allowed: boolean;
          customer_upload: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          step_name: string;
          order_index: number;
          allowed_roles: UserRole[];
          remarks_required?: boolean;
          attachments_allowed?: boolean;
          customer_upload?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          step_name?: string;
          order_index?: number;
          allowed_roles?: UserRole[];
          remarks_required?: boolean;
          attachments_allowed?: boolean;
          customer_upload?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      lead_steps: {
        Row: {
          id: string;
          lead_id: string;
          step_id: string;
          status: StepStatus;
          completed_by: string | null;
          completed_at: string | null;
          remarks: string | null;
          attachments: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          lead_id: string;
          step_id: string;
          status?: StepStatus;
          completed_by?: string | null;
          completed_at?: string | null;
          remarks?: string | null;
          attachments?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          lead_id?: string;
          step_id?: string;
          status?: StepStatus;
          completed_by?: string | null;
          completed_at?: string | null;
          remarks?: string | null;
          attachments?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'lead_steps_lead_id_fkey';
            columns: ['lead_id'];
            referencedRelation: 'leads';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'lead_steps_step_id_fkey';
            columns: ['step_id'];
            referencedRelation: 'step_master';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'lead_steps_completed_by_fkey';
            columns: ['completed_by'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      pm_suryaghar_form: {
        Row: {
          id: string;
          lead_id: string;
          applicant_name: string;
          applicant_phone: string;
          applicant_email: string | null;
          property_address: string;
          property_type: string;
          roof_type: string;
          roof_area: number | null;
          kw_requirement: number;
          aadhar_number: string;
          pan_number: string;
          bank_account_number: string;
          bank_ifsc: string;
          additional_data: Json | null;
          submitted_by: string;
          submitted_at: string;
        };
        Insert: {
          id?: string;
          lead_id: string;
          applicant_name: string;
          applicant_phone: string;
          applicant_email?: string | null;
          property_address: string;
          property_type: string;
          roof_type: string;
          roof_area?: number | null;
          kw_requirement: number;
          aadhar_number: string;
          pan_number: string;
          bank_account_number: string;
          bank_ifsc: string;
          additional_data?: Json | null;
          submitted_by: string;
          submitted_at?: string;
        };
        Update: {
          id?: string;
          lead_id?: string;
          applicant_name?: string;
          applicant_phone?: string;
          applicant_email?: string | null;
          property_address?: string;
          property_type?: string;
          roof_type?: string;
          roof_area?: number | null;
          kw_requirement?: number;
          aadhar_number?: string;
          pan_number?: string;
          bank_account_number?: string;
          bank_ifsc?: string;
          additional_data?: Json | null;
          submitted_by?: string;
          submitted_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'pm_suryaghar_form_lead_id_fkey';
            columns: ['lead_id'];
            referencedRelation: 'leads';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'pm_suryaghar_form_submitted_by_fkey';
            columns: ['submitted_by'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      activity_log: {
        Row: {
          id: string;
          lead_id: string | null;
          user_id: string;
          action: string;
          entity_type: string;
          entity_id: string | null;
          old_value: Json | null;
          new_value: Json | null;
          timestamp: string;
        };
        Insert: {
          id?: string;
          lead_id?: string | null;
          user_id: string;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          old_value?: Json | null;
          new_value?: Json | null;
          timestamp?: string;
        };
        Update: {
          id?: string;
          lead_id?: string | null;
          user_id?: string;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          old_value?: Json | null;
          new_value?: Json | null;
          timestamp?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'activity_log_lead_id_fkey';
            columns: ['lead_id'];
            referencedRelation: 'leads';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'activity_log_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          lead_id: string | null;
          type: string;
          title: string;
          message: string;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          lead_id?: string | null;
          type: string;
          title: string;
          message: string;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          lead_id?: string | null;
          type?: string;
          title?: string;
          message?: string;
          read?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'notifications_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'notifications_lead_id_fkey';
            columns: ['lead_id'];
            referencedRelation: 'leads';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      link_customer_to_lead: {
        Args: {
          p_customer_id: string;
          p_phone: string;
          p_customer_name: string;
          p_email?: string;
          p_address?: string;
        };
        Returns: Json;
      };
      update_lead_status: {
        Args: {
          p_lead_id: string;
        };
        Returns: Json;
      };
      complete_step: {
        Args: {
          p_lead_id: string;
          p_step_id: string;
          p_user_id: string;
          p_remarks?: string | null;
          p_attachments?: string[] | null;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
