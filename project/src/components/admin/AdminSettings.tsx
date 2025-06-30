import React, { useState, useEffect } from 'react';
import { Save, Settings as SettingsIcon, Database, Users, Brain, CreditCard } from 'lucide-react';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';
import { FormField } from '../shared/FormField';
import { supabase } from '../../lib/supabase';

interface AdminSettingsData {
  max_referrals: number;
  min_withdrawal: number;
  quiz_reward: number;
  referral_reward: number;
  welcome_bonus: number;
  completion_message: string;
  appointment_enabled: boolean;
  support_whatsapp_number: string;
}

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<AdminSettingsData>({
    max_referrals: 3,
    min_withdrawal: 50,
    quiz_reward: 7.15,
    referral_reward: 20,
    welcome_bonus: 15,
    completion_message: '',
    appointment_enabled: true,
    support_whatsapp_number: ''
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalQuizzes: 0,
    totalWithdrawals: 0,
    totalEarnings: 0
  });

  useEffect(() => {
    fetchSettings();
    fetchStats();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('key, value');

      if (error) throw error;

      const settingsMap: any = {};
      data?.forEach(setting => {
        try {
          settingsMap[setting.key] = typeof setting.value === 'string' 
            ? JSON.parse(setting.value) 
            : setting.value;
        } catch {
          settingsMap[setting.key] = setting.value;
        }
      });

      setSettings(prev => ({ ...prev, ...settingsMap }));
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [usersRes, quizzesRes, withdrawalsRes] = await Promise.all([
        supabase.from('users').select('total_balance'),
        supabase.from('quizzes').select('id'),
        supabase.from('withdrawal_requests').select('amount')
      ]);

      const totalUsers = usersRes.data?.length || 0;
      const totalQuizzes = quizzesRes.data?.length || 0;
      const totalWithdrawals = withdrawalsRes.data?.length || 0;
      const totalEarnings = usersRes.data?.reduce((sum, user) => sum + (user.total_balance || 0), 0) || 0;

      setStats({
        totalUsers,
        totalQuizzes,
        totalWithdrawals,
        totalEarnings
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : 
               type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update each setting
      const updates = Object.entries(settings).map(([key, value]) => ({
        key,
        value: JSON.stringify(value)
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('admin_settings')
          .upsert(update, { onConflict: 'key' });

        if (error) throw error;
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
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
        <div className="flex items-center">
          <div className="flex items-center justify-center w-10 h-10 bg-gray-700 rounded-lg mr-3">
            <SettingsIcon className="w-5 h-5 text-gray-300" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Platform Settings</h2>
            <p className="text-gray-400">Configure platform parameters and rewards</p>
          </div>
        </div>
        
        <Button onClick={fetchStats} variant="secondary" size="sm">
          Refresh Stats
        </Button>
      </div>

      {/* Platform Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
              <p className="text-sm text-gray-400">Total Quizzes</p>
              <p className="text-2xl font-bold text-white">{stats.totalQuizzes}</p>
            </div>
            <Brain className="w-8 h-8 text-purple-400" />
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Withdrawals</p>
              <p className="text-2xl font-bold text-white">{stats.totalWithdrawals}</p>
            </div>
            <CreditCard className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Earnings</p>
              <p className="text-2xl font-bold text-white">€{stats.totalEarnings.toFixed(2)}</p>
            </div>
            <Database className="w-8 h-8 text-orange-400" />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Referral Settings */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Referral Settings</h3>
          <div className="space-y-4">
            <FormField label="Maximum Referrals per User">
              <Input
                type="number"
                name="max_referrals"
                value={settings.max_referrals}
                onChange={handleInputChange}
                min="0"
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 rounded-xl"
              />
              <p className="text-xs text-gray-400 mt-1">
                Set to 0 for unlimited referrals
              </p>
            </FormField>

            <FormField label="Referral Reward (€)">
              <Input
                type="number"
                name="referral_reward"
                value={settings.referral_reward}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 rounded-xl"
              />
              <p className="text-xs text-gray-400 mt-1">
                Amount earned per successful referral
              </p>
            </FormField>
          </div>
        </div>

        {/* Quiz & Reward Settings */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Quiz & Rewards</h3>
          <div className="space-y-4">
            <FormField label="Quiz Reward (€)">
              <Input
                type="number"
                name="quiz_reward"
                value={settings.quiz_reward}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 rounded-xl"
              />
              <p className="text-xs text-gray-400 mt-1">
                Amount earned per completed quiz
              </p>
            </FormField>

            <FormField label="Welcome Bonus (€)">
              <Input
                type="number"
                name="welcome_bonus"
                value={settings.welcome_bonus}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 rounded-xl"
              />
              <p className="text-xs text-gray-400 mt-1">
                One-time bonus for approved users
              </p>
            </FormField>
          </div>
        </div>

        {/* Withdrawal Settings */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Withdrawal Settings</h3>
          <div className="space-y-4">
            <FormField label="Minimum Withdrawal Amount (€)">
              <Input
                type="number"
                name="min_withdrawal"
                value={settings.min_withdrawal}
                onChange={handleInputChange}
                min="1"
                step="0.01"
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 rounded-xl"
              />
              <p className="text-xs text-gray-400 mt-1">
                Minimum amount users can withdraw
              </p>
            </FormField>
          </div>
        </div>

        {/* Support Settings */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Support Settings</h3>
          <div className="space-y-4">
            <FormField label="Support WhatsApp Number">
              <Input
                type="tel"
                name="support_whatsapp_number"
                value={settings.support_whatsapp_number}
                onChange={handleInputChange}
                placeholder="+1234567890"
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 rounded-xl"
              />
              <p className="text-xs text-gray-400 mt-1">
                WhatsApp number for user support
              </p>
            </FormField>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="appointment_enabled"
                checked={settings.appointment_enabled}
                onChange={handleInputChange}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-600 rounded bg-gray-700"
              />
              <label className="ml-2 text-sm text-gray-300">Enable appointment booking</label>
            </div>
          </div>
        </div>
      </div>

      {/* Completion Message */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Mission Completion Message</h3>
        <FormField label="Message shown when users complete all missions">
          <textarea
            name="completion_message"
            value={settings.completion_message}
            onChange={handleInputChange}
            rows={4}
            placeholder="Enter the message to show users when they complete all missions..."
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </FormField>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} className="min-w-32 bg-red-600 hover:bg-red-700">
          {saved ? (
            <>
              <Save className="w-4 h-4 mr-2" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>

      {/* Current Configuration Summary */}
      <div className="bg-blue-600/20 border border-blue-500/30 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-300 mb-4">Earning Potential Summary</h3>
        <div className="grid md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-400">
              €{settings.welcome_bonus.toFixed(2)}
            </p>
            <p className="text-sm text-blue-300">Welcome Bonus</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-400">
              €{(settings.quiz_reward * 7).toFixed(2)}
            </p>
            <p className="text-sm text-blue-300">Total Quiz Earnings</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-400">
              €{(settings.welcome_bonus + (settings.quiz_reward * 7)).toFixed(2)}
            </p>
            <p className="text-sm text-blue-300">Maximum Base Earnings</p>
          </div>
        </div>
        <p className="text-xs text-blue-300 text-center mt-3">
          Plus €{settings.referral_reward.toFixed(2)} per successful referral
        </p>
      </div>
    </div>
  );
};