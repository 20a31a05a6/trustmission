import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../shared/Button';

export const QuizPage: React.FC = () => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const answers = [
    { id: 'A', text: 'Animal Intelligence' },
    { id: 'B', text: 'Artificial Intelligence' },
    { id: 'B2', text: 'Advanced Computing' }
  ];

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
      
      {/* Decorative curved lines */}
      <div className="absolute top-1/4 right-0 w-64 h-64 opacity-20">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <path d="M 50 50 Q 150 50 150 150 Q 50 150 50 50" stroke="url(#gradient)" strokeWidth="2" fill="none" />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Header */}
      <div className="relative z-10 p-6">
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        <h1 className="text-2xl font-bold mb-8">UNDERSTANDING AI</h1>
      </div>

      {/* Quiz Content */}
      <div className="relative z-10 px-6 flex flex-col justify-center flex-1">
        {/* Question */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-3xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-white">
              1. What does "AI" mean?
            </h2>
          </div>
        </div>

        {/* Answer Options */}
        <div className="space-y-4 mb-8">
          {answers.map((answer) => (
            <button
              key={answer.id}
              onClick={() => setSelectedAnswer(answer.id)}
              className={`w-full p-4 rounded-2xl text-left font-semibold transition-all ${
                selectedAnswer === answer.id
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/25'
                  : 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:shadow-lg hover:shadow-purple-500/25'
              }`}
            >
              <span className="mr-3 font-bold">{answer.id}</span>
              {answer.text}
            </button>
          ))}
        </div>

        {/* Validate Button */}
        <div className="mb-8">
          <Button 
            className={`w-full py-4 text-lg font-semibold rounded-2xl transition-all ${
              selectedAnswer 
                ? 'bg-white text-black hover:bg-gray-100 shadow-lg' 
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
            disabled={!selectedAnswer}
          >
            VALIDATE
          </Button>
        </div>

        {/* 3D Purple Swirl - Bottom */}
        <div className="flex justify-center mt-8">
          <div className="w-48 h-48 relative">
            {/* Main swirl shape */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 rounded-full transform rotate-12 opacity-90" 
                 style={{
                   background: 'conic-gradient(from 0deg, #a855f7, #8b5cf6, #7c3aed, #6d28d9, #5b21b6, #a855f7)',
                   clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)'
                 }}>
            </div>
            
            {/* Inner swirl layers */}
            <div className="absolute inset-2 bg-gradient-to-br from-purple-300 via-purple-400 to-purple-500 rounded-full transform -rotate-6 opacity-80"
                 style={{
                   background: 'conic-gradient(from 45deg, #c084fc, #a855f7, #8b5cf6, #7c3aed, #c084fc)',
                   clipPath: 'polygon(25% 0%, 75% 0%, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0% 75%, 0% 25%)'
                 }}>
            </div>
            
            <div className="absolute inset-4 bg-gradient-to-br from-purple-200 via-purple-300 to-purple-400 rounded-full transform rotate-3 opacity-70"
                 style={{
                   background: 'conic-gradient(from 90deg, #ddd6fe, #c084fc, #a855f7, #8b5cf6, #ddd6fe)',
                   clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)'
                 }}>
            </div>

            {/* Glow effect */}
            <div className="absolute inset-0 bg-purple-500/30 rounded-full blur-xl scale-110" />
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-xl" />
      <div className="absolute bottom-40 left-10 w-24 h-24 bg-blue-500/10 rounded-full blur-xl" />
    </div>
  );
};