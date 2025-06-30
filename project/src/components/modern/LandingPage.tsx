import React from 'react';
import { ArrowRight, Building2 } from 'lucide-react';
import { Button } from '../shared/Button';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-xl" />
      <div className="absolute bottom-40 left-10 w-24 h-24 bg-blue-500/10 rounded-full blur-xl" />
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        {/* Logo */}
        <div className="mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-2">
            Trust <span className="text-purple-400">MISSION</span>
          </h1>
        </div>

        {/* 3D Purple Swirl Image */}
        <div className="mb-16 relative">
          <div className="w-80 h-80 relative flex items-center justify-center">
            <img 
              src="/a645553e8236bb3fa318f088857d823b90c63ecb (1).png" 
              alt="3D Purple Swirl" 
              className="w-full h-full object-contain"
            />
            {/* Glow effect */}
            <div className="absolute inset-0 bg-purple-500/30 rounded-full blur-2xl scale-110" />
          </div>
        </div>

        {/* Main heading */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Answer. Earn.<br />
            Recommend.
          </h2>
          <p className="text-xl text-gray-300 max-w-md mx-auto">
            Cool missions, earnings for you
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-4 w-full max-w-sm">
          <Button 
            className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-2xl shadow-lg shadow-purple-500/25"
          >
            Get Started
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          
          <Button 
            variant="secondary"
            className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-2xl shadow-lg shadow-blue-500/25 text-white border-0"
          >
            <Building2 className="w-5 h-5 mr-2" />
            ENTERPRISE
          </Button>
        </div>
      </div>
    </div>
  );
};