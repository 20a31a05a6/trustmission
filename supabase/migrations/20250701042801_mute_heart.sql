/*
  # Sample Users and Test Data
  
  This migration adds sample users and test data for development and testing.
  Remove this file in production.
*/

-- Insert sample users for testing
-- Note: These are for development only. In production, users register through the app.

-- Sample user 1 - Approved user with completed missions
INSERT INTO users (
  id,
  email,
  first_name,
  last_name,
  date_of_birth,
  whatsapp,
  referral_code,
  status,
  kyc_photos,
  contract_signed,
  welcome_bonus,
  quiz_earnings,
  referral_earnings,
  total_balance,
  withdrawable_amount,
  max_referrals,
  missions_completed
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'john.doe@example.com',
  'John',
  'Doe',
  '1990-05-15',
  '+1234567890',
  'JOHN2024',
  'approved',
  '{"idFront": "sample-id-front.jpg", "idBack": "sample-id-back.jpg", "selfie": "sample-selfie.jpg"}',
  true,
  15.00,
  50.05,
  40.00,
  105.05,
  105.05,
  3,
  true
);

-- Sample user 2 - Approved user with partial progress
INSERT INTO users (
  id,
  email,
  first_name,
  last_name,
  date_of_birth,
  whatsapp,
  referral_code,
  used_referral_code,
  status,
  kyc_photos,
  contract_signed,
  welcome_bonus,
  quiz_earnings,
  referral_earnings,
  total_balance,
  withdrawable_amount,
  max_referrals,
  missions_completed
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  'jane.smith@example.com',
  'Jane',
  'Smith',
  '1992-08-22',
  '+1234567891',
  'JANE2024',
  'JOHN2024',
  'approved',
  '{"idFront": "sample-id-front-2.jpg", "idBack": "sample-id-back-2.jpg", "selfie": "sample-selfie-2.jpg"}',
  true,
  15.00,
  21.45,
  0.00,
  36.45,
  36.45,
  5,
  false
);

-- Sample user 3 - Pending approval
INSERT INTO users (
  id,
  email,
  first_name,
  last_name,
  date_of_birth,
  whatsapp,
  referral_code,
  used_referral_code,
  status,
  kyc_photos,
  contract_signed,
  welcome_bonus,
  quiz_earnings,
  referral_earnings,
  total_balance,
  withdrawable_amount,
  max_referrals,
  missions_completed
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  'alex.johnson@example.com',
  'Alex',
  'Johnson',
  '1988-03-10',
  '+1234567892',
  'ALEX2024',
  'JOHN2024',
  'pending',
  '{"idFront": "sample-id-front-3.jpg", "idBack": "sample-id-back-3.jpg", "selfie": "sample-selfie-3.jpg"}',
  true,
  0.00,
  0.00,
  0.00,
  0.00,
  0.00,
  3,
  false
);

-- Sample referral relationships
INSERT INTO referrals (referrer_id, referred_id, reward_paid) VALUES
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', true),
  ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', false);

-- Sample quiz completions for John Doe (all quizzes completed)
INSERT INTO user_quiz_completions (user_id, quiz_id, score, passed)
SELECT 
  '11111111-1111-1111-1111-111111111111',
  id,
  5,
  true
FROM quizzes;

-- Sample quiz completions for Jane Smith (3 quizzes completed)
INSERT INTO user_quiz_completions (user_id, quiz_id, score, passed)
SELECT 
  '22222222-2222-2222-2222-222222222222',
  id,
  4,
  true
FROM quizzes
WHERE unlock_day <= 3;

-- Sample withdrawal request
INSERT INTO withdrawal_requests (
  user_id,
  amount,
  account_holder,
  iban,
  bic,
  status
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  90.75,
  'John Doe',
  'DE89370400440532013000',
  'COBADEFFXXX',
  'pending'
);

-- Sample appointment
INSERT INTO appointments (
  user_id,
  preferred_date,
  preferred_time,
  message,
  status
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  '2024-02-01',
  '14:00',
  'I would like to discuss additional earning opportunities after completing all missions.',
  'pending'
);

-- Sample notifications
INSERT INTO notifications (user_id, title, message, type) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Welcome to TrustMission!', 'Your account has been approved and you received €15 welcome bonus.', 'success'),
  ('11111111-1111-1111-1111-111111111111', 'All Missions Completed!', 'Congratulations! You have completed all 7 missions.', 'success'),
  ('22222222-2222-2222-2222-222222222222', 'Account Approved!', 'Your account has been approved! You received €15 welcome bonus.', 'success'),
  ('33333333-3333-3333-3333-333333333333', 'Registration Complete!', 'Your account is pending approval. You will be notified once approved.', 'info');

-- Sample balance adjustment
INSERT INTO balance_adjustments (
  user_id,
  amount,
  type,
  reason,
  adjusted_by
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  10.00,
  'credit',
  'Bonus for excellent performance',
  'admin'
);