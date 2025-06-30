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
          email: string;
          first_name: string;
          last_name: string;
          date_of_birth: string;
          whatsapp: string;
          referral_code: string;
          used_referral_code: string | null;
          status: 'pending' | 'approved' | 'rejected';
          kyc_photos: any;
          contract_signed: boolean;
          welcome_bonus: number;
          quiz_earnings: number;
          referral_earnings: number;
          total_balance: number;
          withdrawable_amount: number;
          max_referrals: number;
          missions_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          first_name: string;
          last_name: string;
          date_of_birth: string;
          whatsapp: string;
          referral_code: string;
          used_referral_code?: string | null;
          status?: 'pending' | 'approved' | 'rejected';
          kyc_photos?: any;
          contract_signed?: boolean;
          welcome_bonus?: number;
          quiz_earnings?: number;
          referral_earnings?: number;
          total_balance?: number;
          withdrawable_amount?: number;
          max_referrals?: number;
          missions_completed?: boolean;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string;
          last_name?: string;
          date_of_birth?: string;
          whatsapp?: string;
          referral_code?: string;
          used_referral_code?: string | null;
          status?: 'pending' | 'approved' | 'rejected';
          kyc_photos?: any;
          contract_signed?: boolean;
          welcome_bonus?: number;
          quiz_earnings?: number;
          referral_earnings?: number;
          total_balance?: number;
          withdrawable_amount?: number;
          max_referrals?: number;
          missions_completed?: boolean;
          updated_at?: string;
        };
      };
      quizzes: {
        Row: {
          id: string;
          title: string;
          description: string;
          reward: number;
          unlock_day: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          reward?: number;
          unlock_day: number;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          reward?: number;
          unlock_day?: number;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      quiz_questions: {
        Row: {
          id: string;
          quiz_id: string;
          question: string;
          options: string[];
          correct_answer: number;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          quiz_id: string;
          question: string;
          options: string[];
          correct_answer: number;
          order_index: number;
        };
        Update: {
          id?: string;
          quiz_id?: string;
          question?: string;
          options?: string[];
          correct_answer?: number;
          order_index?: number;
        };
      };
      user_quiz_completions: {
        Row: {
          id: string;
          user_id: string;
          quiz_id: string;
          score: number;
          passed: boolean;
          completed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          quiz_id: string;
          score: number;
          passed: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          quiz_id?: string;
          score?: number;
          passed?: boolean;
        };
      };
      withdrawal_requests: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          account_holder: string;
          iban: string;
          bic: string;
          status: 'pending' | 'approved' | 'rejected';
          admin_notes: string | null;
          requested_at: string;
          processed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          account_holder: string;
          iban: string;
          bic: string;
          status?: 'pending' | 'approved' | 'rejected';
          admin_notes?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          account_holder?: string;
          iban?: string;
          bic?: string;
          status?: 'pending' | 'approved' | 'rejected';
          admin_notes?: string | null;
          processed_at?: string | null;
        };
      };
      appointments: {
        Row: {
          id: string;
          user_id: string;
          preferred_date: string;
          preferred_time: string;
          message: string | null;
          status: 'pending' | 'confirmed' | 'cancelled';
          admin_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          preferred_date: string;
          preferred_time: string;
          message?: string | null;
          status?: 'pending' | 'confirmed' | 'cancelled';
          admin_notes?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          preferred_date?: string;
          preferred_time?: string;
          message?: string | null;
          status?: 'pending' | 'confirmed' | 'cancelled';
          admin_notes?: string | null;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: 'info' | 'success' | 'warning' | 'error';
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          type?: 'info' | 'success' | 'warning' | 'error';
          read?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          type?: 'info' | 'success' | 'warning' | 'error';
          read?: boolean;
        };
      };
      admin_settings: {
        Row: {
          id: string;
          key: string;
          value: any;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value: any;
        };
        Update: {
          id?: string;
          key?: string;
          value?: any;
          updated_at?: string;
        };
      };
    };
  };
}