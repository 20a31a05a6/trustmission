import React from 'react';
import { ArrowLeft, Play, Clock, Trophy } from 'lucide-react';
import { Button } from '../shared/Button';

interface MissionDetailProps {
  missionId: string;
  onBack: () => void;
  onStartQuiz: () => void;
}

export const MissionDetail: React.FC<MissionDetailProps> = ({ missionId, onBack, onStartQuiz }) => {
  const missionData = {
    J1: {
      title: 'UNDERSTANDING AI',
      description: 'AI, or artificial intelligence, imitates certain human actions. It learns from data and performs tasks automatically. We find it in phones, robots, or websites.\n\nAI has no emotions, it just does what we call it to do.',
      questions: 5,
      reward: 7.15,
      timeEstimate: '5-10 minutes'
    },
    J2: {
      title: 'AI IN BUSINESS',
      description: 'Artificial Intelligence is transforming how businesses operate. From customer service chatbots to predictive analytics, AI helps companies make better decisions and improve efficiency.\n\nLearn how AI is being used across different industries.',
      questions: 5,
      reward: 7.15,
      timeEstimate: '5-10 minutes'
    }
  };

  const mission = missionData[missionId as keyof typeof missionData] || missionData.J1;

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
      
      {/* Header */}
      <div className="relative z-10 p-4 md:p-6">
        <Button variant="ghost" onClick={onBack} className="mb-4 text-gray-400 hover:text-white">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        <h1 className="text-xl md:text-2xl font-bold mb-2">{mission.title}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{mission.timeEstimate}</span>
          </div>
          <div className="flex items-center gap-1">
            <Trophy className="w-4 h-4" />
            <span>€{mission.reward}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 md:px-6">
        {/* Mission Description */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl md:rounded-3xl p-4 md:p-6 mb-6 md:mb-8">
          <p className="text-white leading-relaxed whitespace-pre-line text-sm md:text-base">
            {mission.description}
          </p>
        </div>

        {/* Mission Stats */}
        <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="bg-gray-900/50 rounded-xl md:rounded-2xl p-4 border border-gray-800 text-center">
            <p className="text-xl md:text-2xl font-bold text-purple-400">{mission.questions}</p>
            <p className="text-sm text-gray-400">Questions</p>
          </div>
          <div className="bg-gray-900/50 rounded-xl md:rounded-2xl p-4 border border-gray-800 text-center">
            <p className="text-xl md:text-2xl font-bold text-green-400">€{mission.reward}</p>
            <p className="text-sm text-gray-400">Reward</p>
          </div>
        </div>

        {/* Go Quiz Button */}
        <div className="mb-8 md:mb-16">
          <Button 
            onClick={onStartQuiz}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-xl md:rounded-2xl py-3 md:py-4 text-lg font-semibold shadow-lg shadow-purple-500/25"
          >
            <Play className="w-5 h-5 mr-2" />
            GO QUIZ
          </Button>
        </div>

        {/* Tips */}
        <div className="bg-blue-600/20 border border-blue-500/30 rounded-xl md:rounded-2xl p-4 md:p-6 mb-6 md:mb-8">
          <h3 className="font-semibold text-blue-300 mb-3">💡 Tips for Success</h3>
          <ul className="text-sm text-gray-300 space-y-2">
            <li>• Read each question carefully</li>
            <li>• You need 70% correct answers to pass</li>
            <li>• Take your time - there's no rush</li>
            <li>• You can retake the quiz if needed</li>
          </ul>
        </div>

        {/* 3D Purple Swirl Image - Bottom */}
        <div className="flex justify-center pb-6">
          <div className="w-48 h-48 md:w-64 md:h-64 relative flex items-center justify-center">
            <img 
              src="/a645553e8236bb3fa318f088857d823b90c63ecb (1).png" 
              alt="3D Purple Swirl" 
              className="w-full h-full object-contain"
            />
            {/* Glow effect */}
            <div className="absolute inset-0 bg-purple-500/30 rounded-full blur-2xl scale-110" />
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-16 h-16 md:w-32 md:h-32 bg-purple-500/10 rounded-full blur-xl" />
      <div className="absolute bottom-40 left-10 w-12 h-12 md:w-24 md:h-24 bg-blue-500/10 rounded-full blur-xl" />
    </div>
  );
};