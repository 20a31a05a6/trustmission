-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Service role full access quizzes" ON quizzes;
DROP POLICY IF EXISTS "Service role full access quiz_questions" ON quiz_questions;
DROP POLICY IF EXISTS "Anonymous can read active quizzes" ON quizzes;
DROP POLICY IF EXISTS "Anonymous can read quiz questions" ON quiz_questions;

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