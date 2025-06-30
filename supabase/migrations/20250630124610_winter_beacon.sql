/*
  # Sample Data for Testing
  
  This migration adds sample users and data for testing the application.
  This is optional and can be removed in production.
*/

-- Insert sample users for testing (these will need to be created through the auth system in practice)
-- Note: In production, users should register through the application

-- Sample admin settings update (if needed)
UPDATE admin_settings SET value = '"Welcome to TrustMission! Complete your missions to earn rewards."' 
WHERE key = 'completion_message';

-- You can add more sample data here if needed for testing
-- For example, sample notifications, appointments, etc.

-- Sample notification for testing (will need actual user IDs)
-- INSERT INTO notifications (user_id, title, message, type) VALUES
-- ('sample-user-id', 'Welcome!', 'Welcome to TrustMission platform!', 'info');