import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye, X } from 'lucide-react';
import { Button } from '../shared/Button';
import { supabase } from '../../lib/supabase';

interface WithdrawalRequest {
  id: string;
  user_id: string;
  amount: number;
  account_holder: string;
  iban: string;
  bic: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  requested_at: string;
  processed_at?: string;
  users?: {
    first_name: string;
    last_name: string;
    email: string;
    total_balance: number;
  };
}

export const WithdrawalManagement: React.FC = () => {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select(`
          *,
          users(first_name, last_name, email, total_balance)
        `)
        .order('requested_at', { ascending: false });

      if (error) throw error;
      setWithdrawals(data || []);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredWithdrawals = withdrawals.filter(withdrawal => {
    if (filter === 'all') return true;
    return withdrawal.status === filter;
  });

  const processWithdrawal = async (withdrawalId: string, status: 'approved' | 'rejected', notes?: string) => {
    try {
      const { error } = await supabase
        .from('withdrawal_requests')
        .update({ 
          status, 
          admin_notes: notes,
          processed_at: new Date().toISOString()
        })
        .eq('id', withdrawalId);

      if (error) throw error;

      await fetchWithdrawals();
      setSelectedWithdrawal(null);
      alert(`Withdrawal ${status} successfully!`);
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      alert('Failed to process withdrawal');
    }
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
        <h2 className="text-2xl font-bold text-white">Withdrawal Management</h2>
        
        {/* Filter Tabs */}
        <div className="flex rounded-lg bg-gray-800 p-1">
          {[
            { key: 'all', label: 'All', count: withdrawals.length },
            { key: 'pending', label: 'Pending', count: withdrawals.filter(w => w.status === 'pending').length },
            { key: 'approved', label: 'Approved', count: withdrawals.filter(w => w.status === 'approved').length },
            { key: 'rejected', label: 'Rejected', count: withdrawals.filter(w => w.status === 'rejected').length },
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

      {/* Withdrawals Table */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Bank Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Request Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredWithdrawals.map((withdrawal) => (
                <tr key={withdrawal.id} className="hover:bg-gray-700/30">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {withdrawal.users?.first_name?.[0]}{withdrawal.users?.last_name?.[0]}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">
                          {withdrawal.users?.first_name} {withdrawal.users?.last_name}
                        </div>
                        <div className="text-sm text-gray-400">{withdrawal.users?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">
                      €{withdrawal.amount.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">
                      <div className="font-medium">{withdrawal.account_holder}</div>
                      <div className="text-gray-400 font-mono text-xs">
                        {withdrawal.iban}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {new Date(withdrawal.requested_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      withdrawal.status === 'pending'
                        ? 'bg-yellow-600/20 text-yellow-300'
                        : withdrawal.status === 'approved'
                        ? 'bg-green-600/20 text-green-300'
                        : 'bg-red-600/20 text-red-300'
                    }`}>
                      {withdrawal.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Button
                      onClick={() => setSelectedWithdrawal(withdrawal)}
                      variant="ghost"
                      size="sm"
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {withdrawal.status === 'pending' && (
                      <>
                        <Button
                          onClick={() => processWithdrawal(withdrawal.id, 'approved')}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => processWithdrawal(withdrawal.id, 'rejected')}
                          size="sm"
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Withdrawal Detail Modal */}
      {selectedWithdrawal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-2xl border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">
                Withdrawal Request Details
              </h3>
              <Button onClick={() => setSelectedWithdrawal(null)} variant="ghost" size="sm" className="text-gray-400">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* User Information */}
              <div>
                <h4 className="font-medium text-white mb-3">User Information</h4>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-300"><strong>Name:</strong> {selectedWithdrawal.users?.first_name} {selectedWithdrawal.users?.last_name}</p>
                    <p className="text-gray-300"><strong>Email:</strong> {selectedWithdrawal.users?.email}</p>
                    <p className="text-gray-300"><strong>Current Balance:</strong> €{selectedWithdrawal.users?.total_balance?.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Withdrawal Details */}
              <div>
                <h4 className="font-medium text-white mb-3">Withdrawal Details</h4>
                <div className="bg-gray-800/50 p-4 rounded-lg space-y-2 text-sm">
                  <p className="text-gray-300"><strong>Amount:</strong> €{selectedWithdrawal.amount.toFixed(2)}</p>
                  <p className="text-gray-300"><strong>Request Date:</strong> {new Date(selectedWithdrawal.requested_at).toLocaleString()}</p>
                  <p className="text-gray-300">
                    <strong>Status:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      selectedWithdrawal.status === 'pending'
                        ? 'bg-yellow-600/20 text-yellow-300'
                        : selectedWithdrawal.status === 'approved'
                        ? 'bg-green-600/20 text-green-300'
                        : 'bg-red-600/20 text-red-300'
                    }`}>
                      {selectedWithdrawal.status}
                    </span>
                  </p>
                  {selectedWithdrawal.processed_at && (
                    <p className="text-gray-300"><strong>Processed:</strong> {new Date(selectedWithdrawal.processed_at).toLocaleString()}</p>
                  )}
                  {selectedWithdrawal.admin_notes && (
                    <p className="text-gray-300"><strong>Admin Notes:</strong> {selectedWithdrawal.admin_notes}</p>
                  )}
                </div>
              </div>

              {/* Bank Details */}
              <div>
                <h4 className="font-medium text-white mb-3">Bank Details</h4>
                <div className="bg-gray-800/50 p-4 rounded-lg space-y-2 text-sm">
                  <p className="text-gray-300"><strong>Account Holder:</strong> {selectedWithdrawal.account_holder}</p>
                  <p className="text-gray-300"><strong>IBAN:</strong> <span className="font-mono">{selectedWithdrawal.iban}</span></p>
                  <p className="text-gray-300"><strong>BIC:</strong> <span className="font-mono">{selectedWithdrawal.bic}</span></p>
                </div>
              </div>

              {/* Admin Actions */}
              {selectedWithdrawal.status === 'pending' && (
                <div className="flex space-x-3 pt-4 border-t border-gray-700">
                  <Button
                    onClick={() => processWithdrawal(selectedWithdrawal.id, 'approved')}
                    className="bg-green-600 hover:bg-green-700 flex-1"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve & Process
                  </Button>
                  <Button
                    onClick={() => processWithdrawal(selectedWithdrawal.id, 'rejected')}
                    className="bg-red-600 hover:bg-red-700 flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Request
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};