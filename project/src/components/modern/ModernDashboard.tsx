import React, { useState, useEffect } from 'react';
import { Settings, Users, MessageCircle, ArrowRight, Calendar, Trophy, LogOut, Bell, TrendingUp, Menu, X, CheckCircle, Clock } from 'lucide-react';
import { Button } from '../shared/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import { supabase } from '../../lib/supabase';

interface ModernDashboardProps {
  onMissionClick: (missionId: string) => void;
  onWithdrawClick: () => void;
  onSponsorClick: () => void;
  onLogout?: () => void;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  reward: number;
  unlock_day: number;
  is_active: boolean;
}

interface AdminSettings {
  completion_message: string;
  appointment_enabled: boolean;
  support_whatsapp_number: string;
}

export const ModernDashboard: React.FC<ModernDashboardProps> = ({ 
  onMissionClick, 
  onWithdrawClick, 
  onSponsorClick,
  onLogout 
}) => {
  const { user, refreshUser } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [completedQuizzes, setCompletedQuizzes] = useState<string[]>([]);
  const [adminSettings, setAdminSettings] = useState<AdminSettings>({
    completion_message: '',
    appointment_enabled: false,
    support_whatsapp_number: ''
  });
  const [appointmentData, setAppointmentData] = useState({
    preferredDate: '',
    preferredTime: '',
    message: ''
  });

  useEffect(() => {
    fetchQuizzes();
    fetchCompletedQuizzes();
    fetchAdminSettings();
  }, [user]);

  const fetchQuizzes = async () => {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('is_active', true)
        .order('unlock_day');

      if (error) throw error;
      setQuizzes(data || []);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    }
  };

  const fetchCompletedQuizzes = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('user_quiz_completions')
        .select('quiz_id')
        .eq('user_id', user.id)
        .eq('passed', true);

      if (error) throw error;
      setCompletedQuizzes(data?.map(c => c.quiz_id) || []);
    } catch (error) {
      console.error('Error fetching completed quizzes:', error);
    }
  };

  const fetchAdminSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('key, value')
        .in('key', ['completion_message', 'appointment_enabled', 'support_whatsapp_number']);

      if (error) throw error;

      const settings: any = {};
      data?.forEach(setting => {
        settings[setting.key] = typeof setting.value === 'string' 
          ? JSON.parse(setting.value) 
          : setting.value;
      });

      setAdminSettings(settings);
    } catch (error) {
      console.error('Error fetching admin settings:', error);
    }
  };

  const openWhatsAppSupport = () => {
    const message = encodeURIComponent('Hello TrustMission Support! I need assistance with my account.');
    const supportNumber = adminSettings.support_whatsapp_number.replace(/\D/g, '');
    const url = `https://wa.me/${supportNumber}?text=${message}`;
    window.open(url, '_blank');
  };

  const handleAppointmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('appointments')
        .insert({
          user_id: user.id,
          preferred_date: appointmentData.preferredDate,
          preferred_time: appointmentData.preferredTime,
          message: appointmentData.message || null
        });

      if (error) throw error;

      setShowAppointmentForm(false);
      setAppointmentData({ preferredDate: '', preferredTime: '', message: '' });
      
      // Show success notification
      alert('Appointment request submitted successfully! We will contact you soon.');
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Failed to book appointment. Please try again.');
    }
  };

  const handleAppointmentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAppointmentData(prev => ({ ...prev, [name]: value }));
  };

  const getQuizStatus = (quiz: Quiz) => {
    if (completedQuizzes.includes(quiz.id)) {
      return 'completed';
    }
    
    if (!user) return 'locked';
    
    // Check if quiz is unlocked based on days since registration
    const registrationDate = new Date(user.createdAt);
    const daysSinceRegistration = Math.floor(
      (Date.now() - registrationDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceRegistration >= quiz.unlock_day - 1) {
      return 'available';
    }
    
    return 'locked';
  };

  const getUnlockDate = (quiz: Quiz) => {
    if (!user) return '';
    const registrationDate = new Date(user.createdAt);
    const unlockDate = new Date(registrationDate);
    unlockDate.setDate(registrationDate.getDate() + quiz.unlock_day - 1);
    return unlockDate.toLocaleDateString();
  };

  if (!user) return null;

  const completedMissionsCount = completedQuizzes.length;
  const allMissionsCompleted = user.missionsCompleted;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-4 md:p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 overflow-hidden">
            <img 
              src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop" 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-semibold">Hello {user.firstName}</h2>
            <p className="text-gray-400 text-xs md:text-sm">Welcome back!</p>
          </div>
        </div>
        
        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button 
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            variant="ghost" 
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>

        {/* Desktop Header Actions */}
        <div className="hidden md:flex items-center gap-4">
          {/* WhatsApp Support */}
          <Button 
            onClick={openWhatsAppSupport}
            className="bg-green-500 hover:bg-green-600 rounded-2xl px-4 py-2 font-semibold"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            WhatsApp Support
          </Button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-400 hover:text-white transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-gray-900/95 backdrop-blur-md rounded-2xl border border-gray-800 z-50">
                <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                  <h3 className="font-semibold text-white">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-blue-400 hover:text-blue-300"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-400">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-700 hover:bg-gray-800/50 cursor-pointer ${
                          !notification.read ? 'bg-blue-600/10' : ''
                        }`}
                        onClick={() => !notification.read && markAsRead(notification.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white">{notification.title}</p>
                            <p className="text-xs text-gray-400 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(notification.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1"></div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Settings className="w-5 h-5" />
            </Button>
            {onLogout && (
              <Button 
                onClick={onLogout}
                variant="ghost" 
                size="sm"
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 bg-black/50 z-50 md:hidden">
          <div className="absolute top-0 right-0 w-64 h-full bg-gray-900/95 backdrop-blur-md border-l border-gray-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Menu</h3>
              <Button 
                onClick={() => setShowMobileMenu(false)}
                variant="ghost" 
                size="sm"
                className="text-gray-400"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <Button 
                onClick={() => {
                  openWhatsAppSupport();
                  setShowMobileMenu(false);
                }}
                className="w-full bg-green-500 hover:bg-green-600 rounded-2xl py-3 font-semibold justify-start"
              >
                <MessageCircle className="w-4 h-4 mr-3" />
                WhatsApp Support
              </Button>
              
              <Button 
                onClick={() => setShowMobileMenu(false)}
                variant="ghost" 
                className="w-full text-gray-400 hover:text-white justify-start"
              >
                <Settings className="w-5 h-5 mr-3" />
                Settings
              </Button>
              
              {onLogout && (
                <Button 
                  onClick={() => {
                    onLogout();
                    setShowMobileMenu(false);
                  }}
                  variant="ghost" 
                  className="w-full text-red-400 hover:text-red-300 justify-start"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Logout
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Earnings Overview */}
      <div className="px-4 md:px-6 mb-6 md:mb-8">
        <div className="mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
            Welcome back, {user.firstName}! 👋
          </h2>
          <p className="text-gray-400 text-sm md:text-base">Here's your earning overview</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 mb-6">
          {/* Welcome Bonus */}
          <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-gray-800">
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-green-600/20 rounded-xl mb-2 md:mb-0">
                <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-green-400" />
              </div>
              <div className="md:ml-4">
                <p className="text-xs md:text-sm font-medium text-gray-400">Welcome Bonus</p>
                <p className="text-lg md:text-2xl font-bold text-green-400">€{user.welcomeBonus.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Quiz Earnings */}
          <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-gray-800">
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-purple-600/20 rounded-xl mb-2 md:mb-0">
                <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
              </div>
              <div className="md:ml-4">
                <p className="text-xs md:text-sm font-medium text-gray-400">Quiz Earnings</p>
                <p className="text-lg md:text-2xl font-bold text-purple-400">€{user.quizEarnings.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Referral Earnings */}
          <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-gray-800 col-span-2 md:col-span-1">
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-orange-600/20 rounded-xl mb-2 md:mb-0">
                <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-orange-400" />
              </div>
              <div className="md:ml-4">
                <p className="text-xs md:text-sm font-medium text-gray-400">Referral Earnings</p>
                <p className="text-lg md:text-2xl font-bold text-orange-400">€{user.referralEarnings.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Balance Card */}
      <div className="px-4 md:px-6 mb-6 md:mb-8">
        <div className="bg-gradient-to-r from-orange-200 via-pink-200 to-purple-200 rounded-3xl p-4 md:p-6 text-black">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <p className="text-sm font-medium opacity-80 mb-1">Account Balance</p>
              <p className="text-2xl md:text-3xl font-bold">{user.totalBalance.toFixed(2)} €</p>
              <p className="text-xs opacity-70 mt-1">
                {completedMissionsCount}/7 missions completed
              </p>
            </div>
            <Button 
              onClick={onWithdrawClick}
              className="bg-white/90 text-black hover:bg-white rounded-2xl px-6 py-2 font-semibold shadow-lg w-full md:w-auto"
            >
              WITHDRAW
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-4 md:px-6 mb-6 md:mb-8">
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          <div className="bg-gray-900/50 rounded-2xl p-3 md:p-4 border border-gray-800 text-center">
            <Trophy className="w-5 h-5 md:w-6 md:h-6 text-yellow-500 mx-auto mb-2" />
            <p className="text-xl md:text-2xl font-bold text-yellow-500">{completedMissionsCount}</p>
            <p className="text-xs text-gray-400">Completed</p>
          </div>
          <div className="bg-gray-900/50 rounded-2xl p-3 md:p-4 border border-gray-800 text-center">
            <Calendar className="w-5 h-5 md:w-6 md:h-6 text-blue-500 mx-auto mb-2" />
            <p className="text-xl md:text-2xl font-bold text-blue-500">{allMissionsCompleted ? 0 : 7 - completedMissionsCount}</p>
            <p className="text-xs text-gray-400">Available</p>
          </div>
          <div className="bg-gray-900/50 rounded-2xl p-3 md:p-4 border border-gray-800 text-center">
            <Users className="w-5 h-5 md:w-6 md:h-6 text-purple-500 mx-auto mb-2" />
            <p className="text-xl md:text-2xl font-bold text-purple-500">{user.maxReferrals}</p>
            <p className="text-xs text-gray-400">Max Referrals</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 md:px-6 mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row gap-3">
          <Button 
            onClick={onSponsorClick}
            className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl px-6 py-3 font-semibold flex-1"
          >
            <Users className="w-4 h-4 mr-2" />
            SPONSOR
          </Button>
          <Button 
            onClick={openWhatsAppSupport}
            className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl px-6 py-3 font-semibold flex-1"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            SUPPORT
          </Button>
        </div>
      </div>

      {/* Mission Completion Message */}
      {allMissionsCompleted && (
        <div className="px-4 md:px-6 mb-6 md:mb-8">
          <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 rounded-2xl md:rounded-3xl p-4 md:p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex items-center justify-center w-8 h-8 bg-green-500 rounded-full flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-green-300 mb-2">All Missions Completed!</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {adminSettings.completion_message}
                </p>
              </div>
            </div>
            
            {adminSettings.appointment_enabled && (
              <Button 
                onClick={() => setShowAppointmentForm(true)}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-xl py-3 font-semibold"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Book Appointment
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Pre Mission Section */}
      <div className="px-4 md:px-6 pb-6">
        <h3 className="text-lg md:text-xl font-bold mb-4 md:mb-6">Pre Mission (7 Quizzes over 7 Days)</h3>
        
        {allMissionsCompleted ? (
          <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800 text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-green-600/20 rounded-full mx-auto mb-4">
              <Trophy className="w-8 h-8 text-green-400" />
            </div>
            <h4 className="text-xl font-bold text-green-400 mb-2">All Missions Completed!</h4>
            <p className="text-gray-400 mb-4">
              You've successfully completed all 7 missions and earned €{user.quizEarnings.toFixed(2)} in quiz rewards.
            </p>
            <div className="bg-green-600/20 border border-green-500/30 rounded-xl p-4">
              <p className="text-green-300 text-sm">
                🎯 Mission system is now closed. Contact our team for additional opportunities!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4">
            {quizzes.map((quiz) => {
              const status = getQuizStatus(quiz);
              
              return (
                <div 
                  key={quiz.id} 
                  className={`rounded-2xl p-4 border transition-all ${
                    status === 'available'
                      ? 'bg-gray-900/50 border-gray-800 hover:border-purple-500/50 cursor-pointer active:scale-95'
                      : 'bg-gray-900/30 border-gray-800/50 opacity-60'
                  }`}
                  onClick={() => status === 'available' && onMissionClick(quiz.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-sm font-bold text-purple-400">J{quiz.unlock_day}</span>
                        <h4 className="font-semibold text-white truncate">{quiz.title}</h4>
                        {status === 'completed' && (
                          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        {status === 'locked' && (
                          <div className="w-5 h-5 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-400">5 Questions</p>
                      {status === 'locked' && (
                        <p className="text-xs text-gray-500 mt-1">Unlocks on {getUnlockDate(quiz)}</p>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-bold text-purple-400">€{quiz.reward.toFixed(2)}</p>
                      {status === 'available' && (
                        <ArrowRight className="w-4 h-4 text-gray-400 mt-1 ml-auto" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Appointment Booking Modal */}
      {showAppointmentForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900/95 backdrop-blur-md rounded-2xl p-6 w-full max-w-md border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Book Appointment</h3>
              <Button 
                onClick={() => setShowAppointmentForm(false)}
                variant="ghost" 
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <form onSubmit={handleAppointmentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Preferred Date
                </label>
                <input
                  type="date"
                  name="preferredDate"
                  value={appointmentData.preferredDate}
                  onChange={handleAppointmentChange}
                  required
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Preferred Time
                </label>
                <input
                  type="time"
                  name="preferredTime"
                  value={appointmentData.preferredTime}
                  onChange={handleAppointmentChange}
                  required
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  name="message"
                  value={appointmentData.message}
                  onChange={handleAppointmentChange}
                  rows={3}
                  placeholder="Tell us what you'd like to discuss..."
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-400"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={() => setShowAppointmentForm(false)}
                  variant="secondary"
                  className="flex-1 bg-gray-700 hover:bg-gray-600 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-xl"
                >
                  Book Appointment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Overlay to close notifications */}
      {showNotifications && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowNotifications(false)}
        />
      )}

      {/* Decorative elements */}
      <div className="fixed bottom-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />
      <div className="fixed top-1/2 left-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
    </div>
  );
};