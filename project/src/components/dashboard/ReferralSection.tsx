import React, { useState } from 'react';
import { Users, Copy, Share2, CheckCircle, ExternalLink } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { adminSettings } from '../../data/mockData';
import { Card } from '../shared/Card';
import { Button } from '../shared/Button';

export const ReferralSection: React.FC = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  if (!user) return null;

  const referralLink = `https://trustmission.com/register?ref=${user.referralCode}`;
  const referralCount = user.referredUsers.length;
  const maxReferrals = adminSettings.maxReferrals;
  const canRefer = maxReferrals === 0 || referralCount < maxReferrals;

  const copyReferralCode = async () => {
    try {
      await navigator.clipboard.writeText(user.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const shareViaWhatsApp = () => {
    const message = encodeURIComponent(
      `🚀 Join me on TrustMission and start earning money by completing simple quizzes!\n\n` +
      `✅ €15 welcome bonus\n` +
      `✅ €7.15 per quiz (7 quizzes total)\n` +
      `✅ €20 referral bonus for me when you complete all quizzes\n\n` +
      `Use my referral code: ${user.referralCode}\n` +
      `Or register directly: ${referralLink}`
    );
    
    const url = `https://wa.me/?text=${message}`;
    window.open(url, '_blank');
  };

  return (
    <Card>
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-lg mr-3">
            <Users className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Referral Program</h3>
            <p className="text-sm text-gray-600">Earn €20 for each successful referral</p>
          </div>
        </div>

        {/* Referral Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <p className="text-2xl font-bold text-orange-600">{referralCount}</p>
            <p className="text-sm text-orange-700">Referred Users</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">€{user.referralEarnings.toFixed(2)}</p>
            <p className="text-sm text-green-700">Referral Earnings</p>
          </div>
        </div>

        {/* Referral Limit */}
        {maxReferrals > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Referral Progress</span>
              <span>{referralCount} / {maxReferrals}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((referralCount / maxReferrals) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {canRefer ? (
        <div className="space-y-4">
          {/* Referral Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Referral Code
            </label>
            <div className="flex items-center space-x-2">
              <div className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-lg font-mono text-lg font-semibold text-gray-900">
                {user.referralCode}
              </div>
              <Button onClick={copyReferralCode} variant="secondary" size="sm">
                {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Referral Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Referral Link
            </label>
            <div className="flex items-center space-x-2">
              <div className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 truncate">
                {referralLink}
              </div>
              <Button onClick={copyReferralLink} variant="secondary" size="sm">
                {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Share Actions */}
          <div className="flex space-x-3">
            <Button onClick={shareViaWhatsApp} variant="success" className="flex-1">
              <Share2 className="w-4 h-4 mr-2" />
              Share via WhatsApp
            </Button>
          </div>

          {/* Referral Info */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Share your referral code with friends</li>
              <li>• They register using your code</li>
              <li>• You earn €20 when they complete all 7 quizzes</li>
              <li>• Both of you benefit from the platform!</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="font-medium text-gray-900 mb-2">Referral Limit Reached</h4>
          <p className="text-sm text-gray-600">
            You've reached the maximum number of referrals ({maxReferrals}). 
            Great job helping grow the TrustMission community!
          </p>
        </div>
      )}
    </Card>
  );
};