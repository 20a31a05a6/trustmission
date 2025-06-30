-- Function to get quiz with questions
CREATE OR REPLACE FUNCTION get_quiz_with_questions(p_quiz_id uuid)
RETURNS TABLE (
  quiz_id uuid,
  quiz_title text,
  quiz_description text,
  quiz_reward decimal(10,2),
  quiz_unlock_day integer,
  question_id uuid,
  question_text text,
  question_options jsonb,
  correct_answer integer,
  question_order integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    q.id as quiz_id,
    q.title as quiz_title,
    q.description as quiz_description,
    q.reward as quiz_reward,
    q.unlock_day as quiz_unlock_day,
    qq.id as question_id,
    qq.question as question_text,
    qq.options as question_options,
    qq.correct_answer,
    qq.order_index as question_order
  FROM quizzes q
  LEFT JOIN quiz_questions qq ON q.id = qq.quiz_id
  WHERE q.id = p_quiz_id AND q.is_active = true
  ORDER BY qq.order_index;
END;
$$;

-- Function to check if user can access quiz
CREATE OR REPLACE FUNCTION can_user_access_quiz(p_user_id uuid, p_quiz_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_status text;
  user_created_at timestamptz;
  quiz_unlock_day integer;
  days_since_registration integer;
  already_completed boolean;
BEGIN
  -- Check if user is approved
  SELECT status, created_at INTO user_status, user_created_at
  FROM users WHERE id = p_user_id;
  
  IF user_status != 'approved' THEN
    RETURN false;
  END IF;
  
  -- Check if already completed
  SELECT EXISTS(
    SELECT 1 FROM user_quiz_completions 
    WHERE user_id = p_user_id AND quiz_id = p_quiz_id AND passed = true
  ) INTO already_completed;
  
  IF already_completed THEN
    RETURN false;
  END IF;
  
  -- Check if quiz is unlocked based on registration date
  SELECT unlock_day INTO quiz_unlock_day FROM quizzes WHERE id = p_quiz_id;
  
  days_since_registration := EXTRACT(DAY FROM (now() - user_created_at));
  
  RETURN days_since_registration >= (quiz_unlock_day - 1);
END;
$$;

-- Update the complete_quiz function to be more robust
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

  -- Check if user can access this quiz
  IF NOT can_user_access_quiz(p_user_id, p_quiz_id) THEN
    RAISE EXCEPTION 'User cannot access this quiz';
  END IF;

  -- Calculate if passed (70% threshold)
  passed := (p_score::decimal / p_total_questions) >= 0.7;

  -- Insert completion record (will fail if already exists due to unique constraint)
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

    -- Check if all quizzes completed (count passed quizzes)
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