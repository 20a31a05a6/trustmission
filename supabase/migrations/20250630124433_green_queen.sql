/*
  # TrustMission Platform - Complete Database Schema
  
  This migration creates all necessary tables and functions for the TrustMission platform.
  
  ## Tables Created:
  1. users - User profiles and authentication data
  2. quizzes - Quiz content and configuration  
  3. quiz_questions - Individual quiz questions
  4. user_quiz_completions - Track completed quizzes
  5. withdrawal_requests - Withdrawal request management
  6. referrals - Referral tracking
  7. balance_adjustments - Manual balance adjustments by admin
  8. appointments - Appointment booking system
  9. notifications - User notification system
  10. admin_settings - Platform configuration
  
  ## Security:
  - Row Level Security (RLS) enabled on all tables
  - Policies for user data access and admin management
  
  ## Functions:
  - User registration with referral tracking
  - Quiz completion with reward calculation
  - User approval process
  - Referral reward processing
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table - Core user profiles
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  date_of_birth date NOT NULL,
  whatsapp text NOT NULL,
  referral_code text UNIQUE NOT NULL,
  used_referral_code text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  kyc_photos jsonb DEFAULT '{}',
  contract_signed boolean DEFAULT false,
  welcome_bonus decimal(10,2) DEFAULT 0,
  quiz_earnings decimal(10,2) DEFAULT 0,
  referral_earnings decimal(10,2) DEFAULT 0,
  total_balance decimal(10,2) DEFAULT 0,
  withdrawable_amount decimal(10,2) DEFAULT 0,
  max_referrals integer DEFAULT 3,
  missions_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Quizzes table - Quiz content and configuration
CREATE TABLE IF NOT EXISTS quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  reward decimal(10,2) NOT NULL DEFAULT 7.15,
  unlock_day integer NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Quiz questions table - Individual questions for each quiz
CREATE TABLE IF NOT EXISTS quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE,
  question text NOT NULL,
  options jsonb NOT NULL,
  correct_answer integer NOT NULL,
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- User quiz completions - Track which quizzes users have completed
CREATE TABLE IF NOT EXISTS user_quiz_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE,
  score integer NOT NULL,
  passed boolean NOT NULL,
  completed_at timestamptz DEFAULT now(),
  UNIQUE(user_id, quiz_id)
);

-- Withdrawal requests - Handle user withdrawal requests
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL,
  account_holder text NOT NULL,
  iban text NOT NULL,
  bic text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes text,
  requested_at timestamptz DEFAULT now(),
  processed_at timestamptz
);

-- Referrals tracking - Track referral relationships
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid REFERENCES users(id) ON DELETE CASCADE,
  referred_id uuid REFERENCES users(id) ON DELETE CASCADE,
  reward_paid boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(referrer_id, referred_id)
);

-- Balance adjustments - Manual balance adjustments by admin
CREATE TABLE IF NOT EXISTS balance_adjustments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL,
  type text NOT NULL CHECK (type IN ('credit', 'debit')),
  reason text NOT NULL,
  adjusted_by text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Appointments - User appointment booking
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  preferred_date date NOT NULL,
  preferred_time time NOT NULL,
  message text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Notifications - User notification system
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Admin settings - Platform configuration
CREATE TABLE IF NOT EXISTS admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quiz_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE balance_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read own data" ON users
  FOR SELECT TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid()::text = id::text);

-- RLS Policies for quizzes
CREATE POLICY "Anyone can read active quizzes" ON quizzes
  FOR SELECT TO authenticated
  USING (is_active = true);

CREATE POLICY "Anonymous can read active quizzes" ON quizzes
  FOR SELECT TO anon
  USING (is_active = true);

-- RLS Policies for quiz questions
CREATE POLICY "Anyone can read quiz questions" ON quiz_questions
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Anonymous can read quiz questions" ON quiz_questions
  FOR SELECT TO anon
  USING (true);

-- RLS Policies for user quiz completions
CREATE POLICY "Users can read own completions" ON user_quiz_completions
  FOR SELECT TO authenticated
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own completions" ON user_quiz_completions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid()::text = user_id::text);

-- RLS Policies for withdrawal requests
CREATE POLICY "Users can read own withdrawals" ON withdrawal_requests
  FOR SELECT TO authenticated
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create withdrawal requests" ON withdrawal_requests
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid()::text = user_id::text);

-- RLS Policies for notifications
CREATE POLICY "Users can read own notifications" ON notifications
  FOR SELECT TO authenticated
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE TO authenticated
  USING (auth.uid()::text = user_id::text);

-- RLS Policies for appointments
CREATE POLICY "Users can read own appointments" ON appointments
  FOR SELECT TO authenticated
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create appointments" ON appointments
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid()::text = user_id::text);

-- Service role policies (for admin operations)
CREATE POLICY "Service role full access users" ON users
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access quizzes" ON quizzes
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access quiz_questions" ON quiz_questions
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access user_quiz_completions" ON user_quiz_completions
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access withdrawal_requests" ON withdrawal_requests
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access referrals" ON referrals
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access balance_adjustments" ON balance_adjustments
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access appointments" ON appointments
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access notifications" ON notifications
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access admin_settings" ON admin_settings
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Insert default admin settings
INSERT INTO admin_settings (key, value) VALUES
  ('max_referrals', '3'),
  ('min_withdrawal', '50'),
  ('quiz_reward', '7.15'),
  ('referral_reward', '20'),
  ('welcome_bonus', '15'),
  ('completion_message', '"🎉 Congratulations! You have completed all 7 missions and earned your full rewards. To continue your journey with TrustMission and unlock additional earning opportunities, please book an appointment with our team."'),
  ('appointment_enabled', 'true'),
  ('support_whatsapp_number', '"+1234567890"')
ON CONFLICT (key) DO NOTHING;

-- Insert default quizzes
INSERT INTO quizzes (title, description, reward, unlock_day) VALUES
  ('Understanding AI', 'AI, or artificial intelligence, imitates certain human actions. It learns from data and performs tasks automatically. We find it in phones, robots, or websites.', 7.15, 1),
  ('AI in Business', 'Artificial Intelligence is transforming how businesses operate. From customer service chatbots to predictive analytics, AI helps companies make better decisions.', 7.15, 2),
  ('AI and KYC', 'Learn how AI is revolutionizing Know Your Customer processes in financial services and compliance.', 7.15, 3),
  ('AI and Cybersecurity', 'Discover how artificial intelligence is being used to detect and prevent cyber threats in real-time.', 7.15, 4),
  ('AI Ethics', 'Explore the ethical considerations and responsible development of artificial intelligence systems.', 7.15, 5),
  ('AI Future Trends', 'Look into the future of AI technology and its potential impact on society and business.', 7.15, 6),
  ('AI Implementation', 'Learn practical strategies for implementing AI solutions in various business contexts.', 7.15, 7)
ON CONFLICT DO NOTHING;

-- Function to complete quiz with rewards
CREATE OR REPLACE FUNCTION complete_quiz(
  p_user_id uuid,
  p_quiz_id uuid,
  p_score integer,
  p_total_questions integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  quiz_reward decimal(10,2);
  passed boolean;
  user_status text;
  quiz_count integer;
BEGIN
  -- Check if user is approved
  SELECT status INTO user_status FROM users WHERE id = p_user_id;
  IF user_status != 'approved' THEN
    RAISE EXCEPTION 'User must be approved to complete quizzes';
  END IF;

  -- Calculate if passed (70% threshold)
  passed := (p_score::decimal / p_total_questions) >= 0.7;

  -- Insert completion record
  INSERT INTO user_quiz_completions (user_id, quiz_id, score, passed)
  VALUES (p_user_id, p_quiz_id, p_score, passed)
  ON CONFLICT (user_id, quiz_id) DO NOTHING;

  -- If passed, award points
  IF passed THEN
    SELECT reward INTO quiz_reward FROM quizzes WHERE id = p_quiz_id;
    
    UPDATE users SET
      quiz_earnings = quiz_earnings + quiz_reward,
      total_balance = total_balance + quiz_reward,
      withdrawable_amount = withdrawable_amount + quiz_reward,
      updated_at = now()
    WHERE id = p_user_id;

    -- Create notification
    INSERT INTO notifications (user_id, title, message, type)
    VALUES (p_user_id, 'Quiz Completed!', 'Congratulations! You earned €' || quiz_reward || ' for completing the quiz.', 'success');

    -- Check if all quizzes completed
    SELECT COUNT(*) INTO quiz_count 
    FROM user_quiz_completions 
    WHERE user_id = p_user_id AND passed = true;
    
    IF quiz_count >= 7 THEN
      UPDATE users SET missions_completed = true WHERE id = p_user_id;
      
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (p_user_id, 'All Missions Completed!', 'Amazing! You have completed all 7 missions. Book an appointment to unlock additional opportunities.', 'success');
    END IF;
  ELSE
    -- Create notification for failed quiz
    INSERT INTO notifications (user_id, title, message, type)
    VALUES (p_user_id, 'Quiz Not Passed', 'You need 70% correct answers to pass. You can try again tomorrow!', 'warning');
  END IF;

  RETURN passed;
END;
$$;

-- Function to approve user and grant welcome bonus
CREATE OR REPLACE FUNCTION approve_user(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  welcome_bonus_amount decimal(10,2);
BEGIN
  -- Get welcome bonus amount from settings
  SELECT (value::text)::decimal INTO welcome_bonus_amount 
  FROM admin_settings WHERE key = 'welcome_bonus';

  -- Update user status and add welcome bonus
  UPDATE users SET
    status = 'approved',
    welcome_bonus = welcome_bonus_amount,
    total_balance = total_balance + welcome_bonus_amount,
    withdrawable_amount = withdrawable_amount + welcome_bonus_amount,
    updated_at = now()
  WHERE id = p_user_id;

  -- Create notification
  INSERT INTO notifications (user_id, title, message, type)
  VALUES (p_user_id, 'Account Approved!', 'Your account has been approved! You received €' || welcome_bonus_amount || ' welcome bonus.', 'success');
END;
$$;

-- Function to process referral rewards
CREATE OR REPLACE FUNCTION process_referral_reward(p_referred_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  referrer_record record;
  referral_reward_amount decimal(10,2);
BEGIN
  -- Get referral reward amount
  SELECT (value::text)::decimal INTO referral_reward_amount 
  FROM admin_settings WHERE key = 'referral_reward';

  -- Find referrer and check if reward not already paid
  SELECT r.referrer_id, r.id as referral_id, u.first_name, u.last_name
  INTO referrer_record
  FROM referrals r
  JOIN users u ON u.id = r.referrer_id
  WHERE r.referred_id = p_referred_user_id AND r.reward_paid = false;

  IF referrer_record.referrer_id IS NOT NULL THEN
    -- Update referrer balance
    UPDATE users SET
      referral_earnings = referral_earnings + referral_reward_amount,
      total_balance = total_balance + referral_reward_amount,
      withdrawable_amount = withdrawable_amount + referral_reward_amount,
      updated_at = now()
    WHERE id = referrer_record.referrer_id;

    -- Mark referral as paid
    UPDATE referrals SET reward_paid = true WHERE id = referrer_record.referral_id;

    -- Create notification for referrer
    INSERT INTO notifications (user_id, title, message, type)
    VALUES (referrer_record.referrer_id, 'Referral Reward!', 'You earned €' || referral_reward_amount || ' for referring ' || referrer_record.first_name || ' ' || referrer_record.last_name || '!', 'success');
  END IF;
END;
$$;

-- Trigger to process referral rewards when user completes all missions
CREATE OR REPLACE FUNCTION trigger_referral_reward()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.missions_completed = true AND OLD.missions_completed = false THEN
    PERFORM process_referral_reward(NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER referral_reward_trigger
  AFTER UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION trigger_referral_reward();