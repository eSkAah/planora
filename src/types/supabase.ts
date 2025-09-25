// This file mirrors the SQL schema defined in supabase/migrations.
// It is intentionally handwritten until Supabase CLI codegen is wired.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          name: string;
          country: string;
          sector: string;
          size_category: string | null;
          legal_work_hours_per_week: number | null;
          timezone: string | null;
          settings: Json | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          country: string;
          sector: string;
          size_category?: string | null;
          legal_work_hours_per_week?: number | null;
          timezone?: string | null;
          settings?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          country?: string;
          sector?: string;
          size_category?: string | null;
          legal_work_hours_per_week?: number | null;
          timezone?: string | null;
          settings?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      users: {
        Row: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          role: Database['public']['Enums']['user_role'];
          company_id: string;
          avatar_url: string | null;
          phone: string | null;
          is_active: boolean | null;
          last_login_at: string | null;
          preferences: Json | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          role?: Database['public']['Enums']['user_role'] | null;
          company_id: string;
          avatar_url?: string | null;
          phone?: string | null;
          is_active?: boolean | null;
          last_login_at?: string | null;
          preferences?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string;
          last_name?: string;
          role?: Database['public']['Enums']['user_role'] | null;
          company_id?: string;
          avatar_url?: string | null;
          phone?: string | null;
          is_active?: boolean | null;
          last_login_at?: string | null;
          preferences?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'users_company_id_fkey';
            columns: ['company_id'];
            isOneToOne: false;
            referencedRelation: 'companies';
            referencedColumns: ['id'];
          },
        ];
      };
      employees: {
        Row: {
          id: string;
          user_id: string | null;
          company_id: string;
          employee_number: string | null;
          date_of_birth: string | null;
          address: string | null;
          city: string | null;
          postal_code: string | null;
          emergency_contact_name: string | null;
          emergency_contact_phone: string | null;
          hire_date: string;
          department: string | null;
          position: string | null;
          manager_id: string | null;
          max_hours_per_week: number | null;
          max_consecutive_days: number | null;
          min_rest_hours: number | null;
          skills: string[] | null;
          qualifications: Json | null;
          certifications: Json | null;
          availability: Json | null;
          shift_preferences: Json | null;
          unavailable_dates: Json | null;
          performance_rating: string | null;
          notes: string | null;
          is_active: boolean | null;
          termination_date: string | null;
          termination_reason: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          company_id: string;
          employee_number?: string | null;
          date_of_birth?: string | null;
          address?: string | null;
          city?: string | null;
          postal_code?: string | null;
          emergency_contact_name?: string | null;
          emergency_contact_phone?: string | null;
          hire_date: string;
          department?: string | null;
          position?: string | null;
          manager_id?: string | null;
          max_hours_per_week?: number | null;
          max_consecutive_days?: number | null;
          min_rest_hours?: number | null;
          skills?: string[] | null;
          qualifications?: Json | null;
          certifications?: Json | null;
          availability?: Json | null;
          shift_preferences?: Json | null;
          unavailable_dates?: Json | null;
          performance_rating?: string | null;
          notes?: string | null;
          is_active?: boolean | null;
          termination_date?: string | null;
          termination_reason?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          company_id?: string;
          employee_number?: string | null;
          date_of_birth?: string | null;
          address?: string | null;
          city?: string | null;
          postal_code?: string | null;
          emergency_contact_name?: string | null;
          emergency_contact_phone?: string | null;
          hire_date?: string;
          department?: string | null;
          position?: string | null;
          manager_id?: string | null;
          max_hours_per_week?: number | null;
          max_consecutive_days?: number | null;
          min_rest_hours?: number | null;
          skills?: string[] | null;
          qualifications?: Json | null;
          certifications?: Json | null;
          availability?: Json | null;
          shift_preferences?: Json | null;
          unavailable_dates?: Json | null;
          performance_rating?: string | null;
          notes?: string | null;
          is_active?: boolean | null;
          termination_date?: string | null;
          termination_reason?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'employees_company_id_fkey';
            columns: ['company_id'];
            isOneToOne: false;
            referencedRelation: 'companies';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'employees_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'employees_manager_id_fkey';
            columns: ['manager_id'];
            isOneToOne: false;
            referencedRelation: 'employees';
            referencedColumns: ['id'];
          },
        ];
      };
      contracts: {
        Row: {
          id: string;
          employee_id: string;
          company_id: string;
          contract_type: Database['public']['Enums']['contract_type'];
          title: string;
          description: string | null;
          start_date: string;
          end_date: string | null;
          hours_per_week: string;
          hours_per_day: string | null;
          days_per_week: number | null;
          max_annual_hours: number | null;
          current_annual_hours: number | null;
          overtime_allowed: boolean | null;
          max_overtime_hours_per_week: number | null;
          overtime_rate: string | null;
          is_active: boolean | null;
          signed_at: string | null;
          effective_from: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          employee_id: string;
          company_id: string;
          contract_type: Database['public']['Enums']['contract_type'];
          title: string;
          description?: string | null;
          start_date: string;
          end_date?: string | null;
          hours_per_week: string;
          hours_per_day?: string | null;
          days_per_week?: number | null;
          max_annual_hours?: number | null;
          current_annual_hours?: number | null;
          overtime_allowed?: boolean | null;
          max_overtime_hours_per_week?: number | null;
          overtime_rate?: string | null;
          is_active?: boolean | null;
          signed_at?: string | null;
          effective_from: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          employee_id?: string;
          company_id?: string;
          contract_type?: Database['public']['Enums']['contract_type'];
          title?: string;
          description?: string | null;
          start_date?: string;
          end_date?: string | null;
          hours_per_week?: string;
          hours_per_day?: string | null;
          days_per_week?: number | null;
          max_annual_hours?: number | null;
          current_annual_hours?: number | null;
          overtime_allowed?: boolean | null;
          max_overtime_hours_per_week?: number | null;
          overtime_rate?: string | null;
          is_active?: boolean | null;
          signed_at?: string | null;
          effective_from?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'contracts_company_id_fkey';
            columns: ['company_id'];
            isOneToOne: false;
            referencedRelation: 'companies';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'contracts_employee_id_fkey';
            columns: ['employee_id'];
            isOneToOne: false;
            referencedRelation: 'employees';
            referencedColumns: ['id'];
          },
        ];
      };
      shift_templates: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          description: string | null;
          shift_type: Database['public']['Enums']['shift_type'];
          color_code: string | null;
          start_time: string;
          end_time: string;
          duration_minutes: number | null;
          break_duration_minutes: number | null;
          is_paid_break: boolean | null;
          min_staff_required: number | null;
          max_staff_allowed: number | null;
          required_skills: string[] | null;
          required_qualifications: Json | null;
          is_weekend_shift: boolean | null;
          is_holiday_shift: boolean | null;
          overtime_eligible: boolean | null;
          is_active: boolean | null;
          is_template: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          description?: string | null;
          shift_type: Database['public']['Enums']['shift_type'];
          color_code?: string | null;
          start_time: string;
          end_time: string;
          break_duration_minutes?: number | null;
          is_paid_break?: boolean | null;
          min_staff_required?: number | null;
          max_staff_allowed?: number | null;
          required_skills?: string[] | null;
          required_qualifications?: Json | null;
          is_weekend_shift?: boolean | null;
          is_holiday_shift?: boolean | null;
          overtime_eligible?: boolean | null;
          is_active?: boolean | null;
          is_template?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          company_id?: string;
          name?: string;
          description?: string | null;
          shift_type?: Database['public']['Enums']['shift_type'];
          color_code?: string | null;
          start_time?: string;
          end_time?: string;
          break_duration_minutes?: number | null;
          is_paid_break?: boolean | null;
          min_staff_required?: number | null;
          max_staff_allowed?: number | null;
          required_skills?: string[] | null;
          required_qualifications?: Json | null;
          is_weekend_shift?: boolean | null;
          is_holiday_shift?: boolean | null;
          overtime_eligible?: boolean | null;
          is_active?: boolean | null;
          is_template?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'shift_templates_company_id_fkey';
            columns: ['company_id'];
            isOneToOne: false;
            referencedRelation: 'companies';
            referencedColumns: ['id'];
          },
        ];
      };
      schedules: {
        Row: {
          id: string;
          company_id: string;
          title: string;
          description: string | null;
          start_date: string;
          end_date: string;
          generated_by: string | null;
          generated_at: string | null;
          generation_method: string | null;
          ai_prompt: string | null;
          ai_constraints: Json | null;
          ai_optimization_goals: Json | null;
          status: Database['public']['Enums']['schedule_status'] | null;
          published_at: string | null;
          published_by: string | null;
          total_hours: string | null;
          total_cost: string | null;
          coverage_score: string | null;
          satisfaction_score: string | null;
          version: number | null;
          previous_version_id: string | null;
          notifications_sent: boolean | null;
          notification_sent_at: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          company_id: string;
          title: string;
          description?: string | null;
          start_date: string;
          end_date: string;
          generated_by?: string | null;
          generated_at?: string | null;
          generation_method?: string | null;
          ai_prompt?: string | null;
          ai_constraints?: Json | null;
          ai_optimization_goals?: Json | null;
          status?: Database['public']['Enums']['schedule_status'] | null;
          published_at?: string | null;
          published_by?: string | null;
          total_hours?: string | null;
          total_cost?: string | null;
          coverage_score?: string | null;
          satisfaction_score?: string | null;
          version?: number | null;
          previous_version_id?: string | null;
          notifications_sent?: boolean | null;
          notification_sent_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          company_id?: string;
          title?: string;
          description?: string | null;
          start_date?: string;
          end_date?: string;
          generated_by?: string | null;
          generated_at?: string | null;
          generation_method?: string | null;
          ai_prompt?: string | null;
          ai_constraints?: Json | null;
          ai_optimization_goals?: Json | null;
          status?: Database['public']['Enums']['schedule_status'] | null;
          published_at?: string | null;
          published_by?: string | null;
          total_hours?: string | null;
          total_cost?: string | null;
          coverage_score?: string | null;
          satisfaction_score?: string | null;
          version?: number | null;
          previous_version_id?: string | null;
          notifications_sent?: boolean | null;
          notification_sent_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'schedules_company_id_fkey';
            columns: ['company_id'];
            isOneToOne: false;
            referencedRelation: 'companies';
            referencedColumns: ['id'];
          },
        ];
      };
      schedule_assignments: {
        Row: {
          id: string;
          schedule_id: string;
          employee_id: string;
          shift_template_id: string | null;
          company_id: string;
          date: string;
          start_time: string;
          end_time: string;
          actual_start_time: string | null;
          actual_end_time: string | null;
          break_duration_minutes: number | null;
          break_start_time: string | null;
          break_end_time: string | null;
          status: string | null;
          confirmed_at: string | null;
          confirmed_by: string | null;
          scheduled_hours: string | null;
          actual_hours: string | null;
          is_overtime: boolean | null;
          overtime_hours: string | null;
          notes: string | null;
          employee_notes: string | null;
          manager_notes: string | null;
          original_employee_id: string | null;
          replacement_reason: string | null;
          replacement_requested_at: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          schedule_id: string;
          employee_id: string;
          shift_template_id?: string | null;
          company_id: string;
          date: string;
          start_time: string;
          end_time: string;
          actual_start_time?: string | null;
          actual_end_time?: string | null;
          break_duration_minutes?: number | null;
          break_start_time?: string | null;
          break_end_time?: string | null;
          status?: string | null;
          confirmed_at?: string | null;
          confirmed_by?: string | null;
          scheduled_hours?: string | null;
          actual_hours?: string | null;
          is_overtime?: boolean | null;
          overtime_hours?: string | null;
          notes?: string | null;
          employee_notes?: string | null;
          manager_notes?: string | null;
          original_employee_id?: string | null;
          replacement_reason?: string | null;
          replacement_requested_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          schedule_id?: string;
          employee_id?: string;
          shift_template_id?: string | null;
          company_id?: string;
          date?: string;
          start_time?: string;
          end_time?: string;
          actual_start_time?: string | null;
          actual_end_time?: string | null;
          break_duration_minutes?: number | null;
          break_start_time?: string | null;
          break_end_time?: string | null;
          status?: string | null;
          confirmed_at?: string | null;
          confirmed_by?: string | null;
          scheduled_hours?: string | null;
          actual_hours?: string | null;
          is_overtime?: boolean | null;
          overtime_hours?: string | null;
          notes?: string | null;
          employee_notes?: string | null;
          manager_notes?: string | null;
          original_employee_id?: string | null;
          replacement_reason?: string | null;
          replacement_requested_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'schedule_assignments_company_id_fkey';
            columns: ['company_id'];
            isOneToOne: false;
            referencedRelation: 'companies';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'schedule_assignments_employee_id_fkey';
            columns: ['employee_id'];
            isOneToOne: false;
            referencedRelation: 'employees';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'schedule_assignments_schedule_id_fkey';
            columns: ['schedule_id'];
            isOneToOne: false;
            referencedRelation: 'schedules';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: 'super_admin' | 'admin' | 'manager' | 'employee' | 'viewer';
      contract_type:
        | 'full_time'
        | 'part_time'
        | 'temporary'
        | 'intern'
        | 'freelance';
      shift_type: 'morning' | 'afternoon' | 'evening' | 'night' | 'custom';
      schedule_status: 'draft' | 'published' | 'archived';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
