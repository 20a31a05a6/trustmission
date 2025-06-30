import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { DashboardHome } from './DashboardHome';
import { UserHeader } from './UserHeader';

export const UserDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <UserHeader />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<DashboardHome />} />
        </Routes>
      </main>
    </div>
  );
};