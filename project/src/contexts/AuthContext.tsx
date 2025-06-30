import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  whatsapp: string;
  referralCode: string;
  usedReferralCode?: string;
  status: 'pending' | 'approved' | 'rejected';
  kycPhotos: any;
  contractSigned: boolean;
  welcomeBonus: number;
  quizEarnings: number;
  referralEarnings: number;
  totalBalance: number;
  withdrawableAmount: number;
  maxReferrals: number;
  missionsCompleted: boolean;
  createdAt: string;
  isAdmin?: boolean;
}

export interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<boolean>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  whatsapp: string;
  usedReferralCode?: string;
  kycPhotos?: any;
  contractSigned?: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Admin emails - only these can access admin panel
const ADMIN_EMAILS = [
  'admin@trustmission.com',
  'support@trustmission.com'
];

// Generate a unique referral code
const generateReferralCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const userProfile: User = {
          id: data.id,
          email: data.email,
          firstName: data.first_name,
          lastName: data.last_name,
          dateOfBirth: data.date_of_birth,
          whatsapp: data.whatsapp,
          referralCode: data.referral_code,
          usedReferralCode: data.used_referral_code,
          status: data.status,
          kycPhotos: data.kyc_photos,
          contractSigned: data.contract_signed,
          welcomeBonus: data.welcome_bonus,
          quizEarnings: data.quiz_earnings,
          referralEarnings: data.referral_earnings,
          totalBalance: data.total_balance,
          withdrawableAmount: data.withdrawable_amount,
          maxReferrals: data.max_referrals,
          missionsCompleted: data.missions_completed,
          createdAt: data.created_at
        };
        setUser(userProfile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const refreshUser = async () => {
    if (supabaseUser && !isAdmin) {
      await fetchUserProfile(supabaseUser.id);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.user) {
        // Check if user exists in our users table and is approved
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('status')
          .eq('id', data.user.id)
          .maybeSingle();

        if (userError || !userData) {
          await supabase.auth.signOut();
          throw new Error('User profile not found');
        }

        if (userData.status !== 'approved') {
          await supabase.auth.signOut();
          throw new Error('Account not approved yet');
        }

        await fetchUserProfile(data.user.id);
        setIsAdmin(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      // Check if email is in admin list
      if (!ADMIN_EMAILS.includes(email.toLowerCase())) {
        throw new Error('Not authorized for admin access');
      }

      // For demo purposes, check hardcoded admin credentials
      if (email === 'admin@trustmission.com' && password === 'admin123') {
        // Create a mock admin user
        const adminUser: User = {
          id: 'admin-user',
          email: email,
          firstName: 'Admin',
          lastName: 'User',
          dateOfBirth: '1990-01-01',
          whatsapp: '+1234567890',
          referralCode: 'ADMIN2024',
          status: 'approved',
          kycPhotos: {},
          contractSigned: true,
          welcomeBonus: 0,
          quizEarnings: 0,
          referralEarnings: 0,
          totalBalance: 0,
          withdrawableAmount: 0,
          maxReferrals: 0,
          missionsCompleted: false,
          createdAt: new Date().toISOString(),
          isAdmin: true
        };
        
        setUser(adminUser);
        setIsAdmin(true);
        setLoading(false);
        return true;
      }

      throw new Error('Invalid admin credentials');
    } catch (error) {
      console.error('Admin login error:', error);
      return false;
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      // Step 1: Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: undefined // Disable email confirmation
        }
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('Failed to create user account');
      }

      // Step 2: Generate a unique referral code
      let referralCode = generateReferralCode();
      let isUnique = false;
      let attempts = 0;
      
      // Ensure referral code is unique
      while (!isUnique && attempts < 10) {
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('referral_code', referralCode)
          .maybeSingle();
        
        if (!existingUser) {
          isUnique = true;
        } else {
          referralCode = generateReferralCode();
          attempts++;
        }
      }

      if (!isUnique) {
        throw new Error('Failed to generate unique referral code');
      }

      // Step 3: Create user profile in users table
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: userData.email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          date_of_birth: userData.dateOfBirth,
          whatsapp: userData.whatsapp,
          referral_code: referralCode,
          used_referral_code: userData.usedReferralCode || null,
          status: 'pending',
          kyc_photos: userData.kycPhotos || {},
          contract_signed: userData.contractSigned || false,
          welcome_bonus: 15.00, // Default welcome bonus
          quiz_earnings: 0,
          referral_earnings: 0,
          total_balance: 15.00, // Start with welcome bonus
          withdrawable_amount: 0, // Not withdrawable until approved
          max_referrals: 3, // Default max referrals
          missions_completed: false
        });

      if (profileError) {
        // Check for duplicate email error
        if (profileError.code === '23505' && profileError.message.includes('users_email_key')) {
          throw new Error('This email is already registered. Please use a different email or log in.');
        }
        
        // Note: We cannot delete the auth user from client-side code
        // The orphaned auth user will need to be cleaned up by admin if needed
        console.error('Profile creation failed:', profileError);
        throw profileError;
      }

      // Step 4: Handle referral if provided
      if (userData.usedReferralCode) {
        try {
          // Find the referrer
          const { data: referrer } = await supabase
            .from('users')
            .select('id')
            .eq('referral_code', userData.usedReferralCode.toUpperCase())
            .maybeSingle();

          if (referrer) {
            // Create referral record
            await supabase
              .from('referrals')
              .insert({
                referrer_id: referrer.id,
                referred_id: authData.user.id,
                reward_paid: false
              });
          }
        } catch (referralError) {
          // Don't fail registration if referral processing fails
          console.warn('Referral processing failed:', referralError);
        }
      }

      // Sign out the user since they need admin approval
      await supabase.auth.signOut();

      return true;
    } catch (error) {
      console.error('Registration error:', error);
      throw error; // Re-throw to allow specific error handling in the component
    }
  };

  const updateUser = async (updates: Partial<User>): Promise<void> => {
    if (!user || isAdmin) return;

    try {
      const dbUpdates: any = {};
      
      // Map frontend fields to database fields
      if (updates.firstName) dbUpdates.first_name = updates.firstName;
      if (updates.lastName) dbUpdates.last_name = updates.lastName;
      if (updates.dateOfBirth) dbUpdates.date_of_birth = updates.dateOfBirth;
      if (updates.whatsapp) dbUpdates.whatsapp = updates.whatsapp;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.kycPhotos) dbUpdates.kyc_photos = updates.kycPhotos;
      if (updates.contractSigned !== undefined) dbUpdates.contract_signed = updates.contractSigned;
      if (updates.welcomeBonus !== undefined) dbUpdates.welcome_bonus = updates.welcomeBonus;
      if (updates.quizEarnings !== undefined) dbUpdates.quiz_earnings = updates.quizEarnings;
      if (updates.referralEarnings !== undefined) dbUpdates.referral_earnings = updates.referralEarnings;
      if (updates.totalBalance !== undefined) dbUpdates.total_balance = updates.totalBalance;
      if (updates.withdrawableAmount !== undefined) dbUpdates.withdrawable_amount = updates.withdrawableAmount;
      if (updates.maxReferrals !== undefined) dbUpdates.max_referrals = updates.maxReferrals;
      if (updates.missionsCompleted !== undefined) dbUpdates.missions_completed = updates.missionsCompleted;

      const { error } = await supabase
        .from('users')
        .update(dbUpdates)
        .eq('id', user.id);

      if (error) throw error;

      // Update local state
      setUser(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      if (!isAdmin) {
        await supabase.auth.signOut();
      }
      setUser(null);
      setSupabaseUser(null);
      setIsAdmin(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    // Skip auth session check if we're in admin mode
    if (isAdmin) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupabaseUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (isAdmin) return; // Don't process auth changes in admin mode
        
        setSupabaseUser(session?.user ?? null);
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [isAdmin]);

  return (
    <AuthContext.Provider value={{
      user,
      supabaseUser,
      loading,
      isAdmin,
      login,
      adminLogin,
      logout,
      register,
      updateUser,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};