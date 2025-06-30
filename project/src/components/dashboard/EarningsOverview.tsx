import React from 'react';
import { Euro, TrendingUp, Wallet, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../shared/Card';
import { Button } from '../shared/Button';

export const EarningsOverview: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const canWithdraw = user.withdrawableAmount >= 50;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Welcome back, {user.firstName}! 👋
        </h2>
        <p className="text-gray-600">Here's your earning overview</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Total Balance */}
        <Card>
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
              <Euro className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Balance</p>
              <p className="text-2xl font-bold text-gray-900">€{user.totalBalance.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        {/* Welcome Bonus */}
        <Card>
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Welcome Bonus</p>
              <p className="text-2xl font-bold text-green-600">€{user.welcomeBonus.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        {/* Quiz Earnings */}
        <Card>
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Quiz Earnings</p>
              <p className="text-2xl font-bold text-purple-600">€{user.quizEarnings.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        {/* Referral Earnings */}
        <Card>
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Referral Earnings</p>
              <p className="text-2xl font-bold text-orange-600">€{user.referralEarnings.toFixed(2)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Withdrawal Section */}
      <Card className="mt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg">
              <Wallet className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Withdrawable Amount</h3>
              <p className="text-3xl font-bold text-indigo-600">€{user.withdrawableAmount.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-1">
                {canWithdraw 
                  ? 'Ready for withdrawal!' 
                  : `€${(50 - user.withdrawableAmount).toFixed(2)} more needed (minimum €50)`
                }
              </p>
            </div>
          </div>
          
          <Button 
            onClick={() => navigate('/withdrawal')}
            disabled={!canWithdraw}
            className={!canWithdraw ? 'opacity-50 cursor-not-allowed' : ''}
          >
            Request Withdrawal
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </Card>
    </div>
  );
};