import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Settings, 
  LogOut, 
  Shield, 
  CreditCard, 
  Calendar,
  Brain,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { Button } from '../shared/Button';
import { supabase } from '../../lib/supabase';

interface AdminDashboardProps {
  onLogout: () => void;
}

interface DashboardStats {
  totalUsers: number;
  pendingUsers: number;
  approvedUsers: number;
  pendingWithdrawals: number;
  totalEarnings: number;
  pendingAppointments: number;
  totalQuizzes: number;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    pendingUsers: 0,
    approvedUsers: 0,
    pendingWithdrawals: 0,
    totalEarnings: 0,
    pendingAppointments: 0,
    totalQuizzes: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentWithdrawals, setRecentWithdrawals] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch users data
      const { data: users } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch withdrawals data
      const { data: withdrawals } = await supabase
        .from('withdrawal_requests')
        .select('*, users(first_name, last_name)')
        .order('requested_at', { ascending: false });

      // Fetch appointments data
      const { data: appointments } = await supabase
        .from('appointments')
        .select('*')
        .eq('status', 'pending');

      // Fetch quizzes data
      const { data: quizzes } = await supabase
        .from('quizzes')
        .select('*');

      if (users) {
        const totalUsers = users.length;
        const pendingUsers = users.filter(u => u.status === 'pending').length;
        const approvedUsers = users.filter(u => u.status === 'approved').length;
        const totalEarnings = users.reduce((sum, user) => sum + (user.total_balance || 0), 0);

        setStats(prev => ({
          ...prev,
          totalUsers,
          pendingUsers,
          approvedUsers,
          totalEarnings,
          pendingWithdrawals: withdrawals?.filter(w => w.status === 'pending').length || 0,
          pendingAppointments: appointments?.length || 0,
          totalQuizzes: quizzes?.length || 0
        }));

        setRecentUsers(users.slice(0, 5));
      }

      if (withdrawals) {
        setRecentWithdrawals(withdrawals.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Admin Dashboard</h2>
        <Button onClick={fetchDashboardData} variant="secondary" size="sm">
          Refresh
        </Button>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Users</p>
              <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Pending Users</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.pendingUsers}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Approved Users</p>
              <p className="text-2xl font-bold text-green-400">{stats.approvedUsers}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Pending Withdrawals</p>
              <p className="text-2xl font-bold text-orange-400">{stats.pendingWithdrawals}</p>
            </div>
            <CreditCard className="w-8 h-8 text-orange-400" />
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Earnings</p>
              <p className="text-2xl font-bold text-purple-400">€{stats.totalEarnings.toFixed(2)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-400" />
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Pending Appointments</p>
              <p className="text-2xl font-bold text-indigo-400">{stats.pendingAppointments}</p>
            </div>
            <Calendar className="w-8 h-8 text-indigo-400" />
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Quizzes</p>
              <p className="text-2xl font-bold text-pink-400">{stats.totalQuizzes}</p>
            </div>
            <Brain className="w-8 h-8 text-pink-400" />
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">System Status</p>
              <p className="text-lg font-bold text-green-400">Online</p>
            </div>
            <Shield className="w-8 h-8 text-green-400" />
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(stats.pendingUsers > 0 || stats.pendingWithdrawals > 0 || stats.pendingAppointments > 0) && (
        <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-xl p-4">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-yellow-400 mr-3 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-300">Action Required</h3>
              <div className="mt-2 text-sm text-yellow-200">
                {stats.pendingUsers > 0 && (
                  <p>• {stats.pendingUsers} user{stats.pendingUsers > 1 ? 's' : ''} pending KYC approval</p>
                )}
                {stats.pendingWithdrawals > 0 && (
                  <p>• {stats.pendingWithdrawals} withdrawal request{stats.pendingWithdrawals > 1 ? 's' : ''} pending review</p>
                )}
                {stats.pendingAppointments > 0 && (
                  <p>• {stats.pendingAppointments} appointment{stats.pendingAppointments > 1 ? 's' : ''} pending confirmation</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Registrations</h3>
          <div className="space-y-3">
            {recentUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between py-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-white">
                      {user.first_name[0]}{user.last_name[0]}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-white">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  user.status === 'pending'
                    ? 'bg-yellow-600/20 text-yellow-300'
                    : user.status === 'approved'
                    ? 'bg-green-600/20 text-green-300'
                    : 'bg-red-600/20 text-red-300'
                }`}>
                  {user.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Withdrawals */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Withdrawals</h3>
          <div className="space-y-3">
            {recentWithdrawals.map((withdrawal) => (
              <div key={withdrawal.id} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-white">
                    {withdrawal.users?.first_name} {withdrawal.users?.last_name}
                  </p>
                  <p className="text-xs text-gray-400">€{withdrawal.amount.toFixed(2)}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  withdrawal.status === 'pending'
                    ? 'bg-yellow-600/20 text-yellow-300'
                    : withdrawal.status === 'approved'
                    ? 'bg-green-600/20 text-green-300'
                    : 'bg-red-600/20 text-red-300'
                }`}>
                  {withdrawal.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};