import React, { useState, useEffect } from 'react';
import { Eye, CheckCircle, XCircle, MessageCircle, Calendar, X } from 'lucide-react';
import { Button } from '../shared/Button';
import { supabase } from '../../lib/supabase';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  whatsapp: string;
  referral_code: string;
  used_referral_code?: string;
  status: 'pending' | 'approved' | 'rejected';
  kyc_photos: any;
  contract_signed: boolean;
  welcome_bonus: number;
  quiz_earnings: number;
  referral_earnings: number;
  total_balance: number;
  withdrawable_amount: number;
  max_referrals: number;
  missions_completed: boolean;
  created_at: string;
}

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    if (filter === 'all') return true;
    return user.status === filter;
  });

  const approveUser = async (userId: string) => {
    try {
      const { error } = await supabase.rpc('approve_user', {
        p_user_id: userId
      });

      if (error) throw error;

      await fetchUsers();
      setSelectedUser(null);
      alert('User approved successfully!');
    } catch (error) {
      console.error('Error approving user:', error);
      alert('Failed to approve user');
    }
  };

  const rejectUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ status: 'rejected' })
        .eq('id', userId);

      if (error) throw error;

      await fetchUsers();
      setSelectedUser(null);
      alert('User rejected');
    } catch (error) {
      console.error('Error rejecting user:', error);
      alert('Failed to reject user');
    }
  };

  const openWhatsAppChat = (whatsappNumber: string) => {
    const message = encodeURIComponent('Hello! This is TrustMission support. How can we help you?');
    const cleanNumber = whatsappNumber.replace(/\D/g, '');
    const url = `https://wa.me/${cleanNumber}?text=${message}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">User Management</h2>
        
        {/* Filter Tabs */}
        <div className="flex rounded-lg bg-gray-800 p-1">
          {[
            { key: 'all', label: 'All Users', count: users.length },
            { key: 'pending', label: 'Pending', count: users.filter(u => u.status === 'pending').length },
            { key: 'approved', label: 'Approved', count: users.filter(u => u.status === 'approved').length },
            { key: 'rejected', label: 'Rejected', count: users.filter(u => u.status === 'rejected').length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                filter === tab.key
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Registration Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-700/30">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {user.first_name[0]}{user.last_name[0]}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-sm text-gray-400">{user.email}</div>
                        <div className="text-sm text-gray-400">{user.whatsapp}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-300">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.status === 'pending'
                        ? 'bg-yellow-600/20 text-yellow-300'
                        : user.status === 'approved'
                        ? 'bg-green-600/20 text-green-300'
                        : 'bg-red-600/20 text-red-300'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    €{user.total_balance.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Button
                      onClick={() => setSelectedUser(user)}
                      variant="ghost"
                      size="sm"
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => openWhatsAppChat(user.whatsapp)}
                      variant="ghost"
                      size="sm"
                      className="text-green-400 hover:text-green-300"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">
                User Details: {selectedUser.first_name} {selectedUser.last_name}
              </h3>
              <Button onClick={() => setSelectedUser(null)} variant="ghost" size="sm" className="text-gray-400">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h4 className="font-medium text-white">Personal Information</h4>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-300"><strong>Name:</strong> {selectedUser.first_name} {selectedUser.last_name}</p>
                  <p className="text-gray-300"><strong>Email:</strong> {selectedUser.email}</p>
                  <p className="text-gray-300"><strong>Date of Birth:</strong> {selectedUser.date_of_birth}</p>
                  <p className="text-gray-300"><strong>WhatsApp:</strong> {selectedUser.whatsapp}</p>
                  <p className="text-gray-300"><strong>Referral Code:</strong> {selectedUser.referral_code}</p>
                  {selectedUser.used_referral_code && (
                    <p className="text-gray-300"><strong>Used Referral:</strong> {selectedUser.used_referral_code}</p>
                  )}
                  <p className="text-gray-300"><strong>Status:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      selectedUser.status === 'pending'
                        ? 'bg-yellow-600/20 text-yellow-300'
                        : selectedUser.status === 'approved'
                        ? 'bg-green-600/20 text-green-300'
                        : 'bg-red-600/20 text-red-300'
                    }`}>
                      {selectedUser.status}
                    </span>
                  </p>
                </div>
              </div>

              {/* KYC Photos */}
              <div className="space-y-4">
                <h4 className="font-medium text-white">KYC Documents</h4>
                <div className="grid grid-cols-3 gap-2">
                  {selectedUser.kyc_photos?.idFront && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">ID Front</p>
                      <img 
                        src={selectedUser.kyc_photos.idFront} 
                        alt="ID Front" 
                        className="w-full h-24 object-cover rounded border border-gray-600"
                      />
                    </div>
                  )}
                  {selectedUser.kyc_photos?.idBack && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">ID Back</p>
                      <img 
                        src={selectedUser.kyc_photos.idBack} 
                        alt="ID Back" 
                        className="w-full h-24 object-cover rounded border border-gray-600"
                      />
                    </div>
                  )}
                  {selectedUser.kyc_photos?.selfie && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Selfie</p>
                      <img 
                        src={selectedUser.kyc_photos.selfie} 
                        alt="Selfie" 
                        className="w-full h-24 object-cover rounded border border-gray-600"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Earnings Information */}
            <div className="mt-6 pt-6 border-t border-gray-700">
              <h4 className="font-medium text-white mb-4">Earnings Summary</h4>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-3 bg-green-600/20 rounded-lg">
                  <p className="text-lg font-bold text-green-400">€{selectedUser.welcome_bonus.toFixed(2)}</p>
                  <p className="text-xs text-green-300">Welcome Bonus</p>
                </div>
                <div className="text-center p-3 bg-purple-600/20 rounded-lg">
                  <p className="text-lg font-bold text-purple-400">€{selectedUser.quiz_earnings.toFixed(2)}</p>
                  <p className="text-xs text-purple-300">Quiz Earnings</p>
                </div>
                <div className="text-center p-3 bg-orange-600/20 rounded-lg">
                  <p className="text-lg font-bold text-orange-400">€{selectedUser.referral_earnings.toFixed(2)}</p>
                  <p className="text-xs text-orange-300">Referral Earnings</p>
                </div>
                <div className="text-center p-3 bg-blue-600/20 rounded-lg">
                  <p className="text-lg font-bold text-blue-400">€{selectedUser.total_balance.toFixed(2)}</p>
                  <p className="text-xs text-blue-300">Total Balance</p>
                </div>
              </div>
            </div>

            {/* Admin Actions */}
            {selectedUser.status === 'pending' && (
              <div className="mt-6 pt-6 border-t border-gray-700">
                <h4 className="font-medium text-white mb-4">Admin Actions</h4>
                <div className="flex space-x-3">
                  <Button
                    onClick={() => approveUser(selectedUser.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve User
                  </Button>
                  <Button
                    onClick={() => rejectUser(selectedUser.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject User
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};