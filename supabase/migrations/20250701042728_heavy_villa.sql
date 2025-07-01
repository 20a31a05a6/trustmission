/*
  # Insert Quiz Questions Data
  
  This migration adds all the quiz questions for the 7 quizzes.
  Each quiz has 5 questions with multiple choice answers.
*/

-- Insert quiz questions for all quizzes
DO $$
DECLARE
    quiz_record RECORD;
BEGIN
    -- Get all quizzes and add questions
    FOR quiz_record IN SELECT id, unlock_day FROM quizzes ORDER BY unlock_day LOOP
        CASE quiz_record.unlock_day
            WHEN 1 THEN
                -- Understanding AI questions
                INSERT INTO quiz_questions (quiz_id, question, options, correct_answer, order_index) VALUES
                (quiz_record.id, 'What does "AI" stand for?', '["Artificial Intelligence", "Automated Intelligence", "Advanced Intelligence", "Applied Intelligence"]', 0, 1),
                (quiz_record.id, 'Which of the following is a common application of AI?', '["Voice assistants", "Manual data entry", "Physical labor", "Traditional calculators"]', 0, 2),
                (quiz_record.id, 'AI systems learn from:', '["Data", "Emotions", "Physical objects", "Time alone"]', 0, 3),
                (quiz_record.id, 'True or False: AI can have emotions like humans.', '["False", "True"]', 0, 4),
                (quiz_record.id, 'Where can we commonly find AI today?', '["Smartphones and websites", "Only in laboratories", "Only in movies", "Nowhere yet"]', 0, 5);
                
            WHEN 2 THEN
                -- AI in Business questions
                INSERT INTO quiz_questions (quiz_id, question, options, correct_answer, order_index) VALUES
                (quiz_record.id, 'How does AI help businesses?', '["Improves decision making and efficiency", "Replaces all human workers", "Only handles accounting", "Makes businesses more expensive"]', 0, 1),
                (quiz_record.id, 'What is a chatbot?', '["An AI program that can chat with customers", "A human customer service agent", "A type of robot", "A messaging app"]', 0, 2),
                (quiz_record.id, 'AI in business is used for:', '["Customer service and data analysis", "Only marketing", "Only sales", "Only manufacturing"]', 0, 3),
                (quiz_record.id, 'Predictive analytics helps businesses:', '["Forecast future trends", "Only track past performance", "Replace all employees", "Eliminate all risks"]', 0, 4),
                (quiz_record.id, 'Which industry benefits from AI?', '["All industries", "Only technology", "Only healthcare", "Only finance"]', 0, 5);
                
            WHEN 3 THEN
                -- AI and KYC questions
                INSERT INTO quiz_questions (quiz_id, question, options, correct_answer, order_index) VALUES
                (quiz_record.id, 'What does KYC stand for?', '["Know Your Customer", "Keep Your Cash", "Key Your Code", "Know Your Company"]', 0, 1),
                (quiz_record.id, 'How does AI improve KYC processes?', '["Automates document verification", "Eliminates the need for documents", "Only works with photos", "Slows down verification"]', 0, 2),
                (quiz_record.id, 'AI can help detect:', '["Fraudulent documents", "Only fake photos", "Only fake names", "Nothing useful"]', 0, 3),
                (quiz_record.id, 'KYC is important for:', '["Financial compliance and security", "Only banks", "Only governments", "Only large companies"]', 0, 4),
                (quiz_record.id, 'AI-powered KYC systems can:', '["Process documents faster than humans", "Only work during business hours", "Only verify photos", "Replace all security measures"]', 0, 5);
                
            WHEN 4 THEN
                -- AI and Cybersecurity questions
                INSERT INTO quiz_questions (quiz_id, question, options, correct_answer, order_index) VALUES
                (quiz_record.id, 'How does AI help with cybersecurity?', '["Detects threats in real-time", "Only prevents viruses", "Only protects emails", "Makes systems slower"]', 0, 1),
                (quiz_record.id, 'AI can identify:', '["Unusual patterns that might indicate attacks", "Only known viruses", "Only email spam", "Only password breaches"]', 0, 2),
                (quiz_record.id, 'Machine learning in cybersecurity:', '["Learns from new threats continuously", "Only works with old threats", "Never improves", "Only works once"]', 0, 3),
                (quiz_record.id, 'AI cybersecurity systems can:', '["Respond to threats automatically", "Only send alerts", "Only work during day time", "Only protect one computer"]', 0, 4),
                (quiz_record.id, 'The main advantage of AI in cybersecurity is:', '["Speed and accuracy of threat detection", "Lower cost only", "Simpler setup", "No human involvement needed"]', 0, 5);
                
            WHEN 5 THEN
                -- AI Ethics questions
                INSERT INTO quiz_questions (quiz_id, question, options, correct_answer, order_index) VALUES
                (quiz_record.id, 'Why is AI ethics important?', '["To ensure AI is used responsibly", "To slow down AI development", "To make AI more expensive", "To limit AI usage"]', 0, 1),
                (quiz_record.id, 'What is algorithmic bias?', '["When AI systems show unfair preferences", "When AI works too fast", "When AI costs too much", "When AI breaks down"]', 0, 2),
                (quiz_record.id, 'Responsible AI development includes:', '["Transparency and fairness", "Only speed", "Only profit", "Only innovation"]', 0, 3),
                (quiz_record.id, 'AI systems should be:', '["Explainable and accountable", "Completely autonomous", "Hidden from users", "Unregulated"]', 0, 4),
                (quiz_record.id, 'Who is responsible for AI ethics?', '["Everyone involved in AI development and use", "Only programmers", "Only companies", "Only governments"]', 0, 5);
                
            WHEN 6 THEN
                -- AI Future Trends questions
                INSERT INTO quiz_questions (quiz_id, question, options, correct_answer, order_index) VALUES
                (quiz_record.id, 'What is expected in the future of AI?', '["More integration in daily life", "Complete replacement of humans", "Disappearance of AI", "Only use in movies"]', 0, 1),
                (quiz_record.id, 'Artificial General Intelligence (AGI) refers to:', '["AI that can perform any intellectual task humans can", "AI that only plays games", "AI that only recognizes images", "AI that only translates languages"]', 0, 2),
                (quiz_record.id, 'Future AI applications might include:', '["Personalized education and healthcare", "Only entertainment", "Only social media", "Only gaming"]', 0, 3),
                (quiz_record.id, 'The impact of AI on jobs will likely be:', '["Transformation of existing roles and creation of new ones", "Complete elimination of all jobs", "No change at all", "Only affecting manual labor"]', 0, 4),
                (quiz_record.id, 'To prepare for the AI future, people should:', '["Learn new skills and stay adaptable", "Avoid all technology", "Only focus on traditional skills", "Stop learning new things"]', 0, 5);
                
            WHEN 7 THEN
                -- AI Implementation questions
                INSERT INTO quiz_questions (quiz_id, question, options, correct_answer, order_index) VALUES
                (quiz_record.id, 'The first step in AI implementation is:', '["Identifying the problem to solve", "Buying expensive hardware", "Hiring more programmers", "Creating a website"]', 0, 1),
                (quiz_record.id, 'Successful AI projects require:', '["Quality data and clear objectives", "Only advanced algorithms", "Only powerful computers", "Only large teams"]', 0, 2),
                (quiz_record.id, 'When implementing AI, companies should:', '["Start small and scale gradually", "Implement everything at once", "Only use the most complex solutions", "Avoid testing"]', 0, 3),
                (quiz_record.id, 'Data quality is important because:', '["AI learns from data, so poor data leads to poor results", "It makes AI faster", "It reduces costs", "It looks more professional"]', 0, 4),
                (quiz_record.id, 'A key factor for AI implementation success is:', '["User training and change management", "Only technical expertise", "Only budget", "Only timeline"]', 0, 5);
        END CASE;
    END LOOP;
END $$;