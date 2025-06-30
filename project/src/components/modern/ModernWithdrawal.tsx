import React, { useState } from 'react';
import { ArrowLeft, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';
import { FormField } from '../shared/FormField';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface ModernWithdrawalProps {
  onBack: () => void;
  balance: number;
}

export const ModernWithdrawal: React.FC<ModernWithdrawalProps> = ({ onBack, balance }) => {
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    accountHolder: user ? `${user.firstName} ${user.lastName}` : '',
    iban: '',
    bic: '',
    amount: Math.min(balance, 50)
  });

  const canWithdraw = balance >= 50;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'amount') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('withdrawal_requests')
        .insert({
          user_id: user.id,
          amount: formData.amount,
          account_holder: formData.accountHolder,
          iban: formData.iban.replace(/\s/g, '').toUpperCase(),
          bic: formData.bic.replace(/\s/g, '').toUpperCase()
        });

      if (error) throw error;

      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting withdrawal request:', error);
      alert('Failed to submit withdrawal request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!canWithdraw) {
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl md:rounded-3xl p-6 md:p-8 border border-gray-800 text-center">
            <div className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-orange-600/20 rounded-full mx-auto mb-4 md:mb-6">
              <AlertCircle className="w-6 h-6 md:w-8 md:h-8 text-orange-400" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold mb-4">Insufficient Balance</h2>
            <p className="text-gray-300 mb-6 text-sm md:text-base">
              You need at least €50 to request a withdrawal. Your current balance is €{balance.toFixed(2)}.
            </p>
            <Button onClick={onBack} className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl">
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl md:rounded-3xl p-6 md:p-8 border border-gray-800 text-center">
            <div className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-green-600/20 rounded-full mx-auto mb-4 md:mb-6">
              <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-green-400" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold mb-4">Withdrawal Requested</h2>
            <p className="text-gray-300 mb-6 text-sm md:text-base">
              Your withdrawal request for €{formData.amount.toFixed(2)} has been submitted. 
              You'll receive confirmation within 5-10 business days.
            </p>
            <Button onClick={onBack} className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl">
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
      
      <div className="relative z-10 p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center mb-6 md:mb-8">
          <Button variant="ghost" onClick={onBack} className="mr-4 text-gray-400 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Request Withdrawal</h1>
            <p className="text-gray-400 text-sm md:text-base">Withdraw your earnings via bank transfer</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Balance Card */}
          <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-2xl md:rounded-3xl p-4 md:p-6 mb-6 md:mb-8 text-black">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-4 md:mb-0">
                <p className="text-sm font-medium opacity-80 mb-1">Available Balance</p>
                <p className="text-2xl md:text-3xl font-bold">€{balance.toFixed(2)}</p>
              </div>
              <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-xl md:rounded-2xl">
                <CreditCard className="w-5 h-5 md:w-6 md:h-6" />
              </div>
            </div>
          </div>

          {/* Withdrawal Form */}
          <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl md:rounded-3xl p-6 md:p-8 border border-gray-800">
            <h3 className="text-lg md:text-xl font-bold mb-6 text-white">Bank Details</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <FormField label="Account Holder Name">
                <Input
                  name="accountHolder"
                  value={formData.accountHolder}
                  onChange={handleInputChange}
                  placeholder="Full name on bank account"
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 rounded-xl"
                  required
                />
              </FormField>

              <FormField label="IBAN">
                <Input
                  name="iban"
                  value={formData.iban}
                  onChange={handleInputChange}
                  placeholder="DE89 3704 0044 0532 0130 00"
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 rounded-xl font-mono"
                  required
                />
              </FormField>

              <FormField label="BIC/SWIFT Code">
                <Input
                  name="bic"
                  value={formData.bic}
                  onChange={handleInputChange}
                  placeholder="COBADEFFXXX"
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 rounded-xl font-mono uppercase"
                  required
                />
              </FormField>

              <FormField label="Withdrawal Amount (€)">
                <Input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  min="50"
                  max={balance}
                  step="0.01"
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 rounded-xl"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  Minimum €50, Maximum €{balance.toFixed(2)}
                </p>
              </FormField>

              <div className="bg-blue-600/20 border border-blue-500/30 rounded-xl md:rounded-2xl p-4 md:p-6">
                <h4 className="font-semibold text-blue-300 mb-3">💳 Important Information</h4>
                <ul className="text-sm text-gray-300 space-y-2">
                  <li>• Processing time: 5-10 business days</li>
                  <li>• No fees charged by TrustMission</li>
                  <li>• SEPA transfers only (European Union)</li>
                  <li>• Email confirmation when processed</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  type="button"
                  onClick={onBack}
                  variant="secondary"
                  className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  loading={loading}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-xl font-semibold"
                >
                  Submit Request
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};