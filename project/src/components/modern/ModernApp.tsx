import React, { useState } from 'react';
import { ModernAuthForm } from './ModernAuthForm';
import { ModernRegistration } from './ModernRegistration';
import { ModernDashboard } from './ModernDashboard';
import { MissionDetail } from './MissionDetail';
import { ModernQuiz } from './ModernQuiz';
import { ModernWithdrawal } from './ModernWithdrawal';
import { ModernReferral } from './ModernReferral';
import { useAuth } from '../../contexts/AuthContext';

type Page = 'auth' | 'register' | 'dashboard' | 'mission' | 'quiz' | 'withdrawal' | 'referral' | 'enterprise';

export const ModernApp: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('auth');
  const [currentMission, setCurrentMission] = useState<string>('J1');
  const { user, loading } = useAuth();

  const handleLogin = (email: string, password: string) => {
    // Login is handled by the auth form itself
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setCurrentPage('auth');
  };

  const handleRegisterStart = () => {
    setCurrentPage('register');
  };

  const handleRegistrationComplete = () => {
    setCurrentPage('auth');
  };

  const handleMissionClick = (missionId: string) => {
    setCurrentMission(missionId);
    setCurrentPage('mission');
  };

  const handleStartQuiz = () => {
    setCurrentPage('quiz');
  };

  const handleQuizComplete = (passed: boolean, score: number) => {
    // Auto return to dashboard after 3 seconds
    setTimeout(() => {
      setCurrentPage('dashboard');
    }, 3000);
  };

  const handleWithdrawClick = () => {
    setCurrentPage('withdrawal');
  };

  const handleSponsorClick = () => {
    setCurrentPage('referral');
  };

  const handleEnterpriseClick = () => {
    setCurrentPage('enterprise');
  };

  const handleBack = () => {
    if (currentPage === 'mission' || currentPage === 'withdrawal' || currentPage === 'referral') {
      setCurrentPage('dashboard');
    } else if (currentPage === 'quiz') {
      setCurrentPage('mission');
    } else if (currentPage === 'register' || currentPage === 'enterprise') {
      setCurrentPage('auth');
    }
  };

  // Show loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is logged in and approved, show dashboard
  if (user && user.status === 'approved' && currentPage === 'auth') {
    setCurrentPage('dashboard');
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'auth':
        return (
          <ModernAuthForm
            onLogin={handleLogin}
            onRegisterStart={handleRegisterStart}
            onEnterpriseClick={handleEnterpriseClick}
          />
        );
      
      case 'register':
        return (
          <ModernRegistration
            onBack={handleBack}
            onComplete={handleRegistrationComplete}
          />
        );
      
      case 'dashboard':
        return (
          <ModernDashboard
            onMissionClick={handleMissionClick}
            onWithdrawClick={handleWithdrawClick}
            onSponsorClick={handleSponsorClick}
            onLogout={handleLogout}
          />
        );
      
      case 'mission':
        return (
          <MissionDetail
            missionId={currentMission}
            onBack={handleBack}
            onStartQuiz={handleStartQuiz}
          />
        );
      
      case 'quiz':
        return (
          <ModernQuiz
            missionId={currentMission}
            onBack={handleBack}
            onComplete={handleQuizComplete}
          />
        );
      
      case 'withdrawal':
        return (
          <ModernWithdrawal
            onBack={handleBack}
            balance={user?.withdrawableAmount || 0}
          />
        );
      
      case 'referral':
        return (
          <ModernReferral
            onBack={handleBack}
          />
        );

      case 'enterprise':
        return (
          <div className="min-h-screen bg-black text-white relative overflow-hidden flex items-center justify-center p-6">
            <div className="w-full max-w-md text-center">
              <div className="bg-gray-900/50 backdrop-blur-md rounded-3xl p-8 border border-gray-800">
                <h2 className="text-2xl font-bold mb-4">Enterprise Solutions</h2>
                <p className="text-gray-300 mb-6">
                  Contact our team for custom enterprise solutions and bulk user management.
                </p>
                <div className="space-y-4">
                  <p className="text-sm text-gray-400">enterprise@trustmission.com</p>
                  <button
                    onClick={handleBack}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-xl font-semibold transition-all"
                  >
                    Back to Home
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <ModernAuthForm
            onLogin={handleLogin}
            onRegisterStart={handleRegisterStart}
            onEnterpriseClick={handleEnterpriseClick}
          />
        );
    }
  };

  return renderPage();
};