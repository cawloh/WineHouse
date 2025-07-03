import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          auth_user_id: string;
          username: string;
          role: 'admin' | 'staff';
          created_at: string;
          first_name?: string;
          middle_name?: string;
          last_name?: string;
          birthday?: string;
          address?: string;
          contact_number?: string;
          email?: string;
          profile_image?: string;
          profile_updated_at?: string;
          is_active?: boolean;
          last_time_in?: string;
          last_time_out?: string;
        };
        Insert: {
          id?: string;
          auth_user_id: string;
          username: string;
          role: 'admin' | 'staff';
          created_at?: string;
          first_name?: string;
          middle_name?: string;
          last_name?: string;
          birthday?: string;
          address?: string;
          contact_number?: string;
          email?: string;
          profile_image?: string;
          profile_updated_at?: string;
          is_active?: boolean;
          last_time_in?: string;
          last_time_out?: string;
        };
        Update: {
          id?: string;
          auth_user_id?: string;
          username?: string;
          role?: 'admin' | 'staff';
          created_at?: string;
          first_name?: string;
          middle_name?: string;
          last_name?: string;
          birthday?: string;
          address?: string;
          contact_number?: string;
          email?: string;
          profile_image?: string;
          profile_updated_at?: string;
          is_active?: boolean;
          last_time_in?: string;
          last_time_out?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          image_url?: string;
          created_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          name: string;
          image_url?: string;
          created_at?: string;
          created_by: string;
        };
        Update: {
          id?: string;
          name?: string;
          image_url?: string;
          created_at?: string;
          created_by?: string;
        };
      };
      suppliers: {
        Row: {
          id: string;
          name: string;
          contact_number: string;
          created_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          name: string;
          contact_number: string;
          created_at?: string;
          created_by: string;
        };
        Update: {
          id?: string;
          name?: string;
          contact_number?: string;
          created_at?: string;
          created_by?: string;
        };
      };
      stocks: {
        Row: {
          id: string;
          product_id: string;
          quantity: number;
          price: number;
          date_added: string;
          expiry_date: string;
          supplier_id: string;
          created_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          quantity: number;
          price: number;
          date_added: string;
          expiry_date: string;
          supplier_id: string;
          created_at?: string;
          created_by: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          quantity?: number;
          price?: number;
          date_added?: string;
          expiry_date?: string;
          supplier_id?: string;
          created_at?: string;
          created_by?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          product_id: string;
          quantity: number;
          price: number;
          total_price: number;
          transaction_date: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          quantity: number;
          price: number;
          total_price: number;
          transaction_date?: string;
          created_by: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          quantity?: number;
          price?: number;
          total_price?: number;
          transaction_date?: string;
          created_by?: string;
        };
      };
      product_statuses: {
        Row: {
          id: string;
          product_id: string;
          type: 'expired' | 'damaged';
          quantity: number;
          notes: string;
          status: 'pending' | 'approved' | 'rejected';
          image_url?: string;
          reported_by: string;
          reported_at: string;
          reviewed_by?: string;
          reviewed_at?: string;
          review_notes?: string;
          edited_at?: string;
          previous_reports?: any;
        };
        Insert: {
          id?: string;
          product_id: string;
          type: 'expired' | 'damaged';
          quantity: number;
          notes: string;
          status?: 'pending' | 'approved' | 'rejected';
          image_url?: string;
          reported_by: string;
          reported_at?: string;
          reviewed_by?: string;
          reviewed_at?: string;
          review_notes?: string;
          edited_at?: string;
          previous_reports?: any;
        };
        Update: {
          id?: string;
          product_id?: string;
          type?: 'expired' | 'damaged';
          quantity?: number;
          notes?: string;
          status?: 'pending' | 'approved' | 'rejected';
          image_url?: string;
          reported_by?: string;
          reported_at?: string;
          reviewed_by?: string;
          reviewed_at?: string;
          review_notes?: string;
          edited_at?: string;
          previous_reports?: any;
        };
      };
      activity_logs: {
        Row: {
          id: string;
          user_id: string;
          action: string;
          details: string;
          timestamp: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          action: string;
          details: string;
          timestamp?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          action?: string;
          details?: string;
          timestamp?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          read?: boolean;
          created_at?: string;
        };
      };
      attendance_records: {
        Row: {
          id: string;
          user_id: string;
          time_in: string;
          time_out?: string;
          date: string;
          duration?: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          time_in: string;
          time_out?: string;
          date: string;
          duration?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          time_in?: string;
          time_out?: string;
          date?: string;
          duration?: number;
          created_at?: string;
        };
      };
    };
  };
}