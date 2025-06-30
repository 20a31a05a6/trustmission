import React, { useState } from 'react';
import { AdminHeader } from '../admin/AdminHeader';
import { AdminDashboard } from '../admin/AdminDashboard';
import { UserManagement } from '../admin/UserManagement';
import { QuizManagement } from '../admin/QuizManagement';
import { WithdrawalManagement } from '../admin/WithdrawalManagement';
import { AppointmentManagement } from '../admin/AppointmentManagement';
import { AdminSettings } from '../admin/AdminSettings';
import { AdminManagement } from '../admin/AdminManagement';

interface ModernAdminDashboardProps {
  onLogout: () => void;
}

type AdminPage = 'dashboard' | 'users' | 'quizzes' | 'withdrawals' | 'appointments' | 'admins' | 'settings';

export const ModernAdminDashboard: React.FC<ModernAdminDashboardProps> = ({ onLogout }) => {
  const [currentPage, setCurrentPage] = useState<AdminPage>('dashboard');

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <AdminDashboard onLogout={onLogout} />;
      case 'users':
        return <UserManagement />;
      case 'quizzes':
        return <QuizManagement />;
      case 'withdrawals':
        return <WithdrawalManagement />;
      case 'appointments':
        return <AppointmentManagement />;
      case 'admins':
        return <AdminManagement />;
      case 'settings':
        return <AdminSettings />;
      default:
        return <AdminDashboard onLogout={onLogout} />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <AdminHeader 
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onLogout={onLogout}
      />
      
      <main className="container mx-auto px-4 py-8">
        {renderCurrentPage()}
      </main>
    </div>
  );
};