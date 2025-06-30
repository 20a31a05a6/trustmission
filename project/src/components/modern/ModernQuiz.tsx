import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, CheckCircle, XCircle, Trophy } from 'lucide-react';
import { Button } from '../shared/Button';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface ModernQuizProps {
  missionId: string;
  onBack: () => void;
  onComplete: (passed: boolean, score: number) => void;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  reward: number;
  unlock_day: number;
}

interface Question {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  order_index: number;
}

export const ModernQuiz: React.FC<ModernQuizProps> = ({ missionId, onBack, onComplete }) => {
  const { user, refreshUser } = useAuth();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizData();
  }, [missionId]);

  useEffect(() => {
    if (showResults || !quiz) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showResults, quiz]);

  const fetchQuizData = async () => {
    try {
      // Fetch quiz by unlock_day (missionId is like "J1", "J2", etc.)
      const unlockDay = parseInt(missionId.replace('J', ''));
      
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('unlock_day', unlockDay)
        .eq('is_active', true)
        .single();

      if (quizError) throw quizError;

      setQuiz(quizData);

      // Fetch questions for this quiz
      const { data: questionsData, error: questionsError } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quizData.id)
        .order('order_index');

      if (questionsError) throw questionsError;

      setQuestions(questionsData || []);
      setSelectedAnswers(new Array(questionsData?.length || 0).fill(-1));
    } catch (error) {
      console.error('Error fetching quiz data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!quiz || !user) return;

    const correctAnswers = questions.filter(
      (question, index) => question.correct_answer === selectedAnswers[index]
    ).length;

    const score = correctAnswers;
    const passed = (correctAnswers / questions.length) >= 0.7; // 70% pass rate

    try {
      // Call the complete_quiz function
      const { data, error } = await supabase.rpc('complete_quiz', {
        p_user_id: user.id,
        p_quiz_id: quiz.id,
        p_score: score,
        p_total_questions: questions.length
      });

      if (error) throw error;

      // Refresh user data to get updated balances
      await refreshUser();

      setShowResults(true);
      onComplete(passed, (score / questions.length) * 100);
    } catch (error) {
      console.error('Error completing quiz:', error);
      setShowResults(true);
      onComplete(false, 0);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Quiz not found or no questions available</p>
          <Button onClick={onBack}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  if (showResults) {
    const correctAnswers = questions.filter(
      (question, index) => question.correct_answer === selectedAnswers[index]
    ).length;
    const score = (correctAnswers / questions.length) * 100;
    const passed = score >= 70;

    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl md:rounded-3xl p-6 md:p-8 border border-gray-800 text-center">
            <div className="mb-6">
              {passed ? (
                <div className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-green-600/20 rounded-full mx-auto mb-4">
                  <Trophy className="w-8 h-8 md:w-10 md:h-10 text-green-400" />
                </div>
              ) : (
                <div className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-red-600/20 rounded-full mx-auto mb-4">
                  <XCircle className="w-8 h-8 md:w-10 md:h-10 text-red-400" />
                </div>
              )}
              
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                {passed ? 'Mission Complete!' : 'Mission Failed'}
              </h2>
              
              <p className="text-lg md:text-xl text-gray-300 mb-6">
                You scored {correctAnswers}/{questions.length} ({Math.round(score)}%)
              </p>

              {passed && (
                <div className="bg-green-600/20 border border-green-500/30 rounded-xl md:rounded-2xl p-4 md:p-6 mb-6">
                  <p className="text-green-300 font-semibold text-lg">
                    🎉 You earned €{quiz.reward.toFixed(2)}!
                  </p>
                  <p className="text-sm text-green-400 mt-1">
                    Reward added to your account balance
                  </p>
                </div>
              )}

              {!passed && (
                <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-xl md:rounded-2xl p-4 md:p-6 mb-6">
                  <p className="text-yellow-300 font-semibold">
                    You need 70% to pass this mission
                  </p>
                  <p className="text-sm text-yellow-400 mt-1">
                    Don't worry! You can try again tomorrow
                  </p>
                </div>
              )}
            </div>

            <Button 
              onClick={onBack}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-xl font-semibold"
            >
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
      
      {/* Header */}
      <div className="relative z-10 p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div className="flex items-center">
            <Button variant="ghost" onClick={onBack} className="mr-4 text-gray-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold mb-1">{quiz.title}</h1>
              <p className="text-gray-400 text-sm">Question {currentQuestion + 1} of {questions.length}</p>
            </div>
          </div>
          
          <div className="flex items-center text-blue-400">
            <Clock className="w-4 h-4 mr-2" />
            <span className="font-semibold">{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6 md:mb-8">
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-600 to-purple-700 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quiz Content */}
      <div className="relative z-10 px-4 md:px-6 flex flex-col justify-center flex-1">
        {/* Question */}
        <div className="mb-6 md:mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl md:rounded-3xl p-4 md:p-6 mb-6 md:mb-8">
            <h2 className="text-lg md:text-xl font-semibold text-white">
              {currentQuestion + 1}. {currentQ.question}
            </h2>
          </div>
        </div>

        {/* Answer Options */}
        <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
          {currentQ.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              className={`w-full p-4 rounded-xl md:rounded-2xl text-left font-semibold transition-all ${
                selectedAnswers[currentQuestion] === index
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/25 border-2 border-purple-400'
                  : 'bg-gray-800/50 border-2 border-gray-700 text-white hover:border-purple-500/50 hover:bg-gray-800/70'
              }`}
            >
              <span className="mr-3 font-bold text-purple-300">
                {String.fromCharCode(65 + index)}
              </span>
              {option}
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 md:mb-8 gap-4">
          <div className="text-sm text-gray-400 text-center sm:text-left">
            {selectedAnswers[currentQuestion] !== -1 ? 'Answer selected' : 'Select an answer to continue'}
          </div>
          
          <Button 
            onClick={handleNext}
            disabled={selectedAnswers[currentQuestion] === -1}
            className={`px-6 md:px-8 py-3 rounded-xl font-semibold w-full sm:w-auto ${
              selectedAnswers[currentQuestion] !== -1
                ? 'bg-white text-black hover:bg-gray-100 shadow-lg' 
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {currentQuestion < questions.length - 1 ? 'NEXT' : 'VALIDATE'}
          </Button>
        </div>

        {/* 3D Purple Swirl Image - Bottom */}
        <div className="flex justify-center mt-4 md:mt-8">
          <div className="w-32 h-32 md:w-48 md:h-48 relative flex items-center justify-center">
            <img 
              src="/a645553e8236bb3fa318f088857d823b90c63ecb (1).png" 
              alt="3D Purple Swirl" 
              className="w-full h-full object-contain"
            />
            {/* Glow effect */}
            <div className="absolute inset-0 bg-purple-500/30 rounded-full blur-xl scale-110" />
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-16 h-16 md:w-32 md:h-32 bg-purple-500/10 rounded-full blur-xl" />
      <div className="absolute bottom-40 left-10 w-12 h-12 md:w-24 md:h-24 bg-blue-500/10 rounded-full blur-xl" />
    </div>
  );
};