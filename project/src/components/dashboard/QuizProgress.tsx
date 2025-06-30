import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Lock, CheckCircle, Play, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { mockQuizzes } from '../../data/mockData';
import { Card } from '../shared/Card';
import { Button } from '../shared/Button';

export const QuizProgress: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const getQuizStatus = (quizId: number, unlockDay: number) => {
    if (user.completedQuizzes.includes(quizId)) {
      return 'completed';
    }
    
    // Check if quiz is unlocked based on days since registration
    const registrationDate = new Date(user.createdAt);
    const daysSinceRegistration = Math.floor(
      (Date.now() - registrationDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceRegistration >= unlockDay - 1) {
      return 'available';
    }
    
    return 'locked';
  };

  const getUnlockDate = (unlockDay: number) => {
    const registrationDate = new Date(user.createdAt);
    const unlockDate = new Date(registrationDate);
    unlockDate.setDate(registrationDate.getDate() + unlockDay - 1);
    return unlockDate.toLocaleDateString();
  };

  const completedCount = user.completedQuizzes.length;
  const totalQuizzes = mockQuizzes.length;
  const progressPercentage = (completedCount / totalQuizzes) * 100;

  return (
    <Card>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg mr-3">
              <Brain className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Quiz Progress</h3>
              <p className="text-sm text-gray-600">{completedCount} of {totalQuizzes} completed</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {mockQuizzes.map((quiz) => {
          const status = getQuizStatus(quiz.id, quiz.unlockDay);
          
          return (
            <div
              key={quiz.id}
              className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                status === 'completed'
                  ? 'border-green-200 bg-green-50'
                  : status === 'available'
                  ? 'border-purple-200 bg-purple-50 hover:border-purple-300'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center flex-1">
                <div className="mr-4">
                  {status === 'completed' ? (
                    <div className="flex items-center justify-center w-8 h-8 bg-green-500 rounded-full">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  ) : status === 'available' ? (
                    <div className="flex items-center justify-center w-8 h-8 bg-purple-500 rounded-full">
                      <Play className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-8 h-8 bg-gray-400 rounded-full">
                      <Lock className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <h4 className={`font-medium ${
                    status === 'locked' ? 'text-gray-500' : 'text-gray-900'
                  }`}>
                    Day {quiz.unlockDay}: {quiz.title}
                  </h4>
                  <p className={`text-sm ${
                    status === 'locked' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {quiz.description}
                  </p>
                  {status === 'locked' && (
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3 mr-1" />
                      Unlocks on {getUnlockDate(quiz.unlockDay)}
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <p className={`font-semibold ${
                    status === 'completed' ? 'text-green-600' : 'text-purple-600'
                  }`}>
                    €{quiz.reward.toFixed(2)}
                  </p>
                  {status === 'completed' && (
                    <p className="text-xs text-green-600">Earned ✓</p>
                  )}
                </div>
              </div>

              {status === 'available' && (
                <Button
                  onClick={() => navigate(`/quiz/${quiz.id}`)}
                  size="sm"
                  className="ml-4"
                >
                  Start Quiz
                </Button>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> Complete all 7 quizzes to earn €50.05 total! 
          Quizzes unlock daily starting from your registration date.
        </p>
      </div>
    </Card>
  );
};