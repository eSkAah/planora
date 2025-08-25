/**
 * Database Types
 *
 * TypeScript definitions for the Supabase database schema.
 * These types will be generated from the actual Supabase schema.
 */

// Basic database types that will be extended as we build the schema
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
      // Companies table (multi-tenant)
      companies: {
        Row: {
          id: string;
          name: string;
          country: string;
          sector: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          country: string;
          sector: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          country?: string;
          sector?: string;
          created_at?: string;
          updated_at?: string;
        };
      };

      // Users table with roles
      users: {
        Row: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          role: 'super_admin' | 'admin' | 'manager' | 'employee' | 'viewer';
          company_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          first_name: string;
          last_name: string;
          role?: 'super_admin' | 'admin' | 'manager' | 'employee' | 'viewer';
          company_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string;
          last_name?: string;
          role?: 'super_admin' | 'admin' | 'manager' | 'employee' | 'viewer';
          company_id?: string;
          created_at?: string;
          updated_at?: string;
        };
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
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
