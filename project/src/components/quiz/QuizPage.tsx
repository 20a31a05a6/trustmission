import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Trophy, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { mockQuizzes } from '../../data/mockData';
import { Card } from '../shared/Card';
import { Button } from '../shared/Button';

export const QuizPage: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes per quiz
  
  const quiz = mockQuizzes.find(q => q.id === parseInt(quizId || '0'));
  
  useEffect(() => {
    if (!quiz || !user) {
      navigate('/dashboard');
      return;
    }

    // Check if user has already completed this quiz
    if (user.completedQuizzes.includes(quiz.id)) {
      navigate('/dashboard');
      return;
    }

    // Check if quiz is unlocked
    const registrationDate = new Date(user.createdAt);
    const daysSinceRegistration = Math.floor(
      (Date.now() - registrationDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceRegistration < quiz.unlockDay - 1) {
      navigate('/dashboard');
      return;
    }
  }, [quiz, user, navigate]);

  useEffect(() => {
    if (showResults) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showResults]);

  if (!quiz || !user) return null;

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

  const handleNextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmitQuiz();
    }
  };

  const handleSubmitQuiz = () => {
    const correctAnswers = quiz.questions.filter(
      (question, index) => question.correctAnswer === selectedAnswers[index]
    ).length;

    const passed = correctAnswers >= Math.ceil(quiz.questions.length * 0.7); // 70% pass rate

    if (passed) {
      // Update user data
      const newQuizEarnings = user.quizEarnings + quiz.reward;
      const newTotalBalance = user.totalBalance + quiz.reward;
      const newWithdrawableAmount = user.withdrawableAmount + quiz.reward;
      
      updateUser({
        completedQuizzes: [...user.completedQuizzes, quiz.id],
        quizEarnings: newQuizEarnings,
        totalBalance: newTotalBalance,
        withdrawableAmount: newWithdrawableAmount
      });
    }

    setShowResults(true);
  };

  if (showResults) {
    const correctAnswers = quiz.questions.filter(
      (question, index) => question.correctAnswer === selectedAnswers[index]
    ).length;
    const passed = correctAnswers >= Math.ceil(quiz.questions.length * 0.7);

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl text-center">
          <div className="mb-6">
            {passed ? (
              <div className="flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mx-auto mb-4">
                <Trophy className="w-10 h-10 text-green-600" />
              </div>
            ) : (
              <div className="flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mx-auto mb-4">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
            )}
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {passed ? 'Quiz Completed Successfully!' : 'Quiz Not Passed'}
            </h2>
            
            <p className="text-gray-600 mb-4">
              You answered {correctAnswers} out of {quiz.questions.length} questions correctly
            </p>

            {passed && (
              <div className="bg-green-50 p-4 rounded-lg mb-6">
                <p className="text-green-800 font-semibold">
                  🎉 You earned €{quiz.reward.toFixed(2)}!
                </p>
                <p className="text-sm text-green-700 mt-1">
                  The reward has been added to your account balance.
                </p>
              </div>
            )}

            {!passed && (
              <div className="bg-yellow-50 p-4 rounded-lg mb-6">
                <p className="text-yellow-800 font-semibold">
                  You need at least {Math.ceil(quiz.questions.length * 0.7)} correct answers to pass.
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  Don't worry! You can try this quiz again tomorrow.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4 mb-6">
            <h3 className="font-semibold text-gray-900">Review your answers:</h3>
            {quiz.questions.map((question, index) => (
              <div key={question.id} className="text-left">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {question.correctAnswer === selectedAnswers[index] ? (
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{question.question}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Your answer: {question.options[selectedAnswers[index]] || 'No answer'}
                    </p>
                    {question.correctAnswer !== selectedAnswers[index] && (
                      <p className="text-sm text-green-600 mt-1">
                        Correct answer: {question.options[question.correctAnswer]}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button onClick={() => navigate('/dashboard')} className="w-full">
            Return to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const currentQuestionData = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
              <p className="text-gray-600">Question {currentQuestion + 1} of {quiz.questions.length}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-blue-600">
              <Clock className="w-4 h-4 mr-2" />
              <span className="font-semibold">{formatTime(timeLeft)}</span>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Reward</p>
              <p className="font-bold text-green-600">€{quiz.reward.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <Card className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {currentQuestionData.question}
          </h2>

          <div className="space-y-3">
            {currentQuestionData.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  selectedAnswers[currentQuestion] === index
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full border-2 mr-3 ${
                    selectedAnswers[currentQuestion] === index
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedAnswers[currentQuestion] === index && (
                      <div className="w-full h-full rounded-full bg-white m-0.5" />
                    )}
                  </div>
                  <span className="text-gray-900">{option}</span>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <div />
          <Button
            onClick={handleNextQuestion}
            disabled={selectedAnswers[currentQuestion] === undefined}
            className={selectedAnswers[currentQuestion] === undefined ? 'opacity-50 cursor-not-allowed' : ''}
          >
            {currentQuestion < quiz.questions.length - 1 ? 'Next Question' : 'Submit Quiz'}
          </Button>
        </div>
      </div>
    </div>
  );
};