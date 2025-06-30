import React from 'react';
import { Shield, Users, CreditCard, Settings, LogOut, Brain, Calendar, UserCog } from 'lucide-react';
import { Button } from '../shared/Button';

interface AdminHeaderProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  onLogout: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ currentPage, onPageChange, onLogout }) => {
  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: Shield },
    { id: 'users', name: 'Users', icon: Users },
    { id: 'quizzes', name: 'Quiz Management', icon: Brain },
    { id: 'withdrawals', name: 'Withdrawals', icon: CreditCard },
    { id: 'appointments', name: 'Appointments', icon: Calendar },
    { id: 'admins', name: 'Admin Management', icon: UserCog },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  return (
    <header className="bg-gray-900/50 backdrop-blur-md border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 bg-red-600 rounded-lg mr-3">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">TrustMission Admin</h1>
              <p className="text-xs text-gray-400">Platform Management</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    currentPage === item.id
                      ? 'bg-red-600/20 text-red-400'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.name}
                </button>
              );
            })}
          </nav>

          {/* Logout */}
          <Button onClick={onLogout} variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-gray-900/50 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto py-2 space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                    currentPage === item.id
                      ? 'bg-red-600/20 text-red-400'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};