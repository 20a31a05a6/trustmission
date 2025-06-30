/*
  # Admin Access Policies

  1. Security
    - Add policies to allow service role access to all tables
    - These policies enable admin operations through the service role key
    
  2. Tables Affected
    - quizzes: Allow service role to perform all operations
    - quiz_questions: Allow service role to perform all operations
    - All other admin-managed tables
*/

-- Ensure service role has full access to quizzes table
CREATE POLICY "Service role full access quizzes" ON quizzes
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Ensure service role has full access to quiz_questions table  
CREATE POLICY "Service role full access quiz_questions" ON quiz_questions
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow anonymous users to read active quizzes (for the main app)
CREATE POLICY "Anonymous can read active quizzes" ON quizzes
  FOR SELECT TO anon
  USING (is_active = true);

-- Allow anonymous users to read quiz questions (for the main app)
CREATE POLICY "Anonymous can read quiz questions" ON quiz_questions
  FOR SELECT TO anon
  USING (true);