import React, { useState } from 'react';
import { ArrowLeft, Users, Copy, Share2, CheckCircle } from 'lucide-react';
import { Button } from '../shared/Button';

interface ModernReferralProps {
  onBack: () => void;
}

export const ModernReferral: React.FC<ModernReferralProps> = ({ onBack }) => {
  const [copied, setCopied] = useState(false);
  
  const referralCode = 'ALEX2024';
  const referralLink = `https://trustmission.com/register?ref=${referralCode}`;
  const referralCount = 3;
  const maxReferrals = 5;
  const earnings = 60; // 3 referrals × €20

  const copyReferralCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const shareViaWhatsApp = () => {
    const message = encodeURIComponent(
      `🚀 Join me on TrustMission and start earning money!\n\n` +
      `✅ €15 welcome bonus\n` +
      `✅ €7.15 per quiz (5 quizzes total)\n` +
      `✅ €20 referral bonus for me\n\n` +
      `Use my code: ${referralCode}\n` +
      `${referralLink}`
    );
    
    const url = `https://wa.me/?text=${message}`;
    window.open(url, '_blank');
  };

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
            <h1 className="text-xl md:text-2xl font-bold">Referral Program</h1>
            <p className="text-gray-400 text-sm md:text-base">Earn €20 for each successful referral</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto space-y-6 md:space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            <div className="bg-gray-900/50 rounded-xl md:rounded-2xl p-3 md:p-4 border border-gray-800 text-center">
              <Users className="w-5 h-5 md:w-6 md:h-6 text-purple-500 mx-auto mb-2" />
              <p className="text-lg md:text-2xl font-bold text-purple-400">{referralCount}</p>
              <p className="text-xs text-gray-400">Referrals</p>
            </div>
            <div className="bg-gray-900/50 rounded-xl md:rounded-2xl p-3 md:p-4 border border-gray-800 text-center">
              <p className="text-lg md:text-2xl font-bold text-green-400">€{earnings}</p>
              <p className="text-xs text-gray-400">Earned</p>
            </div>
            <div className="bg-gray-900/50 rounded-xl md:rounded-2xl p-3 md:p-4 border border-gray-800 text-center">
              <p className="text-lg md:text-2xl font-bold text-orange-400">{maxReferrals - referralCount}</p>
              <p className="text-xs text-gray-400">Remaining</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-gray-900/50 rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-800">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Referral Progress</span>
              <span>{referralCount} / {maxReferrals}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-purple-600 to-purple-700 h-3 rounded-full transition-all duration-300"
                style={{ width: `${(referralCount / maxReferrals) * 100}%` }}
              />
            </div>
          </div>

          {/* Referral Code */}
          <div className="bg-gray-900/50 rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-800">
            <h3 className="text-lg font-semibold mb-4">Your Referral Code</h3>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
              <div className="flex-1 w-full p-3 md:p-4 bg-gray-800 border border-gray-700 rounded-xl font-mono text-lg md:text-xl font-bold text-purple-400 text-center">
                {referralCode}
              </div>
              <Button onClick={copyReferralCode} className="bg-purple-600 hover:bg-purple-700 rounded-xl px-4 py-3 md:py-4 w-full sm:w-auto">
                {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                <span className="ml-2 sm:hidden">{copied ? 'Copied!' : 'Copy'}</span>
              </Button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-400 mb-2">Referral Link</label>
              <div className="p-3 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-300 break-all">
                {referralLink}
              </div>
            </div>

            <Button 
              onClick={shareViaWhatsApp}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-xl py-3 font-semibold"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share via WhatsApp
            </Button>
          </div>

          {/* How it Works */}
          <div className="bg-blue-600/20 border border-blue-500/30 rounded-xl md:rounded-2xl p-4 md:p-6">
            <h3 className="font-semibold text-blue-300 mb-4">🎯 How Referrals Work</h3>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                <p>Share your referral code with friends</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                <p>They register using your code</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                <p>You earn €20 when they complete all missions</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">4</div>
                <p>Both of you benefit from the platform!</p>
              </div>
            </div>
          </div>

          {/* Recent Referrals */}
          <div className="bg-gray-900/50 rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-800">
            <h3 className="text-lg font-semibold mb-4">Recent Referrals</h3>
            
            <div className="space-y-3">
              {[
                { name: 'John D.', status: 'Completed', earned: '€20', date: '2 days ago' },
                { name: 'Sarah M.', status: 'In Progress', earned: '€0', date: '1 week ago' },
                { name: 'Mike R.', status: 'Completed', earned: '€20', date: '2 weeks ago' }
              ].map((referral, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-white">{referral.name}</p>
                    <p className="text-sm text-gray-400">{referral.date}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className={`text-sm font-medium ${
                      referral.status === 'Completed' ? 'text-green-400' : 'text-yellow-400'
                    }`}>
                      {referral.status}
                    </p>
                    <p className="text-sm text-gray-400">{referral.earned}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};